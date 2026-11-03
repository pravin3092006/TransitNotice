from typing import List, Optional
from pydantic import BaseModel

class RouteInfo(BaseModel):
    route_id: str = ""
    route_name: str
    route_mode: str = "BUS"
    direction: Optional[str] = None

class NoticeBase(BaseModel):
    notice_id: str
    agency: str
    route_id: str
    area: str
    source_url: str
    type: str
    title: str
    summary: str
    description: str
    published_at: str
    valid_from: str
    valid_to: Optional[str] = None
    status: str
    content_hash: str
    revision_id: int = 1
    change_summary: Optional[str] = None

class NoticeCreate(NoticeBase):
    route_ids: List[str]
    source_id: Optional[str] = None

class NoticeResponse(NoticeBase):
    observed_at: str
    last_confirmed_at: str
    last_verified_at: str
    is_type_inferred: int
    alert_status: str

    class Config:
        from_attributes = True

class SettingUpdate(BaseModel):
    key: str
    value: str
