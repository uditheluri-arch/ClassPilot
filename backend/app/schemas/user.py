from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field, ConfigDict

class LoginRequest(BaseModel):
    role: Optional[str] = Field(default=None, description="Optional role context: STUDENT or FACULTY")
    identifier: str = Field(..., min_length=1, description="Student Roll Number or Faculty Employee ID / Email")
    password: str = Field(..., min_length=1, description="Account password")

class UserProfileResponse(BaseModel):
    id: int
    username: str
    email: Optional[str] = None
    role: str
    is_active: bool
    full_name: str
    identifier: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class StudentProfileResponse(BaseModel):
    id: int
    user_id: int
    roll_number: str
    full_name: str
    username: str
    email: Optional[str] = None
    role: str
    is_active: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class FacultyProfileResponse(BaseModel):
    id: int
    user_id: int
    employee_id: str
    full_name: str
    username: str
    email: Optional[str] = None
    role: str
    is_active: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    role: str
    user: UserProfileResponse

class MessageResponse(BaseModel):
    message: str
