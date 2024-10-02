function initSpamProtection($form, appToken) {
  let emailValid = false;
  let messageValid = false;

  function sendApiRequest(url, data) {
    return fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + appToken
      },
      body: JSON.stringify(data)
    }).then(response => response.json());
  }

  function updateUI(isValid, message) {
    $form.find(".feedback-message").text(message).css("color", isValid ? "green" : "red");
    const submitButton = $form.find("button, input[type='submit']");
    submitButton.prop("disabled", !(emailValid && messageValid))
                .css("opacity", (emailValid && messageValid) ? "1" : "0.5");
  }

  function validateEmail(email) {
    sendApiRequest("https://gleemeo.com/api/1.1/wf/record_email", { email, app_token: appToken })
      .then(data => {
        emailValid = data.status !== "blocked";
        updateUI(emailValid, emailValid ? "Valid email" : "Invalid email");
      })
      .catch(error => console.error("Email validation error:", error));
  }

  function validateMessage(message, email) {
    if (!emailValid) {
      updateUI(false, "Please enter a valid email first");
      return;
    }
    sendApiRequest("https://gleemeo.com/api/1.1/wf/validate_message", { message, email, app_token: appToken })
      .then(data => {
        messageValid = data.status !== "spam";
        updateUI(messageValid, messageValid ? "Message accepted" : "Spam detected");
      })
      .catch(error => console.error("Message validation error:", error));
  }

  $form.append('<div class="feedback-message"></div>');

  $form.find("input[type='email']").on("blur", function() {
    validateEmail($(this).val());
  });

  $form.find("textarea[name='message']").on("blur", function() {
    validateMessage($(this).val(), $form.find("input[type='email']").val());
  });

  $form.on("submit", function(e) {
    if (!emailValid || !messageValid) {
      e.preventDefault();
      updateUI(false, "Please correct the form before submitting");
    }
  });
}
 



