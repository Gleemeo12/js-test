// external-validation.js

window.initializeValidation = function($form, appToken) {
  console.log("initializeValidation called");

  let emailValid = false;
  let messageValid = false;

  // Function to validate email
  function validateEmail(email) {
    console.log("Validating email: ", email);
    const apiUrl = "https://gleemeo.com/api/1.1/wf/record_email"; // Your Bubble API endpoint

    return fetch(apiUrl, {
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
      return Promise.resolve(); // Resolve to indicate no further validation
    }

    const apiUrl = "https://gleemeo.com/api/1.1/wf/validate_message"; // Your Bubble API endpoint

    return fetch(apiUrl, {
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

  // Function to update the state of the submit button based on validation results
  function updateSubmitButtonState() {
    const submitButton = $form.find("button, input[type='submit']");
    if (emailValid && messageValid) {
      console.log("Both email and message are valid, enabling submit button.");
      submitButton.removeAttr("disabled").css({
        'opacity': '1',
        'pointer-events': 'auto'
      });
    } else {
      console.log("Disabling submit button due to invalid email or message.");
      submitButton.attr("disabled", "disabled").css({
        'opacity': '0.5',
        'pointer-events': 'none'
      });
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
    const email = $form.find("input[type='email']").val();
    const message = $form.find("textarea[name='message']").val();

    // Validate both fields before submission
    Promise.all([
      validateEmail(email),
      validateMessage(message, email)
    ]).then(() => {
      if (!emailValid || !messageValid) {
        e.preventDefault();
        displayFeedback(false, "form", "Please correct the errors before submitting.");
      }
    });
  });
};



