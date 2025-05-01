// pgAdmin 4 - PostgreSQL Tools
//
// Copyright (C) 2013 - 2025, The pgAdmin Development Team
// This software is released under the PostgreSQL Licence
//
//////////////////////////////////////////////////////////////

// SMS Authentication JavaScript functions
(function() {
  // Add event listener for the send code button
  document.addEventListener('DOMContentLoaded', function() {
    const sendCodeBtn = document.getElementById('btn-send-sms-code');
    if (sendCodeBtn) {
      sendCodeBtn.addEventListener('click', sendSMSCode);
    }
  });

  // Function to send SMS verification code
  function sendSMSCode(e) {
    e.preventDefault();
    
    const btn = document.getElementById('btn-send-sms-code');
    const msgContainer = document.getElementById('sms-msg-container');
    const codeInput = document.getElementById('sms-code-input');
    
    if (btn) {
      btn.disabled = true;
      btn.textContent = "{{ _('Sending Code...') }}";
    }
    
    fetch("{{ url_for('mfa.send_sms_code') }}", {
      method: 'POST',
      headers: {
        'X-CSRFToken': document.querySelector('meta[name="csrf-token"]').getAttribute('content'),
        'Content-Type': 'application/json',
      },
      credentials: 'include'
    })
    .then(response => {
      if (!response.ok) {
        return response.text().then(text => {
          throw new Error(text);
        });
      }
      return response.json();
    })
    .then(data => {
      if (msgContainer) {
        msgContainer.textContent = data.message;
        msgContainer.style.display = 'block';
      }
      
      if (codeInput) {
        codeInput.style.display = 'block';
        codeInput.focus();
      }
      
      if (btn) {
        btn.textContent = "{{ _('Resend Code') }}";
        btn.disabled = false;
      }
    })
    .catch(error => {
      if (msgContainer) {
        msgContainer.textContent = error.message;
        msgContainer.style.display = 'block';
        msgContainer.classList.add('error-message');
      }
      
      if (btn) {
        btn.textContent = "{{ _('Send Code') }}";
        btn.disabled = false;
      }
    });
  }
})();
