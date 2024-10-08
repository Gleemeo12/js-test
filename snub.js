(function () {
  function initializeGleemeo(options, $form) {
    let emailValid = false;
    let messageValid = false;

    // Debugging: Ensure app_token is passed correctly
    console.log("Initializing with app_token:", options.app_token);

    function sendEmailToBubble(email, appToken) {
      const apiUrl = "https://gleemeo.com/api/1.1/wf/record_email";
      const data = {
        email: email,
        app_token: appToken
      };

      console.log("Sending email validation request:", email);  // Debugging API call

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
        console.log("Email validation response:", data);  // Debugging API response
        if (data.status === "blocked") {
          emailValid = false;
          $form.find(".feedback-message").text("Invalid email").css("color", "red");
        } else {
          emailValid = true;
          $form.find(".feedback-message").text("Valid email").css("color", "green");
        }
        updateSubmitButtonState($form);
      })
      .catch(error => {
        console.error("Error during email validation:", error);
      });
    }

    function sendMessageToBubble(message, email, appToken) {
      const apiUrl = "https://gleemeo.com/api/1.1/wf/validate_message";
      const data = {
        message: message,
        email: email,
        app_token: appToken
      };

      if (!emailValid) {
        messageValid = false;
        $form.find(".feedback-message").text("Blocked email, skipping message validation").css("color", "red");
        updateSubmitButtonState($form);
        return;
      }

      console.log("Sending message validation request:", message);  // Debugging message validation

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
        console.log("Message validation response:", data);  // Debugging API response
        if (data.status === "spam") {
          messageValid = false;
          $form.find(".feedback-message").text("Spam message detected").css("color", "red");
        } else {
          messageValid = true;
          $form.find(".feedback-message").text("Legitimate message").css("color", "green");
        }
        updateSubmitButtonState($form);
      })
      .catch(error => {
        console.error("Error during message validation:", error);
      });
    }

    function updateSubmitButtonState($form) {
      const submitButton = $form.find("button, input[type='submit']");
      if (emailValid && messageValid) {
        console.log("Form is valid, enabling submit button");  // Debugging button state
        submitButton.removeAttr("disabled").css({
          'opacity': '1',
          'pointer-events': 'auto'
        });
      } else {
        console.log("Form is invalid, disabling submit button");  // Debugging button state
        submitButton.attr("disabled", "disabled").css({
          'opacity': '0.5',
          'pointer-events': 'none'
        });
      }
    }

    // Append feedback message container
    $form.append('<div class="feedback-message"></div>');

    // Email field validation on blur
    $form.find("input[type='email']").on("blur", function () {
      const email = $(this).val();
      console.log("Email field blur detected:", email);  // Debugging blur event
      if (email) {
        console.log("Triggering sendEmailToBubble with app_token:", options.app_token);  // Debugging
        sendEmailToBubble(email, options.app_token);
      }
    });

    // Message field validation on blur
    $form.find("textarea[name='message']").on("blur", function () {
      const message = $(this).val();
      const email = $form.find("input[type='email']").val();
      console.log("Message field blur detected:", message);  // Debugging blur event
      if (message) {
        console.log("Triggering sendMessageToBubble with app_token:", options.app_token);  // Debugging
        sendMessageToBubble(message, email, options.app_token);
      }
    });

    // Prevent form submission if invalid
    $form.on("submit", function (e) {
      if ($form.find("button, input[type='submit']").is(":disabled")) {
        console.log("Form submission prevented due to validation errors");  // Debugging form submission prevention
        e.preventDefault();
      }
    });
  }

  // Initialize gleemeo on form ready
  window.gleemeo = window.gleemeo || [];
  window.gleemeo.push(["initialize", function (opts, $form) {
    initializeGleemeo(opts, $form);
  }]);
})();
 



