// Production API used by the public signup page.
const API_BASE_URL = "https://donexia.in/drmapinew/";
const SEND_OTP_PATH = "sendOtp";
const VERIFY_OTP_PATH = "verifyOtp";
const CREATE_ACCOUNT_PATH = "superAdminRegistration";

let verifiedMobile = "";
let verifiedOtp = "";
let timerInterval;
let canResendOtp = false;
let signupStartTracked = false;
const otpInputs = document.querySelectorAll(".dx-signup-otp-input");

document.querySelector(".dx-signup-page")?.addEventListener("input", event => {
    if (signupStartTracked || !event.target.matches("input, select, textarea")) return;
    signupStartTracked = true;
    window.trackEvent?.("signup_start", {
        product: "Donexia",
        method: "web_form"
    });
});

function apiUrl(path) {
    return `${API_BASE_URL.replace(/\/$/, "")}/${path.replace(/^\//, "")}`;
}

async function postApi(path, requestBody) {
    const response = await fetch(apiUrl(path), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody)
    });

    let data;
    try { data = await response.json(); }
    catch { throw new Error("The server returned an invalid response."); }
    if (!response.ok) throw new Error(data.responseMessage || "Request failed. Please try again.");
    return data;
}

function showMessage(elementId, message, isError = true) {
    const element = document.getElementById(elementId);
    if (!element) return;
    element.textContent = message || "";
    element.style.color = isError ? "#dc3545" : "#198754";
}

const companyLogoInput = document.getElementById("companyLogoFile");
const companyLogoPreview = document.getElementById("companyLogoPreview");
const companyLogoPreviewImage = document.getElementById("companyLogoPreviewImage");
const companyLogoPlaceholder = companyLogoPreview?.querySelector(".dx-signup-logo-placeholder");
const removeCompanyLogoButton = document.getElementById("removeCompanyLogo");
let companyLogoObjectUrl = "";

function clearCompanyLogo() {
    if (companyLogoObjectUrl) URL.revokeObjectURL(companyLogoObjectUrl);
    companyLogoObjectUrl = "";
    if (companyLogoInput) companyLogoInput.value = "";
    if (companyLogoPreviewImage) {
        companyLogoPreviewImage.src = "";
        companyLogoPreviewImage.hidden = true;
    }
    if (companyLogoPlaceholder) companyLogoPlaceholder.hidden = false;
    if (companyLogoPreview) companyLogoPreview.classList.remove("has-image");
    if (removeCompanyLogoButton) removeCompanyLogoButton.hidden = true;
    showMessage("companyLogoError", "");
}

companyLogoInput?.addEventListener("change", () => {
    const file = companyLogoInput.files?.[0];
    showMessage("companyLogoError", "");
    if (!file) return clearCompanyLogo();
    if (!["image/png", "image/jpeg", "image/webp"].includes(file.type)) {
        clearCompanyLogo();
        return showMessage("companyLogoError", "Please choose a PNG, JPG or WEBP image.");
    }
    if (file.size > 2 * 1024 * 1024) {
        clearCompanyLogo();
        return showMessage("companyLogoError", "Logo must be smaller than 2 MB.");
    }
    if (companyLogoObjectUrl) URL.revokeObjectURL(companyLogoObjectUrl);
    companyLogoObjectUrl = URL.createObjectURL(file);
    companyLogoPreviewImage.src = companyLogoObjectUrl;
    companyLogoPreviewImage.hidden = false;
    companyLogoPlaceholder.hidden = true;
    companyLogoPreview.classList.add("has-image");
    removeCompanyLogoButton.hidden = false;
});

removeCompanyLogoButton?.addEventListener("click", clearCompanyLogo);

const fieldErrorMap = {
    mobile: "mobileError",
    firstName: "firstNameError",
    lastName: "lastNameError",
    emailId: "emailError",
    password: "passwordError",
    confirmPassword: "confirmPasswordError",
    terms: "termsError",
    ngoFirstName: "ngoFirstNameError",
    ngoLastName: "ngoLastNameError",
    ngoType: "ngoTypeError",
    website: "websiteError",
    ngoAddress: "ngoAddressError"
};

Object.entries(fieldErrorMap).forEach(([fieldId, errorId]) => {
    const field = document.getElementById(fieldId);
    const eventName = field?.type === "checkbox" || field?.tagName === "SELECT" ? "change" : "input";
    field?.addEventListener(eventName, () => showMessage(errorId, ""));
});

function setButtonLoading(buttonId, isLoading, loadingText) {
    const button = document.getElementById(buttonId);
    if (!button) return;
    if (isLoading) {
        button.dataset.originalContent = button.innerHTML;
        button.disabled = true;
        button.innerHTML = `<span class="spinner-border spinner-border-sm" aria-hidden="true"></span> ${loadingText}`;
    } else {
        button.disabled = false;
        if (button.dataset.originalContent) button.innerHTML = button.dataset.originalContent;
    }
}

function togglePassword(inputId, button) {
    const input = document.getElementById(inputId);
    const reveal = input.type === "password";
    input.type = reveal ? "text" : "password";
    button.setAttribute("aria-label", reveal ? "Hide password" : "Show password");
    button.innerHTML = `<i class="far fa-eye${reveal ? "-slash" : ""}"></i>`;
}

function showSection(sectionId) {
    document.querySelectorAll(".dx-signup-form-card").forEach(card => card.classList.remove("active-card"));
    document.getElementById(sectionId).classList.add("active-card");
    document.querySelector(".dx-signup-page").classList.toggle("dx-signup-success-mode", sectionId === "successSection");
    window.scrollTo({ top: 0, behavior: "smooth" });
}

async function sendOTP(isResend = false) {
    const mobile = document.getElementById("mobile").value.trim();
    showMessage("mobileError", "");
    if (!/^[0-9]{10}$/.test(mobile)) return showMessage("mobileError", "Please enter a valid 10-digit mobile number.");
    if (isResend && !canResendOtp) return;

    const buttonId = isResend ? null : "sendOtpButton";
    if (buttonId) setButtonLoading(buttonId, true, "Sending...");
    if (isResend) {
        canResendOtp = false;
        document.getElementById("timer").textContent = "Sending...";
    }
    try {
        const data = await postApi(SEND_OTP_PATH, { payload: { mobileNo: mobile, requestedFor: "SIGNUP" } });
        const result = data.payload || {};
        if (data.responseCode === 200 && result.respCode === 200) {
            verifiedMobile = mobile;
            verifiedOtp = "";
            otpInputs.forEach(input => { input.value = ""; });
            document.getElementById("displayMobile").textContent = `+91 ${mobile}`;
            showMessage("otpError", result.respMesg || (isResend ? "OTP resent successfully." : "OTP sent successfully."), false);
            showSection("otpSection");
            startTimer();
            setTimeout(() => otpInputs[0]?.focus(), 300);
        } else {
            showMessage(isResend ? "otpError" : "mobileError", result.respMesg || data.responseMessage || "Unable to send OTP.");
            if (isResend) enableOtpResend();
        }
    } catch (error) {
        showMessage(isResend ? "otpError" : "mobileError", error.message);
        if (isResend) enableOtpResend();
    } finally {
        if (buttonId) setButtonLoading(buttonId, false);
    }
}

function resendOTP() {
    sendOTP(true);
}

otpInputs.forEach((input, index) => {
    input.addEventListener("input", function () { this.value = this.value.replace(/\D/g, ""); if (this.value && index < otpInputs.length - 1) otpInputs[index + 1].focus(); });
    input.addEventListener("keydown", event => { if (event.key === "Backspace" && !input.value && index) otpInputs[index - 1].focus(); });
    input.addEventListener("paste", event => { event.preventDefault(); const otp = event.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6); otp.split("").forEach((n, i) => { if (otpInputs[i]) otpInputs[i].value = n; }); });
});

async function verifyOTP() {
    const otp = [...otpInputs].map(input => input.value).join("");
    showMessage("otpError", "");
    if (otp.length !== 6) return showMessage("otpError", "Please enter the complete 6-digit OTP.");
    setButtonLoading("verifyOtpButton", true, "Verifying...");
    try {
        const data = await postApi(VERIFY_OTP_PATH, {
            payload: {
                mobileNo: verifiedMobile || document.getElementById("mobile").value.trim(),
                otp,
                requestedFor: "SIGNUP"
            }
        });
        const result = data.payload || {};
        if (data.responseCode === 200 && result.respCode === 200) {
            verifiedOtp = otp;
            showMessage("otpError", result.respMesg, false);
            showSection("personalSection");
            updateStepper(2);
        } else showMessage("otpError", result.respMesg || data.responseMessage || "OTP verification failed.");
    } catch (error) { showMessage("otpError", error.message); }
    finally { setButtonLoading("verifyOtpButton", false); }
}

function openNgoSection() {
    const firstName = document.getElementById("firstName").value.trim();
    const lastName = document.getElementById("lastName").value.trim();
    const email = document.getElementById("emailId").value.trim();
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirmPassword").value;
    ["firstNameError", "lastNameError", "emailError", "passwordError", "confirmPasswordError", "termsError"].forEach(id => showMessage(id, ""));
    if (firstName.length < 2) return showMessage("firstNameError", "Please enter your first name.");
    if (lastName.length < 2) return showMessage("lastNameError", "Please enter your last name.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return showMessage("emailError", "Please enter a valid email address.");
    if (password.length < 6) return showMessage("passwordError", "Password must contain at least 6 characters.");
    if (password !== confirmPassword) return showMessage("confirmPasswordError", "Passwords do not match.");
    if (!document.getElementById("terms").checked) return showMessage("termsError", "Please accept the Terms of Service and Privacy Policy.");
    showSection("ngoSection"); updateStepper(3);
}

function goBackToPersonalDetails() {
    showSection("personalSection");
    document.getElementById("stepIndicator3").classList.remove("active");
    document.getElementById("stepIndicator2").classList.remove("completed");
    document.getElementById("stepIndicator2").classList.add("active");
    document.getElementById("line2").classList.remove("active");
}

async function createAccount() {
    const ngoFirstName = document.getElementById("ngoFirstName").value.trim();
    const ngoLastName = document.getElementById("ngoLastName").value.trim();
    const ngoType = document.getElementById("ngoType").value;
    const website = document.getElementById("website").value.trim();
    const address = document.getElementById("ngoAddress").value.trim();

    ["ngoFirstNameError", "ngoLastNameError", "ngoTypeError", "websiteError", "ngoAddressError"]
        .forEach(id => showMessage(id, ""));

    let firstInvalidField = null;
    const requireField = (condition, fieldId, errorId, message) => {
        if (condition) return;
        showMessage(errorId, message);
        if (!firstInvalidField) firstInvalidField = document.getElementById(fieldId);
    };

    requireField(ngoFirstName.length >= 2, "ngoFirstName", "ngoFirstNameError", "Please enter the NGO first name.");
    requireField(ngoLastName.length >= 2, "ngoLastName", "ngoLastNameError", "Please enter the NGO last name.");
    requireField(Boolean(ngoType), "ngoType", "ngoTypeError", "Please select an NGO type.");
    requireField(Boolean(website), "website", "websiteError", "Please enter the NGO website.");
    requireField(!website || /^https?:\/\/.+\..+/i.test(website), "website", "websiteError", "Enter a complete URL starting with http:// or https://.");
    requireField(Boolean(address), "ngoAddress", "ngoAddressError", "Please enter the complete NGO address.");

    if (firstInvalidField) {
        firstInvalidField.focus();
        firstInvalidField.scrollIntoView({ behavior: "smooth", block: "center" });
        return;
    }

    const requestBody = {
        payload: {
            firstName: document.getElementById("firstName").value.trim(),
            lastName: document.getElementById("lastName").value.trim(),
            mobileNo: document.getElementById("mobile").value.trim(),
            alternateMobile: "",
            emailId: document.getElementById("emailId").value.trim(),
            password: document.getElementById("password").value,
            roleType: "SUPERADMIN",
            service: "DONATION",
            userPicture: "",
            aadharNumber: "1",
            panNumber: "ABCDE1234F",
            createdBy: "SYSTEM",
            dob: "",
            otp: verifiedOtp,
            invoiceHeaderRequest: {
                companyFirstName: ngoFirstName,
                companyLastName: ngoLastName,
                regAddress: address,
                website
            }
        }
    };

    const formData = new FormData();

    // JSON payload
    formData.append("payload", JSON.stringify(requestBody));

    // Company Logo (optional)
    const logoInput = document.getElementById("companyLogoFile");

    if (logoInput && logoInput.files.length > 0) {
        formData.append("companyLogoFile", logoInput.files[0]);
    }

    setButtonLoading("createAccountButton", true, "Creating...");

    try {

        const response = await fetch(apiUrl(CREATE_ACCOUNT_PATH), {
            method: "POST",
            body: formData
        });

        const data = await response.json();

        const result = data.payload || {};

        if (response.ok && data.responseCode === 200 && result.respCode === 200) {
            window.trackEvent?.("sign_up", {
                method: "donexia_web_form",
                product: "Donexia",
                currency: "INR",
                value: 1500
            });
            showSection("successSection");

        } else {

            alert(result.respMesg || data.responseMessage || "Account creation failed.");
        }

    } catch (error) {

        console.error(error);
        alert(error.message || "Something went wrong.");

    } finally {

        setButtonLoading("createAccountButton", false);
    }
}

function updateStepper(step) { if (step >= 2) { document.getElementById("stepIndicator1").classList.add("completed"); document.getElementById("stepIndicator2").classList.add("active"); document.getElementById("line1").classList.add("active"); } if (step >= 3) { document.getElementById("stepIndicator2").classList.add("completed"); document.getElementById("stepIndicator3").classList.add("active"); document.getElementById("line2").classList.add("active"); } }
function enableOtpResend() {
    canResendOtp = true;
    const resendText = document.getElementById("resendText");
    const timer = document.getElementById("timer");
    resendText.textContent = "Didn't receive the OTP?";
    timer.textContent = "Resend OTP";
    timer.style.cursor = "pointer";
    timer.style.textDecoration = "underline";
    timer.setAttribute("role", "button");
    timer.setAttribute("tabindex", "0");
    timer.onclick = resendOTP;
    timer.onkeydown = event => {
        if (event.key === "Enter" || event.key === " ") resendOTP();
    };
}

function startTimer() {
    clearInterval(timerInterval);
    canResendOtp = false;
    let time = 120;
    const resendText = document.getElementById("resendText");
    const timer = document.getElementById("timer");
    resendText.textContent = "Resend OTP in";
    timer.style.cursor = "default";
    timer.style.textDecoration = "none";
    timer.removeAttribute("role");
    timer.removeAttribute("tabindex");
    timer.onclick = null;
    timer.onkeydown = null;

    const renderTime = () => {
        const minutes = Math.floor(time / 60);
        const seconds = time % 60;
        timer.textContent = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
    };

    renderTime();
    timerInterval = setInterval(() => {
        time--;
        if (time <= 0) {
            clearInterval(timerInterval);
            enableOtpResend();
            return;
        }
        renderTime();
    }, 1000);
}
