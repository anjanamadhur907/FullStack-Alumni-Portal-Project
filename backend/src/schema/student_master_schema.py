from pydantic import BaseModel


class StudentMasterRequest(BaseModel):
    name: str
    batch_id:int