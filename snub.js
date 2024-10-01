(function() {
  window.validateForm = window.validateForm || [];

  // Listen for the form initialization event
  window.validateForm.push = function(args) {
    var opts = args[1];
    var appToken = opts.app_token;
    var hubspotRegion = opts.region;
    var hubspotPortalId = opts.portalId;
    var hubspotFormId = opts.formId;

    // Wait for the document to be ready
    document.addEventListener('DOMContentLoaded', function() {
      hbspt.forms.create({
        region: hubspotRegion,
        portalId: hubspotPortalId,
        formId: hubspotFormId,
        onFormReady: function($form) {
          let emailValid = false;
          let messageValid = false;

          // Email validation function
          function validateEmail(email) {
            fetch("https://gleemeo.com/api/1.1/wf/record_email", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${appToken}`
              },
              body: JSON.stringify({ email: email })
            })
            .then(response => response.json())
            .then(data => {
              emailValid = data.status !== "blocked";
              updateFormState($form);
            })
            .catch(error => console.error("Email validation error:", error));
          }

          // Message validation function
          function validateMessage(message, email) {
            fetch("https://gleemeo.com/api/1.1/wf/validate_message", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${appToken}`
              },
              body: JSON.stringify({ message: message, email: email })
            })
            .then(response => response.json())
            .then(data => {
              messageValid = data.status !== "spam";
              updateFormState($form);
            })
            .catch(error => console.error("Message validation error:", error));
          }

          // Disable form submission if validation fails
          function updateFormState($form) {
            const submitButton = $form.find("button, input[type='submit']");
            if (emailValid && messageValid) {
              submitButton.removeAttr("disabled").css({ 'opacity': '1', 'pointer-events': 'auto' });
            } else {
              submitButton.attr("disabled", "disabled").css({ 'opacity': '0.5', 'pointer-events': 'none' });
            }
          }

          // Event listeners for form inputs
          $form.find("input[type='email']").on("blur", function() {
            const email = $(this).val();
            if (email) validateEmail(email);
          });

          $form.find("textarea[name='message']").on("blur", function() {
            const message = $(this).val();
            const email = $form.find("input[type='email']").val();
            if (message) validateMessage(message, email);
          });

          // Prevent form submission if validation fails
          $form.on("submit", function(e) {
            if ($form.find("button, input[type='submit']").is(":disabled")) {
              e.preventDefault();
            }
          });
        }
      });
    });
  };
})();
