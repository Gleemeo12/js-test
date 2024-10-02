function sendEmailToBubble(email, app_token) {
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
    console.log("Email validation response:", data);
    // Handle the response, update feedback messages, etc.
  })
  .catch(error => {
    console.error("Error during email validation:", error);
  });
}

function sendMessageToBubble(message, email, app_token) {
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
    console.log("Message validation response:", data);
    // Handle the response, update feedback messages, etc.
  })
  .catch(error => {
    console.error("Error during message validation:", error);
  });
}

// Other validation and form handling functions can be added here

 



