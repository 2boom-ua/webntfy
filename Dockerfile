FROM python:3.10-slim

WORKDIR /webntfy
COPY . .
RUN pip install -r requirements.txt

EXPOSE 5511

CMD ["python", "webntfy.py"]
