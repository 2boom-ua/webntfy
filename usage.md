### Usage Examples

### Send message
#### Using `curl`

```bash
curl -X POST http://localhost:5511/messages \
-H "Content-Type: application/json" \
-d '{"message": "Hello World", "channel": "general"}'
```

#### Using Python

```python
import requests

url = "http://localhost:5511/messages"
data = {
    "message": "Hello World",
    "channel": "general"
}
headers = {"Content-Type": "application/json"}

response = requests.post(url, json=data, headers=headers)
print(response.json())
```
#### Using PHP Script

```
<?php
$url = 'http://localhost:5511/messages';
$data = [
    'message' => 'Hello World',
    'channel' => 'general'
];

$ch = curl_init($url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));

$response = curl_exec($ch);
curl_close($ch);

$result = json_decode($response, true);
print_r($result);
?>
```
#### Using JavaScript
```
const url = 'http://localhost:5511/messages';
const data = {
    message: 'Hello World',
    channel: 'general'
};

fetch(url, {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
    },
    body: JSON.stringify(data)
})
.then(response => response.json())
.then(data => console.log(data))
.catch(error => console.error('Error:', error));
```
---

### JSON

Below is an example configuration for `dockcheck`, `check_services`, `update_check`, `web_check`, `ip_check`:

```json
"WEBNTFY": {
    "ENABLED": true,
    "WEBHOOK_URL": [
        "http://<server-ip>:5511/messages"
    ],
    "HEADER": [
        {"Content-Type": "application/json"}
    ],
    "PYLOAD": [
        {"message": "message", "channel": "channel_name"}
    ],
    "FORMAT_MESSAGE": [
        "markdown"
    ]
}
```
| Item | Required | Description |
|------------|------------|------------|
| ENABLED | true/false | Enable or disable Webntfy notifications |
| SERVER | url | The URL of your Webntfy server |
| FORMAT_MESSAGE | markdown | Specifies the message format used by each service, such as markdown, html, or other text formatting.|

---
### Usage Examples for change MAX_DAYS for number of days to store messages
*messages older than MAX_DAYS days are deleted automatically* 
#### Using `curl` 
```bash
curl -X POST -H "Content-Type: application/json" -d '{"max_days": 60}' http://<server-ip>:5511/maxdays
```
#### Using `Python` 
```python
import requests

url = "http://<server-ip>:5511/deleteall"

new_value = {"max_days": 60}
response = requests.post(url, json=new_value)

if response.status_code == 200:
    print(response.json())
else:
    print("Error:", response.status_code, response.json())
```
---
### Usage Examples for delete all messages
*messages older than 30 days are deleted automatically* default
#### Using `curl` 
delete all message
```bash
curl -X DELETE http://<server-ip>:5511/deleteall
```
#### Using `Python` 
```python
import requests

url = "http://<server-ip>:5511/deleteall"
response = requests.delete(url)
if response.status_code == 200:
    print("Success:", response.json())
else:
    print("Error:", response.status_code, response.text)
```
---
### Usage Examples for delete last message
#### Using `curl` 
delete last message (the last message from any user or device)
```bash
curl -X DELETE http://<server-ip>:5511/deletelast
```
#### Using `Python` 
```python
import requests

url = "http://<server-ip>:5511/deletelast"
response = requests.delete(url)
if response.status_code == 200:
    print("Success:", response.json())
else:
    print("Error:", response.status_code, response.text)
```
---
### Usage Examples for delete channel
#### Using `curl` 
```bash
curl -X DELETE http://localhost:5511/deletechannel \
     -H "Content-Type: application/json" \
     -d '{"channel": "#test"}'
```
#### Using `Python` 
```python
import requests

url = "http://localhost:5511/deletechannel"
data = {"channel": "your_channel_name"}

response = requests.delete(url, json=data)
print(response.json())
```
---

### Usage Examples for add channel
#### Using `curl` 
```bash
curl -X POST http://localhost:5511/addchannel \
    -H "Content-Type: application/json" \
    -d '{"channel": "newchannel"}'
```
#### Using `Python` 
```python
import requests

url = "http://localhost:5511/addchannel"
data = {
    "channel": "newchannel"
}
headers = {"Content-Type": "application/json"}

response = requests.post(url, json=data, headers=headers)
print(response.json())
```
---

### Markdown Syntax Support

#### Supported Formatting:

- **Bold**: Use double asterisks (`**`) to indicate bold text.
    ```markdown
    **Bold Text**
    ```

- *Italic*: Use a single asterisk (`*`) for italic text.
    ```markdown
    *Italic Text*
    ```

- __Underline__: Use double underscores (`__`) to underline text.
    ```markdown
    __Underlined Text__
    ```

- ~~Strikethrough~~: Use double tildes (`~~`) for strikethrough text.
    ```markdown
    ~~Strikethrough Text~~
    ```

#### Limitations:

- Nested Markdown syntax is **not supported**:
    ```markdown
    **Bold *Italic***
    ```

- Unmatched Markdown symbols may result in unexpected rendering.
