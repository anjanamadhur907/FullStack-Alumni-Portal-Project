from datetime import date

from pydantic import BaseModel


class BatchRequest(BaseModel):
    id:int
    name: str
    start_date: date
    end_date: date

class BatchResponse(BaseModel):
    id:int
    name:str
    start_date:date
    end_date:date