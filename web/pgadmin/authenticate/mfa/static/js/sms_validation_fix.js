/**
 * SMS 2FA Validation Fix
 * This script fixes the SMS validation by directly overriding the default behavior
 */
(function() {
  // Wait for the DOM to be fully loaded
  document.addEventListener('DOMContentLoaded', function() {
    console.log('SMS validation fix script loaded');
    
    // Function to override the default SMS validation behavior
    function fixSmsValidation() {
      // Wait for React to render the components
      setTimeout(function() {
        // Find the send code button for SMS
        const sendCodeBtn = document.querySelector('button[name="send_code"]');
        if (sendCodeBtn) {
          console.log('Found send code button, attaching event listener');
          
          // Override the default click behavior
          sendCodeBtn.addEventListener('click', function(e) {
            // Prevent default to stop the original React handler
            e.preventDefault();
            e.stopPropagation();
            
            console.log('Send code button clicked, using correct endpoint');
            
            // Get CSRF token
            const csrfToken = document.querySelector('meta[name="csrf-token"]').getAttribute('content');
            const csrfHeader = document.querySelector('meta[name="csrf-header"]').getAttribute('content');
            
            // Disable button during request
            sendCodeBtn.disabled = true;
            sendCodeBtn.textContent = "Sending Code...";
            
            // Use absolute URL to ensure it works correctly
            const smsEndpoint = window.location.origin + '/mfa/send_sms_code';
            console.log('Using fixed SMS endpoint:', smsEndpoint);
            
            // Make the fetch request
            fetch(smsEndpoint, {
              method: 'POST',
              headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                [csrfHeader]: csrfToken
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
              console.log('SMS code sent successfully:', data);
              
              // Show success message
              const msgContainer = document.querySelector('.pg-mfa-container .alert');
              if (msgContainer) {
                msgContainer.textContent = data.message;
                msgContainer.style.display = 'block';
                msgContainer.className = 'alert alert-info';
              }
              
              // Update button text
              sendCodeBtn.textContent = "Resend Code";
              sendCodeBtn.disabled = false;
              
              // Show code input field if it's hidden
              const codeInput = document.querySelector('input[name="code"]');
              if (codeInput) {
                const inputContainer = codeInput.closest('.form-group');
                if (inputContainer) {
                  inputContainer.style.display = 'block';
                }
                codeInput.focus();
              }
              
              // Show validate button if it's hidden
              const validateBtn = document.querySelector('button[value="Validate"]');
              if (validateBtn) {
                validateBtn.style.display = 'inline-block';
              }
            })
            .catch(error => {
              console.error('Error sending SMS code:', error);
              
              // Show error message
              const msgContainer = document.querySelector('.pg-mfa-container .alert');
              if (msgContainer) {
                msgContainer.textContent = error.message;
                msgContainer.style.display = 'block';
                msgContainer.className = 'alert alert-danger';
              }
              
              // Reset button
              sendCodeBtn.textContent = "Send Code";
              sendCodeBtn.disabled = false;
            });
          });
        }
      }, 1000); // Give React time to render
    }
    
    // Call the fix function
    fixSmsValidation();
    
    // Also call it when the hash changes (in case of SPA navigation)
    window.addEventListener('hashchange', fixSmsValidation);
  });
})();
