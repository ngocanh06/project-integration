from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from database import create_tables, check_connection
from modules.auth.routes.auth_routes import router as auth_router
from modules.otp.routes.otp_routes import router as otp_router

app = FastAPI(
    title="Authentication API",
    description="Backend API for authentication and user management",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def on_startup():
    if check_connection():
        print("[Database] Kết nối thành công!")
        create_tables()
        print("[Database] Bảng đã được tạo / cập nhật.")
    else:
        print("[Database] CẢNH BÁO: Không thể kết nối database!")


@app.get("/")
async def root():
    return JSONResponse(status_code=200, content={
        "message": "Welcome to Authentication API",
        "version": "1.0.0",
        "endpoints": {"auth": "/api/auth", "otp": "/api/otp", "docs": "/docs"}
    })


@app.get("/health")
async def health_check():
    db_ok = check_connection()
    return JSONResponse(
        status_code=200 if db_ok else 503,
        content={"status": "healthy" if db_ok else "degraded",
                 "database": "connected" if db_ok else "disconnected"}
    )


app.include_router(auth_router)
app.include_router(otp_router)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)