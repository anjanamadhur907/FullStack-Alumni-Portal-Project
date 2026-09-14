from fastapi import APIRouter, Depends

from src.dependency.service_dependency import get_batch_service
from src.schema.batch_schema import BatchRequest, BatchResponse
from src.service.batch_service import BatchService

router = APIRouter(prefix="/batch", tags=["Batch"])

@router.post("/", status_code=201)
async def create_batch(request:BatchRequest, batch_service:BatchService=Depends(get_batch_service)):
    return await batch_service.create_batch(request)

@router.get("/", status_code=200)
async def fetch_all(batch_service:BatchService=Depends(get_batch_service)):
    return await batch_service.fetch_all()

@router.get("/{id}", status_code=200, response_model=BatchResponse)
async def fetch_one_batch(id:int, batch_service:BatchService=Depends(get_batch_service)):
    return await batch_service.fetch_one_batch(id)

@router.delete("/{id}", status_code=200)
async def delete_batch(id:int, batch_service:BatchService=Depends(get_batch_service)):
    return await batch_service.delete_batch(id)

@router.put("/{id}", status_code=200, response_model=BatchResponse)
async def update_batch(id:int,request:BatchRequest ,batch_service:BatchService=Depends(get_batch_service)):
    return await batch_service.update_batch(id,request)