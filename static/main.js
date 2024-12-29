let interval;
let lastMessageId = null;
let blinkInterval = null;

function changeFavicon(iconURL) {
   var link = document.querySelector("link[rel*='icon']") || document.createElement('link');
   link.type = 'image/x-icon';
   link.rel = 'shortcut icon';
   link.href = iconURL;
   document.getElementsByTagName('head')[0].appendChild(link);
}

function deleteMessage(id) {
   $.ajax({
      url: '/messages',
      type: 'DELETE',
      contentType: 'application/json',
      data: JSON.stringify({
         id: id
      }),
      success: function (response) {
         console.log(response.message);
         loadMessages();
      },
      error: function (error) {
         console.error(error.responseJSON ? error.responseJSON.message : "An error occurred");
      }
   });
}

function loadMessages() {
    const selectedChannel = $('#channel').val();
    $.getJSON(`/messages?channel=${encodeURIComponent(selectedChannel)}`, function (data) {
        let htmlContent = '';
        data.messages.forEach(function (msg) {
            htmlContent += `<div><strong>${msg.time}</strong>: ${msg.text}</div>`;
        });
        $('#messages').html(htmlContent);
    });
}

function sendMessage() {
    const message = $('#message').val().trim();
    const selectedChannel = $('#channel').val();
    if (!message) {
        return;
    }

    $.ajax({
        url: '/messages',
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({ message: message, channel: selectedChannel }),
        success: function () {
            $('#message').val('');
            loadMessages();
        },
        error: function (error) {
            alert('Failed to send message. Error code: ' + error.status);
        }
    });
}

$(document).ready(function () {
    $('#channel').on('change', loadMessages);
    $('#messageForm').on('submit', function (e) {
        e.preventDefault();
        sendMessage();
    });
    loadMessages();
});




function stripHTMLTags(message_string) {
   message_string = message_string.replace(/<br\s*\/?>/gi, "\n").replace(/<\/?[^>]+(>|$)/g, "");
   if (message_string.endsWith('\n')) {
      message_string = message_string.slice(0, -1);
   }
   return message_string;
}

function copyMessage(text) {
   const tempInput = document.createElement("textarea");
   tempInput.value = stripHTMLTags(text);
   document.body.appendChild(tempInput);
   tempInput.select();
   document.execCommand("copy");
   document.body.removeChild(tempInput);
}

window.addEventListener("focus", () => {
   changeFavicon("/static/favicon.svg");
});

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

$(document).ready(function () {
   $('#message').on('keydown', function (e) {
      if (e.ctrlKey && e.key === "Enter") {
         const textarea = this;
         const cursorPos = textarea.selectionStart;
         const textBeforeCursor = textarea.value.substring(0, cursorPos);
         const textAfterCursor = textarea.value.substring(cursorPos);
         textarea.value = textBeforeCursor + "\n" + textAfterCursor;
         textarea.selectionStart = textarea.selectionEnd = cursorPos + 1;
         e.preventDefault();
      }

      if (e.key === "Enter" && !e.ctrlKey) {
         e.preventDefault();
         $('#messageForm').submit();
      }
   });

   $('#messageForm').on('submit', function (e) {
      e.preventDefault();
      sendMessage();
   });

   function sendMessage() {
    const message = $('#message').val().trim();
    const selectedChannel = $('#channel').val(); // Get the selected channel
    if (!message) {
        return;
    }

    $.ajax({
        url: '/messages',
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({
            message: message,
            channel: selectedChannel // Include channel in the payload
        }),
        success: function () {
            $('#message').val('');
            loadMessages();
            initialScrollToBottom();
        },
        error: function (error) {
            alert('Failed to send message. Error code: ' + error.status);
        }
    });
}

});

function initialScrollToBottom() {
   const messagesBox = $("#messages");
   if (messagesBox[0]) {
      messagesBox.scrollTop(messagesBox[0].scrollHeight);
   }
}

let scrollTimeout;

function showScrollControls() {
   const scrollControls = $("#scrollControls");
   scrollControls.fadeIn();
   clearTimeout(scrollTimeout);
   scrollTimeout = setTimeout(() => {
      scrollControls.fadeOut();
   }, 8000);
}

function scrollToTop() {
   const messagesBox = $("#messages");
   if (messagesBox[0]) {
      messagesBox.scrollTop(0);
   }
}

function scrollToBottom() {
   const messagesBox = $("#messages");
   if (messagesBox[0]) {
      messagesBox.scrollTop(messagesBox[0].scrollHeight);
   }
}

//$(document).ready(function () {
//   const messagesBox = $("#messages");
//   messagesBox.on("scroll", () => {
//      showScrollControls();
//   });
//});

$(document).ready(function () {
    const messagesBox = $("#messages");

    messagesBox.on("scroll", () => {
        showScrollControls();
    });

    $(document).on("click", () => {
        showScrollControls();
    });
});

$(document).ready(function () {
    $('#channel').on('change', function () {
        loadMessages(); // Reload messages for the selected channel
    });

    interval = setInterval(loadMessages, 5000);
    loadMessages();
    setTimeout(initialScrollToBottom, 100);
});

function toggleMessageForm() {
    const messageContainer = document.getElementById("messageContainer");
    if (messageContainer.style.display === "none" || messageContainer.style.display === "") {
        messageContainer.style.display = "flex";
    } else {
        messageContainer.style.display = "none";
    }
}

