function initSpamProtection($form, appToken) {
  let emailValid = false;
  let messageValid = false;

  function sendEmailToBubble(email) {
    const apiUrl = "https://gleemeo.com/api/1.1/wf/record_email";
    const data = { email: email, app_token: appToken };

    fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + appToken
      },
      body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(data => {
      emailValid = data.status !== "blocked";
      updateFeedback($form, emailValid ? "Valid email" : "Invalid email", emailValid);
      updateSubmitButtonState($form);
    })
    .catch(error => console.error("Error:", error));
  }

  function sendMessageToBubble(message, email) {
    if (!emailValid) {
      updateFeedback($form, "Blocked email, skipping message validation", false);
      updateSubmitButtonState($form);
      return;
    }

    const apiUrl = "https://gleemeo.com/api/1.1/wf/validate_message";
    const data = { message: message, email: email, app_token: appToken };

    fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + appToken
      },
      body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(data => {
      messageValid = data.status !== "spam";
      updateFeedback($form, messageValid ? "Legitimate message" : "Spam message detected", messageValid);
      updateSubmitButtonState($form);
    })
    .catch(error => console.error("Error:", error));
  }

  function updateSubmitButtonState($form) {
    const submitButton = $form.find("button, input[type='submit']");
    if (emailValid && messageValid) {
      submitButton.removeAttr("disabled").css({ 'opacity': '1', 'pointer-events': 'auto' });
    } else {
      submitButton.attr("disabled", "disabled").css({ 'opacity': '0.5', 'pointer-events': 'none' });
    }
  }

  function updateFeedback($form, message, isValid) {
    $form.find(".feedback-message").text(message).css("color", isValid ? "green" : "red");
  }

  $form.append('<div class="feedback-message"></div>');

  $form.find("input[type='email']").on("blur", function() {
    const email = $(this).val();
    if (email) sendEmailToBubble(email);
  });

  $form.find("textarea[name='message']").on("blur", function() {
    const message = $(this).val();
    const email = $form.find("input[type='email']").val();
    if (message) sendMessageToBubble(message, email);
  });

  $form.on("submit", function(e) {
    if ($form.find("button, input[type='submit']").is(":disabled")) {
      e.preventDefault();
    }
  });
}
 



