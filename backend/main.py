from fastapi import FastAPI
from sqlalchemy.exc import SQLAlchemyError
from starlette.staticfiles import StaticFiles

from src.exception.global_exception_handler import resource_not_found_exception_handler, sqlalchemy_error_handler, \
    unknown_exception_handler
from src.exception.resource_not_found_exception import ResourceNotFoundException

from src.routes.admin_router import router as admin_router
from src.routes.batch_router import router as batch_router
from src.routes.student_master_router import router as student_master_router
from src.routes.auth_router import router as auth_router
from src.routes.profile_router import router as profile_router
from src.routes.post_router import router as post_router
from fastapi.middleware.cors import CORSMiddleware

origins = ["http://localhost:5173"]

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.add_exception_handler(ResourceNotFoundException, resource_not_found_exception_handler)
app.add_exception_handler(SQLAlchemyError, sqlalchemy_error_handler)
app.add_exception_handler(Exception, unknown_exception_handler)

app.mount("/public",StaticFiles(directory="src/public"),name="public")

app.include_router(admin_router)
app.include_router(batch_router)
app.include_router(student_master_router)
app.include_router(auth_router)
app.include_router(profile_router)
app.include_router(post_router)