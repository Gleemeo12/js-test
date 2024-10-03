(function() {
  // Ensure the code executes after the external script is loaded
  var emailValid = false;
  var messageValid = false;

  function sendEmailToBubble(email, app_token, $form) {
    const apiUrl = "https://gleemeo.com/api/1.1/wf/record_email"; // Your Bubble API endpoint
    const data = {
      email: email,
      app_token: app_token
    };

    console.log("Sending email:", email);
    console.log("Data to send:", data);

    fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + app_token
      },
      body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(data => {
      if (data.status === "blocked") {
        console.log("Email is blocked, disabling submit button.");
        emailValid = false;
        updateSubmitButtonState($form);
        $form.find(".feedback-message").text("Invalid email").css("color", "red");
      } else {
        console.log("Email is valid.");
        emailValid = true;
        $form.find(".feedback-message").text("Valid email").css("color", "green");
        updateSubmitButtonState($form);
      }
    })
    .catch(error => {
      console.error("Error:", error);
    });
  }

  function sendMessageToBubble(message, email, app_token, $form) {
    const apiUrl = "https://gleemeo.com/api/1.1/wf/validate_message"; // Your Bubble API endpoint for message validation
    const data = {
      message: message,
      email: email,
      app_token: app_token
    };

    console.log("Sending message:", message);
    console.log("Data to send:", data);

    if (!emailValid) {
      console.log("Email is blocked, skipping Gemini API call.");
      messageValid = false;
      $form.find(".feedback-message").text("Blocked email, skipping message validation").css("color", "red");
      updateSubmitButtonState($form);
      return; // Skip API call if the email is blocked
    }

    fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + app_token
      },
      body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(data => {
      console.log("Response from Bubble:", data); // Log API response
      if (data.status === "spam") {
        console.log("Message is spam, disabling submit button.");
        messageValid = false;
        $form.find(".feedback-message").text("Spam message detected").css("color", "red");
      } else {
        console.log("Message is legitimate.");
        messageValid = true;
        $form.find(".feedback-message").text("Legitimate message").css("color", "green");
      }
      updateSubmitButtonState($form);
    })
    .catch(error => {
      console.error("Error:", error);
    });
  }

  function updateSubmitButtonState($form) {
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

  // Add feedback message element in the form
  $(document).ready(function() {
    const $form = $('form'); // Assuming there's a single form on the page

    $form.append('<div class="feedback-message"></div>');

    // Attach event listeners to the email and message fields
    $form.find("input[type='email']").on("blur", function () {
      const email = $(this).val();
      console.log("Email field changed:", email);
      if (email) {
        sendEmailToBubble(email, opts.app_token, $form); // Call email validation function
      }
    });

    $form.find("textarea[name='message']").on("blur", function () {
      const message = $(this).val();
      console.log("Message field changed:", message);
      const email = $form.find("input[type='email']").val(); // Retrieve email value for validation
      if (message) {
        sendMessageToBubble(message, email, opts.app_token, $form); // Call message validation function
      }
    });

    // Prevent submission if email or message is blocked
    $form.on("submit", function (e) {
      if ($form.find("button, input[type='submit']").is(":disabled")) {
        console.log("Form submission prevented due to disabled button.");
        e.preventDefault();
      }
    });
  });
})();



