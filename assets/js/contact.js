const API_URL = "https://donexia.in/drmapinew/sendContactFormEmail";

document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("contact-form");
    const messageDiv = document.getElementById("contactMessage");

    if (!form || !messageDiv) {
        console.error("Contact form or contactMessage element not found.");
        return;
    }

    form.addEventListener("submit", async function (e) {
        e.preventDefault();

        messageDiv.innerHTML = "";

        const submitBtn = form.querySelector("button[type='submit']");
        const originalButtonContent = submitBtn.innerHTML;

        submitBtn.disabled = true;
        submitBtn.innerHTML =
            'Sending... <i class="fal fa-spinner fa-spin ms-2"></i>';

        const request = {
            payload: {
                contactName: document
                    .getElementById("fullName")
                    .value.trim(),

                emailId: document
                    .getElementById("email")
                    .value.trim(),

                mobileNumber: document
                    .getElementById("phone")
                    .value.trim(),

                companyName: document
                    .getElementById("organization")
                    .value.trim(),

                leadFor: document
                    .getElementById("subject")
                    .value,

                notes: document
                    .getElementById("message")
                    .value.trim()
            }
        };

        try {
            const response = await fetch(API_URL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(request)
            });

            let result;

            try {
                result = await response.json();
            } catch (jsonError) {
                throw new Error("Invalid response received from server.");
            }

            console.log("Contact API response:", result);

            if (
                response.ok &&
                result.responseCode === 200 &&
                result.payload &&
                result.payload.respCode === 200
            ) {
                const successMessage =
                    result.payload.respMesg || "Message sent successfully.";

                messageDiv.innerHTML = `
                    <div class="alert alert-success alert-dismissible fade show" role="alert">
                        <strong>Success!</strong> ${escapeHtml(successMessage)}
                        <button
                            type="button"
                            class="btn-close"
                            data-bs-dismiss="alert"
                            aria-label="Close">
                        </button>
                    </div>
                `;

                // Reset the form without reloading the page
                form.reset();

                // Reset Nice Select after form reset
                if (
                    window.jQuery &&
                    typeof window.jQuery.fn.niceSelect === "function"
                ) {
                    window.jQuery("#subject").niceSelect("update");
                }

                // Scroll response message into view
                messageDiv.scrollIntoView({
                    behavior: "smooth",
                    block: "nearest"
                });
            } else {
                const errorMessage =
                    result?.payload?.respMesg ||
                    result?.responseMessage ||
                    "Unable to process your request.";

                messageDiv.innerHTML = `
                    <div class="alert alert-danger alert-dismissible fade show" role="alert">
                        <strong>Error!</strong> ${escapeHtml(errorMessage)}
                        <button
                            type="button"
                            class="btn-close"
                            data-bs-dismiss="alert"
                            aria-label="Close">
                        </button>
                    </div>
                `;

                messageDiv.scrollIntoView({
                    behavior: "smooth",
                    block: "nearest"
                });
            }
        } catch (error) {
            console.error("Contact form error:", error);

            messageDiv.innerHTML = `
                <div class="alert alert-danger alert-dismissible fade show" role="alert">
                    <strong>Error!</strong> Something went wrong. Please try again later.
                    <button
                        type="button"
                        class="btn-close"
                        data-bs-dismiss="alert"
                        aria-label="Close">
                    </button>
                </div>
            `;

            messageDiv.scrollIntoView({
                behavior: "smooth",
                block: "nearest"
            });
        } finally {
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalButtonContent;
        }
    });
});

function escapeHtml(value) {
    const div = document.createElement("div");
    div.textContent = String(value ?? "");
    return div.innerHTML;
}