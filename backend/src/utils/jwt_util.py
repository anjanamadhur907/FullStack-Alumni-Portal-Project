from fastapi import HTTPException
from jose import jwt, JWTError
from dotenv import load_dotenv
import os
load_dotenv()

def generate_token(payload:dict):
    token = jwt.encode(claims=payload,
                       key=os.getenv('SECRET_KEY', "jdhfbikuadsgfbiue"),
                       algorithm=os.getenv('TOKEN_ALGO',"HS256"))
    return token

def verify_token(token:str):
    try:
        payload = jwt.decode(token,
                             key=os.getenv('SECRET_KEY', "jdhfbikuadsgfbiue"),
                             algorithms=[os.getenv('TOKEN_ALGO', "HS256")])
        return payload
    except JWTError:
        raise HTTPException(status_code=401, detail="Unauthorized access")
