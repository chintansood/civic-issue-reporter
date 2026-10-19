from typing import List
from fastapi import APIRouter, Depends, HTTPException, status, Response, Request
from sqlalchemy.orm import Session

from backend.database import get_db
from backend.models import User, Department, Notification
from backend.schemas import UserSignup, UserLogin, UserOut, TokenResponse, NotificationOut
from backend.auth import hash_password, verify_password, create_access_token, get_current_user

router = APIRouter(prefix="/auth", tags=["Auth"])

def user_to_out(user: User) -> UserOut:
    dept_name = user.department.name if user.department else None
    return UserOut(
        user_id=user.user_id,
        name=user.name,
        email=user.email,
        phone=user.phone,
        role=user.role,
        department_id=user.department_id,
        department_name=dept_name,
        created_at=user.created_at
    )

@router.post("/signup", response_model=TokenResponse)
def signup(data: UserSignup, response: Response, db: Session = Depends(get_db)):
    # Check if user already exists
    existing = db.query(User).filter(User.email == data.email.lower()).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email already exists. Please log in instead."
        )

    # Department validation for staff
    dept_id = data.department_id
    if data.role == "staff" and not dept_id:
        # Default to first department if not specified
        first_dept = db.query(Department).first()
        dept_id = first_dept.dept_id if first_dept else None

    new_user = User(
        name=data.name.strip(),
        email=data.email.lower().strip(),
        password_hash=hash_password(data.password),
        phone=data.phone.strip() if data.phone else None,
        role=data.role.lower(),
        department_id=dept_id
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    # Create welcome notification
    welcome_notif = Notification(
        user_id=new_user.user_id,
        message=f"Welcome to CivicScan, {new_user.name}! Your account is active.",
        type="welcome"
    )
    db.add(welcome_notif)
    db.commit()

    # Generate JWT token
    token = create_access_token(data={"sub": str(new_user.user_id), "role": new_user.role})

    # Set httpOnly cookie
    response.set_cookie(
        key="access_token",
        value=token,
        httponly=True,
        max_age=7 * 24 * 3600,
        samesite="lax",
        secure=False  # Allow localhost development
    )

    return TokenResponse(
        access_token=token,
        token_type="bearer",
        user=user_to_out(new_user)
    )

@router.post("/login", response_model=TokenResponse)
def login(data: UserLogin, response: Response, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == data.email.lower().strip()).first()
    if not user or not verify_password(data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password. Please try again."
        )

    token = create_access_token(data={"sub": str(user.user_id), "role": user.role})

    response.set_cookie(
        key="access_token",
        value=token,
        httponly=True,
        max_age=7 * 24 * 3600,
        samesite="lax",
        secure=False
    )

    return TokenResponse(
        access_token=token,
        token_type="bearer",
        user=user_to_out(user)
    )

@router.post("/logout")
def logout(response: Response):
    response.delete_cookie("access_token")
    return {"message": "Successfully logged out"}

@router.get("/me", response_model=UserOut)
def get_me(current_user: User = Depends(get_current_user)):
    return user_to_out(current_user)

@router.get("/notifications", response_model=List[NotificationOut])
def get_notifications(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    notifs = db.query(Notification).filter(
        Notification.user_id == current_user.user_id
    ).order_by(Notification.created_at.desc()).limit(20).all()
    return notifs

@router.patch("/notifications/{notif_id}/read")
def mark_notification_read(
    notif_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    notif = db.query(Notification).filter(
        Notification.notif_id == notif_id,
        Notification.user_id == current_user.user_id
    ).first()
    if notif:
        notif.is_read = True
        db.commit()
    return {"success": True}
