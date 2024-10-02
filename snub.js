// Main validation logic hosted on GitHub
window.initializeFormValidation = function ($form, app_token) {
  let emailValid = false;
  let messageValid = false;

  function sendEmailToBubble(email) {
    const apiUrl = "https://gleemeo.com/api/1.1/wf/record_email"; // Your Bubble API endpoint
    const data = { email: email, app_token: app_token };

    // Send API call for email validation
    fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${app_token}`
      },
      body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(data => {
      console.log("Email validation response:", data); // Debugging
      if (data.status === "blocked") {
        emailValid = false;
        $form.find(".feedback-message").text("Invalid email").css("color", "red");
      } else {
        emailValid = true;
        $form.find(".feedback-message").text("Valid email").css("color", "green");
      }
      updateSubmitButtonState();
    })
    .catch(error => {
      console.error("Error during email validation:", error);
    });
  }

  function sendMessageToBubble(message, email) {
    const apiUrl = "https://gleemeo.com/api/1.1/wf/validate_message"; // Your Bubble API endpoint for message validation
    const data = { message: message, email: email, app_token: app_token };

    fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${app_token}`
      },
      body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(data => {
      console.log("Message validation response:", data); // Debugging
      if (data.status === "spam") {
        messageValid = false;
        $form.find(".feedback-message").text("Spam message detected").css("color", "red");
      } else {
        messageValid = true;
        $form.find(".feedback-message").text("Legitimate message").css("color", "green");
      }
      updateSubmitButtonState();
    })
    .catch(error => {
      console.error("Error during message validation:", error);
    });
  }

  function updateSubmitButtonState() {
    const submitButton = $form.find("button, input[type='submit']");
    if (emailValid && messageValid) {
      submitButton.removeAttr("disabled").css({ 'opacity': '1', 'pointer-events': 'auto' });
    } else {
      submitButton.attr("disabled", "disabled").css({ 'opacity': '0.5', 'pointer-events': 'none' });
    }
  }

  // Append feedback message area to the form
  $form.append('<div class="feedback-message"></div>');

  // Validate email on input change
  $form.find("input[type='email']").on("blur", function () {
    const email = $(this).val();
    console.log("Email input lost focus:", email); // Debugging
    if (email) {
      sendEmailToBubble(email);
    }
  });

  // Validate message on input change
  $form.find("textarea[name='message']").on("input", function () {
    const message = $(this).val();
    const email = $form.find("input[type='email']").val();
    console.log("Message input changed:", message); // Debugging
    if (message) {
      sendMessageToBubble(message, email);
    }
  });

  // Prevent form submission if validation fails
  $form.on("submit", function (e) {
    console.log("Attempting form submission. Email valid:", emailValid, "Message valid:", messageValid); // Debugging
    if (!emailValid || !messageValid) {
      console.log("Form submission prevented due to validation errors."); // Debugging
      e.preventDefault(); // Prevent submission
      $form.find(".feedback-message").text("Please correct the errors before submitting.").css("color", "orange");
    }
  });
};

 



