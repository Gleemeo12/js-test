window.initializeValidation = function($form, appToken) {
  console.log("initializeValidation called");

  let emailValid = false;
  let messageValid = false;

  // Function to validate email
  function validateEmail(email) {
    console.log("Validating email: ", email);
    const apiUrl = "https://yourapi.com/api/1.1/wf/record_email"; // Your API endpoint

    fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${appToken}`
      },
      body: JSON.stringify({ email: email, app_token: appToken })
    })
    .then(response => response.json())
    .then(data => {
      emailValid = data.status !== "blocked";
      updateSubmitButtonState();
      displayFeedback(emailValid, "email", data.status);
    })
    .catch(error => console.error("Error validating email:", error));
  }

  // Function to validate message
  function validateMessage(message, email) {
    if (!emailValid) {
      displayFeedback(false, "message", "Blocked email, skipping message validation");
      return;
    }

    const apiUrl = "https://yourapi.com/api/1.1/wf/validate_message";

    fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${appToken}`
      },
      body: JSON.stringify({ message: message, email: email, app_token: appToken })
    })
    .then(response => response.json())
    .then(data => {
      messageValid = data.status !== "spam";
      updateSubmitButtonState();
      displayFeedback(messageValid, "message", data.status);
    })
    .catch(error => console.error("Error validating message:", error));
  }

  // Function to update submit button state
  function updateSubmitButtonState() {
    const submitButton = $form.find("button, input[type='submit']");
    if (emailValid && messageValid) {
      submitButton.removeAttr("disabled").css({ 'opacity': '1', 'pointer-events': 'auto' });
    } else {
      submitButton.attr("disabled", "disabled").css({ 'opacity': '0.5', 'pointer-events': 'none' });
    }
  }

  // Function to display feedback messages
  function displayFeedback(isValid, type, status) {
    const feedbackMessage = $form.find(".feedback-message");
    if (isValid) {
      feedbackMessage.text(`${type.charAt(0).toUpperCase() + type.slice(1)} is valid`).css("color", "green");
    } else {
      feedbackMessage.text(`Invalid ${type}: ${status}`).css("color", "red");
    }
  }

  // Attach event listeners for validation
  $form.find("input[type='email']").on("blur", function () {
    const email = $(this).val();
    if (email) {
      validateEmail(email);
    }
  });

  $form.find("textarea[name='message']").on("blur", function () {
    const message = $(this).val();
    const email = $form.find("input[type='email']").val();
    if (message) {
      validateMessage(message, email);
    }
  });

  // Prevent form submission if validation fails
  $form.on("submit", function (e) {
    if (!emailValid || !messageValid) {
      e.preventDefault();
    }
  });
};



