// Main validation logic hosted on GitHub
window.initializeFormValidation = function ($form, app_token) {
  let emailValid = false;
  let messageValid = false;

  function sendEmailToBubble(email) {
    const apiUrl = "https://gleemeo.com/api/1.1/wf/record_email"; // Your Bubble API endpoint
    const data = {
      email: email,
      app_token: app_token // Use the dynamic app token
    };

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
      console.error("Error:", error);
    });
  }

  function sendMessageToBubble(message, email) {
    const apiUrl = "https://gleemeo.com/api/1.1/wf/validate_message"; // Your Bubble API endpoint for message validation
    const data = {
      message: message,
      email: email,
      app_token: app_token // Use the dynamic app token
    };

    if (!emailValid) {
      messageValid = false;
      updateSubmitButtonState();
      return;
    }

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
      console.error("Error:", error);
    });
  }

  function updateSubmitButtonState() {
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
 



