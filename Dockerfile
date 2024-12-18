FROM python:3.11-slim
WORKDIR /webntfy

COPY . /webntfy

RUN apt-get update && apt-get install -y \
    sqlite3 \
    && rm -rf /var/lib/apt/lists/*

RUN pip install --no-cache-dir -r requirements.txt

EXPOSE 5511

# Set the default command to run the application
CMD ["python", "webntfy.py"]

