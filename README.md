<div align="center">  
    <img src="https://github.com/2boom-ua/webntfy/blob/main/icon.jpg?raw=true" alt="" width="124" height="124">
</div>

## WebNtfy

A simple server for sending and receiving messages. It allows users to post new messages, view existing messages and delete messages as needed. This server can work in a local network without the need for an Internet connection and does not require registration.

### Requirements

- Python 3.X or higher
- Dependencies: Flask, Requests

---
### Installation

#### Clone the Repository

```bash
git clone https://github.com/2boom-ua/webntfy.git
cd webntfy
```

#### Install Required Python Packages

```bash
pip install -r requirements.txt
```
---

### Running as a Linux Service

#### Create a systemd Service File

```bash
sudo nano /etc/systemd/system/webntfy.service
```

Add the following content:

```ini
[Unit]
Description=WebNtfy
After=multi-user.target

[Service]
Type=simple
Restart=always
ExecStart=/usr/bin/python3 /opt/webntfy/webntfy.py

[Install]
WantedBy=multi-user.target
```

#### Start and Enable the Service

```bash
sudo systemctl daemon-reload
sudo systemctl enable webntfy.service
sudo systemctl start webntfy.service
```
---

### [Usage examples for curl, wget, Python, PHP, JavaScript, JSON](usage.md)

---

### License

This project is licensed under the [MIT License](https://opensource.org/licenses/MIT).

---

### Author

- **2boom** - [GitHub](https://github.com/2boom-ua)

