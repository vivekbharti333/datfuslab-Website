/* ─── app.js ─────────────────────────────────────────── */

const BASE_URL        = "https://donexia.in/drmapinew/";
const SEND_OTP_URL    = `${BASE_URL}/sendOtp`;
const REGISTER_URL    = `${BASE_URL}/addUserDirectWeb`;

/* ── Helpers ──────────────────────────────────────────── */

function showMessage(isSuccess, message) {
  const box  = document.getElementById("responseMsg");
  const icon = document.getElementById("msgIcon");
  const text = document.getElementById("msgText");

  box.className        = "response-msg " + (isSuccess ? "success" : "error");
  icon.textContent     = isSuccess ? "✓" : "✕";
  text.textContent     = message;
  box.style.display    = "flex";
  box.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

function hideMessage() {
  document.getElementById("responseMsg").style.display = "none";
}

/* ── Send OTP ─────────────────────────────────────────── */

document.getElementById("sendOtpBtn").addEventListener("click", async function () {
  hideMessage();

  const mobileNo = document.getElementById("mobileNo").value.trim();

  if (!/^\d{10}$/.test(mobileNo)) {
    showMessage(false, "Please enter a valid 10-digit mobile number before sending OTP.");
    return;
  }

  // Loading state
  const btn     = this;
  const btnText = btn.querySelector(".otp-btn-text");
  const spinner = document.getElementById("otpSpinner");
  btn.disabled       = true;
  btnText.style.opacity = "0";
  spinner.style.display = "inline-block";

  try {
    const response = await fetch(SEND_OTP_URL, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ payload: { mobileNo } }),
    });

    const data  = await response.json();
    const inner = data?.payload;

    if (!inner) {
      showMessage(false, "Unexpected response from server.");
      return;
    }

    if (inner.respCode === 200) {
      // ✅ OTP sent — enable OTP field and Register button
      showMessage(true, inner.respMesg);          // "OTP Send on 1252565897"

      const otpInput  = document.getElementById("otp");
      const submitBtn = document.getElementById("submitBtn");
      const otpHint   = document.getElementById("otpHint");

      otpInput.disabled  = false;
      otpInput.placeholder = "Enter 6-digit OTP";
      otpInput.focus();

      submitBtn.disabled = false;

      otpHint.textContent = "✓ OTP sent";
      otpHint.className   = "otp-hint sent";

      // Start 30-second resend cooldown
      startResendCooldown(btn, btnText);

    } else {
      showMessage(false, inner.respMesg || "Failed to send OTP.");
      resetOtpBtn(btn, btnText, spinner);
    }

  } catch (err) {
    showMessage(false, "Network error: " + err.message);
    console.error("Send OTP error:", err);
    resetOtpBtn(btn, btnText, spinner);
  } finally {
    spinner.style.display = "none";
    btnText.style.opacity = "1";
  }
});

function resetOtpBtn(btn, btnText, spinner) {
  btn.disabled          = false;
  btnText.style.opacity = "1";
  spinner.style.display = "none";
}

/** 30s cooldown before allowing resend */
function startResendCooldown(btn, btnText) {
  let seconds = 30;
  btnText.textContent = `Resend (${seconds}s)`;

  const timer = setInterval(() => {
    seconds--;
    if (seconds <= 0) {
      clearInterval(timer);
      btn.disabled        = false;
      btnText.textContent = "Resend OTP";
    } else {
      btnText.textContent = `Resend (${seconds}s)`;
      btn.disabled        = true;
    }
  }, 1000);
}

/* ── Register ─────────────────────────────────────────── */

document.getElementById("registerForm").addEventListener("submit", async function (e) {
  e.preventDefault();
  hideMessage();

  // Build payload
  const payload = {
    firstName:       document.getElementById("firstName").value.trim(),
    lastName:        document.getElementById("lastName").value.trim(),
    mobileNo:        document.getElementById("mobileNo").value.trim(),
    alternateMobile: document.getElementById("alternateMobile").value.trim(),
    emailId:         document.getElementById("emailId").value.trim(),
    password:        document.getElementById("password").value,
    roleType:        document.getElementById("roleType").value,
    service:         document.getElementById("service").value,
    userPicture:     document.getElementById("userPicture").value,
   // aadharNumber:    document.getElementById("aadharNumber").value.trim(),
   // panNumber:       document.getElementById("panNumber").value.trim().toUpperCase(),
    createdBy:       document.getElementById("createdBy").value,
    dob:             document.getElementById("dob").value,
    otp:             document.getElementById("otp").value.trim(),
  };

  // Front-end validation
  if (!payload.firstName || !payload.lastName) {
    showMessage(false, "First name and last name are required."); return;
  }
  if (!/^\d{10}$/.test(payload.mobileNo)) {
    showMessage(false, "Mobile number must be 10 digits."); return;
  }
  if (!payload.emailId) {
    showMessage(false, "A valid email address is required."); return;
  }
  // if (!payload.aadharNumber || payload.aadharNumber.length !== 12) {
  //   showMessage(false, "Aadhaar must be exactly 12 digits."); return;
  // }
  // if (!payload.panNumber || payload.panNumber.length !== 10) {
  //   showMessage(false, "PAN must be 10 characters (e.g. ABCDE1234F)."); return;
  // }
  if (!/^\d{6}$/.test(payload.otp)) {
    showMessage(false, "OTP must be exactly 6 digits."); return;
  }

  // Loading state
  const btn     = document.getElementById("submitBtn");
  const spinner = document.getElementById("spinner");
  btn.disabled                                       = true;
  document.querySelector(".btn-text").style.opacity  = "0";
  spinner.style.display                              = "inline-block";

  try {
    const response = await fetch(REGISTER_URL, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ payload }),
    });

    const data  = await response.json();
    const inner = data?.payload;

    if (!inner) {
      showMessage(false, "Unexpected response from server."); return;
    }

    if (inner.respCode === 200) {
      showMessage(true, inner.respMesg);    // "Registered Successfully"
      document.getElementById("registerForm").reset();

      // Lock OTP field and Register button again after success
      document.getElementById("otp").disabled = true;
      document.getElementById("otp").placeholder = "Click 'Send OTP' first";
      btn.disabled = true;
      document.getElementById("otpHint").textContent = "";

    } else {
      showMessage(false, inner.respMesg);   // "Wrong OTP"
      btn.disabled = false;
    }

  } catch (err) {
    showMessage(false, "Network error: " + err.message);
    console.error("Register error:", err);
    btn.disabled = false;
  } finally {
    document.querySelector(".btn-text").style.opacity = "1";
    spinner.style.display = "none";
  }
});
