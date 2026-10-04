// ===== Portfolio Chat Widget =====
// Clicking the robot FAB opens the chat in a dedicated page

(function () {
  'use strict';

  function createWidget() {
    const widget = document.createElement('div');
    widget.id = 'chat-widget';
    widget.innerHTML = `
      <div class="chat-fab-wrapper" id="chat-fab-wrapper">
        <button class="chat-fab" id="chat-fab" aria-label="Open chat">
          <img src="images/chat-robot.svg" alt="AI Assistant">
        </button>
        <span class="chat-fab-tooltip">Ask Prasad's AI</span>
      </div>
    `;
    document.body.appendChild(widget);

    const fab = document.getElementById('chat-fab');
    fab.addEventListener('click', () => {
      window.open('chat.html', '_blank');
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', createWidget);
  } else {
    createWidget();
  }
})();
