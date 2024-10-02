window.initializeFormValidation = function($form, appToken) {
  console.log("initializeFormValidation called");

  let emailValid = false;
  let messageValid = false;

  // Function to send email to Bubble API when email input field is changed
  function sendEmailToBubble(email) {
    console.log("Sending email for validation: ", email);
    const apiUrl = "https://gleemeo.com/api/1.1/wf/record_email"; // Your Bubble API endpoint
    const data = { email: email, app_token: appToken }; // Use the app token passed to the function

    fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${appToken}` // Use app token in Authorization header
      },
      body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(data => {
      console.log("Response from email validation: ", data);
      if (data.status === "blocked") {
        emailValid = false;
        updateSubmitButtonState();
        $form.find(".feedback-message").text("Invalid email").css("color", "red");
      } else {
        emailValid = true;
        $form.find(".feedback-message").text("Valid email").css("color", "green");
        updateSubmitButtonState();
      }
    })
    .catch(error => {
      console.error("Error:", error);
    });
  }

  // Function to send message to Bubble API for validation
  function sendMessageToBubble(message, email) {
    console.log("Sending message for validation: ", message);
    const apiUrl = "https://gleemeo.com/api/1.1/wf/validate_message";
    const data = { message: message, email: email, app_token: appToken };

    if (!emailValid) {
      messageValid = false;
      $form.find(".feedback-message").text("Blocked email, skipping message validation").css("color", "red");
      updateSubmitButtonState();
      return;
    }

    fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${appToken}`
      },
      body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(data => {
      console.log("Response from message validation: ", data);
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
      console.error("Error:", error);
    });
  }

  // Function to update the submit button state
  function updateSubmitButtonState() {
    const submitButton = $form.find("button, input[type='submit']");
    if (emailValid && messageValid) {
      submitButton.removeAttr("disabled").css({ 'opacity': '1', 'pointer-events': 'auto' });
    } else {
      submitButton.attr("disabled", "disabled").css({ 'opacity': '0.5', 'pointer-events': 'none' });
    }
  }

  // Attach event listeners for real-time validation
  $form.find("input[type='email']").on("blur", function () {
    const email = $(this).val();
    if (email) {
      sendEmailToBubble(email);
    }
  });

  $form.find("textarea[name='message']").on("blur", function () {
    const message = $(this).val();
    const email = $form.find("input[type='email']").val();
    if (message) {
      sendMessageToBubble(message, email);
    }
  });

  // Prevent form submission if validation fails
  $form.on("submit", function (e) {
    if (!emailValid || !messageValid) {
      e.preventDefault();
    }
  });
};

