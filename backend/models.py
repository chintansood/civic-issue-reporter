import datetime
from sqlalchemy import Column, Integer, String, Float, Text, Boolean, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from backend.database import Base

class User(Base):
    __tablename__ = "users"

    user_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String(120), nullable=False)
    email = Column(String(150), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    phone = Column(String(30), nullable=True)
    role = Column(String(30), nullable=False, default="citizen")  # citizen, staff, admin
    department_id = Column(Integer, ForeignKey("departments.dept_id"), nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    # Relationships
    department = relationship("Department", back_populates="staff_members")
    reports = relationship("Report", back_populates="user")
    notifications = relationship("Notification", back_populates="user")

class Department(Base):
    __tablename__ = "departments"

    dept_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String(150), unique=True, nullable=False)
    issue_types = Column(JSON, nullable=False, default=[])  # e.g. ["road_damage"]
    head_name = Column(String(120), nullable=False)
    contact_email = Column(String(150), nullable=False)

    # Relationships
    staff_members = relationship("User", back_populates="department")
    reports = relationship("Report", back_populates="department")

class Report(Base):
    __tablename__ = "reports"

    report_id = Column(String(16), primary_key=True, index=True)  # e.g. "A3F9B2" or "CS-A3F9B2"
    user_id = Column(Integer, ForeignKey("users.user_id"), nullable=True)
    image_url = Column(String(500), nullable=False)
    result_image_url = Column(String(500), nullable=True)
    result_image_b64 = Column(Text, nullable=True)
    
    issue_type = Column(String(80), nullable=False)  # road_damage, garbage, waterlogging
    confidence = Column(Float, nullable=False, default=0.0)
    severity = Column(String(20), nullable=False, default="Medium")  # High, Medium, Low
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    location_name = Column(String(255), nullable=True)
    
    status = Column(String(30), nullable=False, default="pending")  # pending, in_progress, resolved, rejected
    department_id = Column(Integer, ForeignKey("departments.dept_id"), nullable=True)
    urgency_score = Column(Integer, default=50)  # 0-100
    
    duplicate_of = Column(String(16), nullable=True)
    duplicate_count = Column(Integer, default=0)
    cost_estimate_min = Column(Integer, default=0)
    cost_estimate_max = Column(Integer, default=0)
    
    description = Column(Text, nullable=True)
    staff_notes = Column(Text, nullable=True)
    
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)
    resolved_at = Column(DateTime, nullable=True)

    # Relationships
    user = relationship("User", back_populates="reports")
    department = relationship("Department", back_populates="reports")
    status_history = relationship("StatusHistory", back_populates="report", cascade="all, delete-orphan", order_by="StatusHistory.changed_at")
    notifications = relationship("Notification", back_populates="report")

class StatusHistory(Base):
    __tablename__ = "status_history"

    history_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    report_id = Column(String(16), ForeignKey("reports.report_id"), nullable=False, index=True)
    old_status = Column(String(30), nullable=True)
    new_status = Column(String(30), nullable=False)
    changed_by = Column(String(120), nullable=False)
    notes = Column(Text, nullable=True)
    changed_at = Column(DateTime, default=datetime.datetime.utcnow)

    # Relationships
    report = relationship("Report", back_populates="status_history")

class Notification(Base):
    __tablename__ = "notifications"

    notif_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.user_id"), nullable=False, index=True)
    report_id = Column(String(16), ForeignKey("reports.report_id"), nullable=True)
    message = Column(String(255), nullable=False)
    type = Column(String(50), nullable=False, default="info")  # status_change, report_submitted, assignment
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="notifications")
    report = relationship("Report", back_populates="notifications")
