FROM python:3.11-slim
WORKDIR /webntfy

COPY . /webntfy

RUN apt-get update && apt-get install -y sqlite3 git curl && rm -rf /var/lib/apt/lists/*

RUN pip install --no-cache-dir -r requirements.txt

EXPOSE 5511

HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 CMD curl -f http://localhost:5511/health || exit 1

CMD ["gunicorn", "-w", "4", "-b", "0.0.0.0:5511", "webntfy:app"]
