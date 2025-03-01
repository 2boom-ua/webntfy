// Copyright: 2boom 2024-25
let interval;
let lastMessageId = null;
let blinkInterval = null;
let scrollTimeout;

document.addEventListener('DOMContentLoaded', async function() {
    const form = document.getElementById('channelForm');
    const toggleButton = document.getElementById('selectChannel');
    const select = document.getElementById('channel');
    const messageForm = document.getElementById('messageForm');
    const messagesBox = document.getElementById('messages');
    const messageInput = document.getElementById('message');
    const scrollControls = document.getElementById('scrollControls');
    const addChannelButton = document.getElementById('addChannel');

    let isVisible = false;

    const savedChannel = localStorage.getItem('selectedChannel');
    if (savedChannel) {
        select.value = savedChannel;
    }
    
    updateTitle(select.value);

    select.addEventListener('change', async function() {
        localStorage.setItem('selectedChannel', this.value);
        updateTitle(this.value);
        await loadMessages();
        scrollToBottom();
    });

    toggleButton.addEventListener('click', function() {
        if (isVisible) {
            form.style.display = 'none';
        } else {
            form.style.display = 'block';
        }
        isVisible = !isVisible;
    });

    messageForm.addEventListener('submit', function(e) {
        e.preventDefault();
        sendMessage();
    });

    document.addEventListener('click', showScrollControls);

    messageInput.addEventListener('keydown', function(e) {
        if (e.ctrlKey && e.key === "Enter") {
            const cursorPos = this.selectionStart;
            this.value = this.value.substring(0, cursorPos) + "\n" + this.value.substring(cursorPos);
            this.selectionStart = this.selectionEnd = cursorPos + 1;
            e.preventDefault();
        }
        if (e.key === "Enter" && !e.ctrlKey) {
            e.preventDefault();
            sendMessage();
        }
    });

    const toBottomButton = document.getElementById('toBottom');
    if (toBottomButton) {
        toBottomButton.addEventListener('click', scrollToBottom);
    }

    if (addChannelButton) {
        addChannelButton.addEventListener('click', addChannel);
    } else {
        console.error("addChannel button not found in DOM");
    }

    await loadMessages();
    initialScrollToBottom();
    interval = setInterval(loadMessages, 5000);
});

function updateTitle(channel) {
    document.title = `${channel.toUpperCase()}`;
}

function changeFavicon(iconURL) {
    var link = document.querySelector("link[rel*='icon']") || document.createElement('link');
    link.type = 'image/x-icon';
    link.rel = 'shortcut icon';
    link.href = iconURL;
    document.getElementsByTagName('head')[0].appendChild(link);
}

async function deleteMessage(id) {
    try {
        const response = await fetch('/messages', {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ id: id })
        });
        const data = await response.json();
        console.log(data.message);
        const messagesBox = document.getElementById('messages');
        const currentScroll = messagesBox.scrollTop;
        const maxScroll = messagesBox.scrollHeight - messagesBox.clientHeight;

        await loadMessages();

        if (currentScroll >= maxScroll) {
            scrollToBottom();
        }
    } catch (error) {
        console.error("An error occurred:", error);
    }
}

async function loadMessages() {
    const selectedChannel = document.getElementById('channel').value;
    try {
        const response = await fetch(`/messages?channel=${encodeURIComponent(selectedChannel)}`);
        const data = await response.json();
        let htmlContent = '';
        let latestMessageId = lastMessageId;
        let hasNewMessages = false;

        data.messages.forEach(function (msg) {
            htmlContent += `<div class="message">
                <div>${msg.text}</div>
                <div class="time">
                    ${msg.time}
                    <button class="copy-btn" aria-label="Copy" onclick="copyMessage('${msg.text}')">
                        <i class="fa fa-copy"></i>
                    </button>
                    <button class="delete-btn" aria-label="Remove" onclick="deleteMessage(${msg.id})">
                        <i class="fa fa-trash"></i>
                    </button>
                </div>
            </div>`;

            if (!latestMessageId || msg.id > latestMessageId) {
                latestMessageId = msg.id;
                hasNewMessages = true;
            }
        });

        document.getElementById('messages').innerHTML = htmlContent;

        if (lastMessageId !== null && latestMessageId > lastMessageId) {
            const newMessages = data.messages.filter(msg => msg.id > lastMessageId);
            if (!document.hasFocus()) {
                changeFavicon("/static/favicon-alert.svg");
                newMessages.forEach(msg => showNotification(msg.text));
            }
            if (hasNewMessages) {
                scrollToBottom();
            }
        }

        lastMessageId = latestMessageId;

    } catch (error) {
        console.error("Failed to load messages:", error);
    }
}

window.addEventListener("focus", () => {
    changeFavicon("/static/favicon.svg");
});

async function sendMessage() {
    const messageInput = document.getElementById('message');
    const message = messageInput.value.trim();
    const selectedChannel = document.getElementById('channel').value;
    if (!message) return;

    try {
        const response = await fetch('/messages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ message: message, channel: selectedChannel })
        });
        if (response.ok) {
            messageInput.value = '';
            await loadMessages();
        } else {
            showAlert("Failed to send message. Error code: " + response.status, "error");
        }
    } catch (error) {
        showAlert("Failed to send message. " + error.message, "error");
    }
}

function showConfirm(message, callback) {
    const confirmBox = document.getElementById("confirmBox");
    const confirmMessage = document.getElementById("confirmMessage");
    const confirmYes = document.getElementById("confirmYes");
    const confirmNo = document.getElementById("confirmNo");

    confirmMessage.innerText = message;
    confirmBox.style.display = "block";

    confirmYes.onclick = () => {
        confirmBox.style.display = "none";
        callback(true);
    };

    confirmNo.onclick = () => {
        confirmBox.style.display = "none";
        callback(false);
    };
}

async function removeChannel() {
    const select = document.getElementById('channel');
    const selectedChannel = select.value;

    if (!selectedChannel) {
        showAlert("No channel selected!", "error");
        return;
    }

    showConfirm(`Are you sure you want to remove channel: ${selectedChannel}?`, async (confirmed) => {
        if (!confirmed) return;

        try {
            const response = await fetch('/deletechannel', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ channel: selectedChannel })
            });

            const data = await response.json();
            showAlert(data.message, response.ok ? "success" : "error");

            if (response.ok) {
                select.remove(select.selectedIndex);
                localStorage.removeItem('selectedChannel');
                select.value = select.options.length ? select.options[0].value : "";
                if (select.options.length > 0) {
                    select.value = select.options[0].value;
                } else {
                    select.value = "";
                }
                updateTitle(select.value || "No Channel");
                await loadMessages();
                scrollToBottom();
            }
        } catch (error) {
            showAlert("Failed to remove channel!", "error");
        }
    });
}

function stripHTMLTags(message_string) {
    return message_string.replace(/<br\s*\/?>/gi, "\n").replace(/<\/?[^>]+(>|$)/g, "").trim();
}

function copyMessage(text) {
    const tempInput = document.createElement("textarea");
    tempInput.value = stripHTMLTags(text);
    document.body.appendChild(tempInput);
    tempInput.select();
    document.execCommand("copy");
    document.body.removeChild(tempInput);
}

function showNotification(message) {
    if (Notification.permission === "granted") {
        new Notification("WebNtfy", {
            body: message,
            icon: "/static/favicon-alert.svg"
        });
    } else if (Notification.permission !== "denied") {
        Notification.requestPermission().then(permission => {
            if (permission === "granted") {
                showNotification(message);
            }
        });
    }
}

function scrollToTop() {
    document.getElementById('messages').scrollTop = 0;
}

function scrollToBottom() {
    const messagesBox = document.getElementById('messages');
    messagesBox.scrollTop = messagesBox.scrollHeight;
}

function initialScrollToBottom() {
    scrollToBottom();
}

function showScrollControls() {
    const scrollControls = document.getElementById('scrollControls');
    scrollControls.style.display = 'block';
    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(() => {
        scrollControls.style.display = 'none';
    }, 8000);
}

function toggleMessageForm() {
    const messageContainer = document.getElementById("messageContainer");
    const messageInput = document.getElementById("message");
    if (messageContainer.style.display === "none" || messageContainer.style.display === "") {
        messageContainer.style.display = "flex";
        messageInput.focus();
    } else {
        messageContainer.style.display = "none";
    }
}

function showAlert(message, type = "error") {
    const alertBox = document.getElementById("alertBox");
    alertBox.innerText = message;
    alertBox.className = `alert ${type}`;
    alertBox.style.display = "block";

    setTimeout(() => {
        alertBox.style.display = "none";
    }, 3000);
}

async function reloadChannels(selectedChannel = null) {
    try {
        const response = await fetch('/channels');
        const data = await response.json();

        if (response.ok) {
            const select = document.getElementById("channel");
            select.innerHTML = "";

            data.channels.forEach(channel => {
                const option = document.createElement("option");
                option.value = channel;
                option.text = channel;
                select.appendChild(option);
            });

            select.value = selectedChannel || (data.channels.length > 0 ? data.channels[0] : "");
            updateTitle(select.value);
            localStorage.setItem("selectedChannel", select.value);

            await loadMessages();
        }
    } catch (error) {
        showAlert("Failed to reload channels!", "error");
    }
}

async function addChannel() {
    let modal = document.getElementById('addChannelModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'addChannelModal';
        modal.className = 'confirm';
        modal.innerHTML = `
            <div class="confirm-content">
                <p>Enter new channel name:</p>
                <input type="text" id="newChannelName" placeholder="Channel name" autocomplete="off">
                <div>
                    <button id="addConfirm">Add</button>
                    <button id="addCancel">Cancel</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }
    
    modal.style.display = 'block';
    const newChannelInput = document.getElementById('newChannelName');
    newChannelInput.value = '';
    newChannelInput.focus();

    document.getElementById('addConfirm').onclick = async () => {
        const newChannel = newChannelInput.value.trim();
        if (!newChannel) {
            showAlert("Channel name cannot be empty!", "error");
            return;
        }

        try {
            const response = await fetch('/addchannel', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ channel: newChannel })
            });

            const data = await response.json();
            showAlert(data.message, response.ok ? "success" : "error");

            if (response.ok) {
                const select = document.getElementById('channel');
                const option = document.createElement('option');
                option.value = newChannel;
                option.text = newChannel;
                select.appendChild(option);
                select.value = newChannel;
                
                localStorage.setItem('selectedChannel', newChannel);
                updateTitle(newChannel);
                
                await loadMessages();
                scrollToBottom();
            }
        } catch (error) {
            showAlert("Failed to add channel: " + error.message, "error");
        }

        modal.style.display = 'none';
    };

    document.getElementById('addCancel').onclick = () => {
        modal.style.display = 'none';
    };
}