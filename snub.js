(function () {
  function initializeGleemeo(options, $form) {
    let emailValid = false;
    let messageValid = false;

    function sendEmailToBubble(email, appToken) {
      const apiUrl = "https://gleemeo.com/api/1.1/wf/record_email";
      const data = {
        email: email,
        app_token: appToken
      };

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
        if (data.status === "blocked") {
          emailValid = false;
          updateSubmitButtonState($form);
          $form.find(".feedback-message").text("Invalid email").css("color", "red");
        } else {
          emailValid = true;
          $form.find(".feedback-message").text("Valid email").css("color", "green");
          updateSubmitButtonState($form);
        }
      })
      .catch(error => {
        console.error("Error:", error);
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
        console.error("Error:", error);
      });
    }

    function updateSubmitButtonState($form) {
      const submitButton = $form.find("button, input[type='submit']");
      if (emailValid && messageValid) {
        submitButton.removeAttr("disabled").css({
          'opacity': '1',
          'pointer-events': 'auto'
        });
      } else {
        submitButton.attr("disabled", "disabled").css({
          'opacity': '0.5',
          'pointer-events': 'none'
        });
      }
    }

    $form.append('<div class="feedback-message"></div>');

    $form.find("input[type='email']").on("blur", function () {
      const email = $(this).val();
      if (email) {
        sendEmailToBubble(email, options.app_token);
      }
    });

    $form.find("textarea[name='message']").on("blur", function () {
      const message = $(this).val();
      const email = $form.find("input[type='email']").val();
      if (message) {
        sendMessageToBubble(message, email, options.app_token);
      }
    });

    $form.on("submit", function (e) {
      if ($form.find("button, input[type='submit']").is(":disabled")) {
        e.preventDefault();
      }
    });
  }

  window.gleemeo = window.gleemeo || [];
  window.gleemeo.push(["initialize", function (opts, $form) {
    initializeGleemeo(opts, $form);
  }]);
})();
 



