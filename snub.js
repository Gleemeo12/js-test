(function () {
    var formSelector = 'input[type="email"]';
    var submitButtonSelector = 'button[type="submit"]';

    // Use the configuration from the embedded script
    var api_url = window.emailValidation.api_url;
    var appToken = window.emailValidation.app_token;

    function disableSubmitButton() {
        var submitButton = document.querySelector(submitButtonSelector);
        if (submitButton) {
            submitButton.disabled = true;
        }
    }

    function enableSubmitButton() {
        var submitButton = document.querySelector(submitButtonSelector);
        if (submitButton) {
            submitButton.disabled = false;
        }
    }

    function showValidationResult(isValid) {
        var emailField = document.querySelector(formSelector);
        if (isValid) {
            emailField.classList.add("valid-email");
            emailField.classList.remove("invalid-email");
        } else {
            emailField.classList.add("invalid-email");
            emailField.classList.remove("valid-email");
        }
    }

    function validateEmail(email) {
        var xhr = new XMLHttpRequest();
        xhr.open("POST", api_url, true);
        xhr.setRequestHeader("Content-Type", "application/json");

        xhr.onreadystatechange = function () {
            if (xhr.readyState === XMLHttpRequest.DONE) {
                var response = JSON.parse(xhr.responseText);
                if (response && response.valid) {
                    showValidationResult(true);
                    enableSubmitButton();
                } else {
                    showValidationResult(false);
                    disableSubmitButton();
                }
            }
        };

        xhr.send(JSON.stringify({
            email: email,
            app_token: appToken
        }));
    }

    document.addEventListener("input", function (event) {
        var emailField = document.querySelector(formSelector);
        if (emailField && emailField.value) {
            var email = emailField.value;
            var emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (emailPattern.test(email)) {
                validateEmail(email);
            } else {
                showValidationResult(false);
                disableSubmitButton();
            }
        }
    });

    disableSubmitButton();
})();
