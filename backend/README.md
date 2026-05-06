# Backend (Flask) + SQL Server

## Cài đặt

1) Cài **ODBC Driver** cho SQL Server (khuyến nghị 17 hoặc 18).

2) Cài thư viện Python:

```bash
cd backend
python -m pip install -r requirements.txt
```

## Cấu hình kết nối SQL Server

Mặc định backend dùng:
- Driver: `{ODBC Driver 17 for SQL Server}`
- Server: `localhost`
- Database: `HUMAN_2025`
- Windows Auth: bật (`Trusted_Connection=yes`)

Bạn có thể override bằng biến môi trường:

```bash
set DB_DRIVER={ODBC Driver 17 for SQL Server}
set DB_SERVER=localhost
set DB_DATABASE=HUMAN_2025
set DB_TRUSTED_CONNECTION=true
```

Nếu dùng SQL Login:

```bash
set DB_TRUSTED_CONNECTION=false
set DB_USERNAME=sa
set DB_PASSWORD=your_password
```

## Test lấy dữ liệu

Chạy backend:

```bash
cd backend
python app.py
```

Gọi endpoint test DB (đọc COUNT từ các bảng):
- `GET /api/test`

