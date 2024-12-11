### Usage Examples

#### Using `curl`

```bash
curl -X POST -H "Content-Type: application/json" -d '{"message": "Hello from SSH"}' http://<server-ip>:5511/messages
```

#### Using `wget`

```bash
wget --method=POST --header="Content-Type: application/json" --body-data='{"message": "Hello from SSH"}' -O - http://<server-ip>:5511/messages
```

#### Using Python Script

```python
import requests

url = "http://<server-ip>:5511/messages"
message = "Hello from Python"

def send_message(url, message):
    try:
        payload = {"message": message}
        headers = {"Content-Type": "application/json"}
        response = requests.post(url, json=payload, headers=headers)
        if response.status_code == 200:
            print("Message sent successfully!")
            print("Response:", response.json())
        else:
            print("Failed to send message.")
            print("Response:", response.json())
    except Exception as e:
        print("An error occurred:", e)

if __name__ == "__main__":
    send_message(url, message)
```
#### Using PHP Script

```
$url = "http://<server-ip>:5511/messages";

$data = [
    "message" => "Hello from PHP",
    "sender" => "PHP Script"
];

$options = [
    "http" => [
        "header" => "Content-Type: application/json\r\n",
        "method" => "POST",
        "content" => json_encode($data)
    ]
];
$context = stream_context_create($options);

$response = file_get_contents($url, false, $context);

if ($response === FALSE) {
    echo "Error sending POST request.";
} else {
    echo "Response: " . $response;
}
```
#### Using JavaScript
```
const url = "http://<server-ip>:5511/messages";
const headers = {
    "Content-Type": "application/json"
};
const body = JSON.stringify({
    message: "Hello from JavaScript"
});

fetch(url, {
    method: "POST",
    headers: headers,
    body: body
})
.then(response => response.json())
.then(data => {
    console.log("Response:", data);
})
.catch(error => {
    console.error("Error:", error);
});
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
        {"message": "message"}
    ],
    "FORMAT_MESSAGE": [
        "markdown"
    ]
}
```
| Item | Required | Description |
|------------|------------|------------|
| ENABLED | true/false | Enable or disable Webntfy notifications |
| server-ip | url | The URL of your Webntfy server |
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
