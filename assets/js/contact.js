const API_URL = "https://donexia.in/drmapinew/sendContactFormEmail";

document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("contact-form");
    const messageDiv = document.getElementById("contactMessage");

    if (!form || !messageDiv) {
        console.error("Contact form or contactMessage element not found.");
        return;
    }

    const requestedSubject = new URLSearchParams(window.location.search).get("subject");
    const subjectSelect = document.getElementById("subject");
    if (requestedSubject && subjectSelect) {
        const matchingOption = Array.from(subjectSelect.options)
            .find(option => option.value === requestedSubject);
        if (matchingOption) {
            subjectSelect.value = requestedSubject;
            if (window.jQuery && typeof window.jQuery.fn.niceSelect === "function") {
                window.jQuery(subjectSelect).niceSelect("update");
            }
        }
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

            const responseText = await response.text();
            let result = {};

            if (responseText) {
                try {
                    result = JSON.parse(responseText);
                } catch (jsonError) {
                    result = { responseMessage: responseText };
                }
            }

            console.log("Contact API response:", result);

            const payload = result && result.payload ? result.payload : {};
            const responseCode = Number(result.responseCode);
            const payloadCode = Number(payload.respCode);
            const hasErrorCode =
                (Number.isFinite(responseCode) && responseCode >= 400) ||
                (Number.isFinite(payloadCode) && payloadCode >= 400);
            const isSuccess = response.ok && !hasErrorCode;

            if (isSuccess) {
                const selectedService = request.payload.leadFor;
                const isDemoRequest = selectedService === "Donexia Demo";

                window.trackEvent?.("generate_lead", {
                    lead_type: isDemoRequest ? "demo_request" : "contact_form",
                    service: selectedService || "general_enquiry",
                    currency: "INR",
                    value: isDemoRequest ? 1000 : 500
                });

                const successMessage =
                    payload.respMesg ||
                    result.responseMessage ||
                    "Message sent successfully.";

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
                    payload.respMesg ||
                    result.responseMessage ||
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

            const errorMessage =
                error && error.message === "Failed to fetch"
                    ? "The server could not be reached. Please try again shortly."
                    : error.message || "Something went wrong. Please try again later.";

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
