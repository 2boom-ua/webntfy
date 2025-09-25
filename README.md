<div align="center">  
    <img src="https://github.com/2boom-ua/webntfy/blob/main/static/mstile-144x144.png?raw=true" alt="" width="124" height="124">
</div>

## WebNtfy

A simple server for sending and receiving messages. It allows users to post new messages, view existing messages and delete messages as needed. This server can work in a local network without the need for an Internet connection and does not require registration.

### Requirements

- Python 3.X or higher
- Dependencies: Gunicorn, Flask, Requests

---
#### Docker Installation

### Dowload messages.db
```bash
curl -L -o ./messages.db  https://raw.githubusercontent.com/2boom-ua/webntfy/main/messages.db
```
---
```bash
  docker build -t webntfy .
```
or
```bash
  docker pull ghcr.io/2boom-ua/webntfy:latest
```

### docker-cli
```bash
docker run -v ./messages.db:/webntfy/messages.db --name webntfy -p 5511:5511 -e TZ=UTC ghcr.io/2boom-ua/webntfy:latest 
```
### docker-compose
```
services:
  webntfy:
    container_name: webntfy
    image: ghcr.io/2boom-ua/webntfy:latest
    environment:
      - TZ=Etc/UTC
    ports:
      - 5511:5511
    volumes:
      - ./messages.db:/webntfy/messages.db
    restart: unless-stopped
```

```bash
docker-compose up -d
```

---
### Running as a Linux Service

#### Clone the Repository
```bash
git clone https://github.com/2boom-ua/webntfy.git
cd webntfy
```
#### Install Required Python Packages

```bash
pip install -r requirements.txt
```
#### Create a systemd Service File

```bash
nano /etc/systemd/system/webntfy.service
```

Add the following content:

```ini
[Unit]
Description=WebNtfy
After=multi-user.target

[Service]
Type=simple
Restart=always
WorkingDirectory=/opt/webntfy
ExecStart=gunicorn -w 4 -b 0.0.0.0:5511 webntfy:app

[Install]
WantedBy=multi-user.target
```

#### Start and Enable the Service

```bash
systemctl daemon-reload
systemctl enable webntfy.service
systemctl start webntfy.service
```
---

### Start

**https://your_domain_name or http://server_ip:5511**

---

### [Usage examples for curl, wget, Python, PHP, JavaScript, JSON](usage.md)

---

### License

This project is licensed under the [MIT License](https://opensource.org/licenses/MIT).

---

### Author

- **2boom** - [GitHub](https://github.com/2boom-ua)

