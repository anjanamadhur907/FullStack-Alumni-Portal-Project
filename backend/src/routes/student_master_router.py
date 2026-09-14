from fastapi import APIRouter, Depends

from src.dependency.service_dependency import get_student_master_service
from src.schema.student_master_schema import StudentMasterRequest
from src.service.student_master_service import StudentMasterService

router = APIRouter(prefix="/student", tags=["Student Master"])

@router.post("/", status_code=201)
async def create_student_master(request:StudentMasterRequest, student_master_service:StudentMasterService=Depends(get_student_master_service)):
    return await student_master_service.create_student_master(request)

@router.get("/", status_code=200)
async def fetch_all(student_master_service:StudentMasterService=Depends(get_student_master_service)):
    return await student_master_service.fetch_all()

@router.get("/{batch_id}", status_code=200)
async def fetch_by_batch_id(batch_id:int, student_master_service=Depends(get_student_master_service)):
    return await student_master_service.fetch_by_batch_id(batch_id)

@router.get("/{id}", status_code=200)
async def get_student_by_id(id:int, student_master_service:StudentMasterService=Depends(get_student_master_service)):
    return await student_master_service.get_student_by_id(id)

# @router.get("/{card_id}", status_code=200)
# async def get_by_card_id(card_id:str, student_master_service:StudentMasterService=Depends(get_student_master_service)):
#     return await student_master_service.get_by_card_id(card_id)

@router.delete("/{id}", status_code=200)
async def delete_student_master(id:int, student_master_service=Depends(get_student_master_service)):
    return await student_master_service.delete_student_master(id)

@router.put("/{id}", status_code=200)
async def update_student_master(id:int,request:StudentMasterRequest ,student_master_service=Depends(get_student_master_service)):
    return await student_master_service.update_student_master(id,request)
