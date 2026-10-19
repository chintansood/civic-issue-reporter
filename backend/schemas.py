import datetime
from typing import Optional, List, Any
from pydantic import BaseModel, EmailStr

# Auth Schemas
class UserSignup(BaseModel):
    name: str
    email: EmailStr
    password: str
    phone: Optional[str] = None
    role: str = "citizen"  # citizen, staff, admin
    department_id: Optional[int] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserOut(BaseModel):
    user_id: int
    name: str
    email: str
    phone: Optional[str] = None
    role: str
    department_id: Optional[int] = None
    department_name: Optional[str] = None
    created_at: datetime.datetime

    class Config:
        from_attributes = True

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut

# Department Schemas
class DepartmentOut(BaseModel):
    dept_id: int
    name: str
    issue_types: List[str]
    head_name: str
    contact_email: str

    class Config:
        from_attributes = True

# Detection Schemas
class DetectionItem(BaseModel):
    issue_type: str
    confidence: float
    severity: str
    bbox: List[int]
    department: str
    cost_min: int
    cost_max: int

class DetectResponse(BaseModel):
    detections: List[DetectionItem]
    result_image: str  # base64 encoded
    location: dict
    duplicate_warning: Optional[str] = None
    duplicate_count: int = 0
    duplicate_of: Optional[str] = None
    estimated_cost_range: str
    top_issue: str
    top_severity: str
    top_department: str
    urgency_score: int

# Report Schemas
class ReportSubmit(BaseModel):
    image_b64: Optional[str] = None  # Or sent via multipart
    latitude: float
    longitude: float
    location_name: Optional[str] = None
    issue_type: str
    confidence: float
    severity: str
    department_id: Optional[int] = None
    urgency_score: int
    cost_estimate_min: int
    cost_estimate_max: int
    description: Optional[str] = None
    result_image_b64: Optional[str] = None
    duplicate_of: Optional[str] = None
    duplicate_count: int = 0

class StatusHistoryOut(BaseModel):
    history_id: int
    old_status: Optional[str] = None
    new_status: str
    changed_by: str
    notes: Optional[str] = None
    changed_at: datetime.datetime

    class Config:
        from_attributes = True

class ReportOut(BaseModel):
    report_id: str
    user_id: Optional[int] = None
    image_url: str
    result_image_url: Optional[str] = None
    result_image_b64: Optional[str] = None
    issue_type: str
    confidence: float
    severity: str
    latitude: float
    longitude: float
    location_name: Optional[str] = None
    status: str
    department_id: Optional[int] = None
    department_name: Optional[str] = None
    urgency_score: int
    duplicate_of: Optional[str] = None
    duplicate_count: int = 0
    cost_estimate_min: int
    cost_estimate_max: int
    description: Optional[str] = None
    staff_notes: Optional[str] = None
    created_at: datetime.datetime
    updated_at: datetime.datetime
    resolved_at: Optional[datetime.datetime] = None

    class Config:
        from_attributes = True

class ReportDetailOut(ReportOut):
    status_history: List[StatusHistoryOut] = []
    user_name: Optional[str] = None
    user_email: Optional[str] = None
    duplicate_reports: List[ReportOut] = []

class StatusUpdate(BaseModel):
    status: str  # pending, in_progress, resolved, rejected
    notes: Optional[str] = None

class ReportMapItem(BaseModel):
    report_id: str
    issue_type: str
    severity: str
    status: str
    latitude: float
    longitude: float
    location_name: Optional[str] = None
    urgency_score: int
    image_url: str
    created_at: datetime.datetime

# Stats Schemas
class OverviewStats(BaseModel):
    total_reports: int
    resolved_reports: int
    pending_reports: int
    in_progress_reports: int
    cities_covered: int
    resolution_rate: float
    avg_resolution_time_hours: float
    active_departments: int

class AnalyticsStats(BaseModel):
    reports_by_type: List[dict]
    reports_over_time: List[dict]
    dept_resolution_rates: List[dict]
    top_locations: List[dict]

# Notification Schemas
class NotificationOut(BaseModel):
    notif_id: int
    report_id: Optional[str] = None
    message: str
    type: str
    is_read: bool
    created_at: datetime.datetime

    class Config:
        from_attributes = True
