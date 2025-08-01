FROM python:3.11-slim

WORKDIR /app
# COPY backend/ /app/

# RUN pip install --upgrade pip && \
#     pip install fastapi uvicorn[standard] python-dotenv psycopg2-binary redis celery
RUN apt-get update && apt-get install -y netcat-openbsd

COPY requirements.txt .

RUN pip install --upgrade pip && \
    pip install -r requirements.txt

# COPY . .
COPY app/ ./app

COPY wait-for-db.sh /wait-for-db.sh
RUN chmod +x /wait-for-db.sh

CMD ["/wait-for-db.sh", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]
