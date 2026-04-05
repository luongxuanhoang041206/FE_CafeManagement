function showPopup(type, message, onConfirm) {
    document.getElementById("customPopup")?.remove();

    const isSuccess = type === "success";
    const popup = document.createElement("div");
    popup.id = "customPopup";
    popup.innerHTML = `
        <div class="popup-overlay">
            <div class="popup-box popup-${type}">
                <div class="popup-icon">${isSuccess ? "OK" : "!"}</div>
                <p class="popup-message">${message}</p>
                <button class="popup-btn popup-btn-${type}" id="popupConfirmBtn">
                    ${isSuccess ? "Continue" : "Close"}
                </button>
            </div>
        </div>
    `;
    document.body.appendChild(popup);

    requestAnimationFrame(() => {
        popup.querySelector(".popup-overlay").classList.add("show");
        popup.querySelector(".popup-box").classList.add("show");
    });

    document.getElementById("popupConfirmBtn").addEventListener("click", () => {
        popup.querySelector(".popup-box").classList.remove("show");
        setTimeout(() => {
            popup.remove();
            onConfirm?.();
        }, 250);
    });
}

const popupStyle = document.createElement("style");
popupStyle.textContent = `
    .popup-overlay {
        position: fixed;
        inset: 0;
        background: rgba(59, 47, 47, 0.45);
        backdrop-filter: blur(3px);
        z-index: 99999;
        display: flex;
        align-items: center;
        justify-content: center;
        opacity: 0;
        transition: opacity 0.25s ease;
    }
    .popup-overlay.show { opacity: 1; }

    .popup-box {
        background: #f5f2ed;
        border-radius: 20px;
        padding: 40px 36px 32px;
        width: 340px;
        text-align: center;
        box-shadow: 0 24px 64px rgba(59, 47, 47, 0.22);
        transform: translateY(24px) scale(0.96);
        transition: transform 0.28s cubic-bezier(0.34, 1.56, 0.64, 1);
        border-top: 5px solid #b77e4b;
    }
    .popup-box.popup-error { border-top-color: #c0392b; }
    .popup-box.show { transform: translateY(0) scale(1); }

    .popup-icon {
        font-size: 2rem;
        margin-bottom: 14px;
        line-height: 1;
        font-weight: 700;
        color: #3b2f2f;
    }
    .popup-message {
        font-family: "Montserrat", sans-serif;
        font-size: 15px;
        font-weight: 600;
        color: #3b2f2f;
        line-height: 1.6;
        margin-bottom: 24px;
    }
    .popup-btn {
        padding: 10px 32px;
        border: none;
        border-radius: 10px;
        font-family: "Montserrat", sans-serif;
        font-size: 14px;
        font-weight: 700;
        cursor: pointer;
        transition: background 0.2s, transform 0.1s;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
    }
    .popup-btn-success { background: #b77e4b; color: #fff; }
    .popup-btn-success:hover { background: #d1670b; }
    .popup-btn-error { background: #3b2f2f; color: #fff; }
    .popup-btn-error:hover { background: #5c4a3d; }
    .popup-btn:active { transform: scale(0.96); }
`;
document.head.appendChild(popupStyle);

const API_BASE_URL = "https://cafemanagement-rgd5.onrender.com";
const resetPasswordForm = document.getElementById("resetPasswordForm");
const resetPasswordButton = document.getElementById("resetPasswordBtn");
const tokenStatusText = document.getElementById("tokenStatusText");
const tokenPreview = document.getElementById("tokenPreview");
const newPasswordInput = document.getElementById("newPassword");
const confirmPasswordInput = document.getElementById("confirmPassword");

function getTokenFromUrl() {
    const params = new URLSearchParams(window.location.search);
    return params.get("token")?.trim() || "";
}

function setFormEnabled(isEnabled) {
    newPasswordInput.disabled = !isEnabled;
    confirmPasswordInput.disabled = !isEnabled;
    resetPasswordButton.disabled = !isEnabled;
}

function setStatus(message, type) {
    tokenStatusText.textContent = message;
    tokenStatusText.classList.remove("status_ready", "status_error", "status_loading");
    tokenStatusText.classList.add(type);
}

async function validateResetToken(token) {
    const endpoint = `${API_BASE_URL}/reset-password/validate?token=${encodeURIComponent(token)}`;

    try {
        const response = await fetch(endpoint, {
            method: "GET"
        });

        if (response.ok) {
            return true;
        }

        const errorText = await response.text();
        throw new Error(errorText || "Invalid or expired reset link.");
    } catch (error) {
        throw new Error(error.message || "Invalid or expired reset link.");
    }
}

async function submitPasswordReset(token, newPassword) {
    const endpoint = `${API_BASE_URL}/resetPassword`;

    try {
        const response = await fetch(endpoint, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                token,
                newPassword
            })
        });

        if (response.ok) {
            return true;
        }

        const errorText = await response.text();
        throw new Error(errorText || "Could not reset password.");
    } catch (error) {
        throw new Error(error.message || "Could not reset password.");
    }
}

async function initializeResetPage() {
    const token = getTokenFromUrl();
    tokenPreview.value = token || "Missing token";

    if (!token) {
        setStatus("This reset link is missing a token.", "status_error");
        document.getElementById("resetHelpText").innerHTML =
            'Please open the link in this format: <code>/client/pages/reset-password.html?token=...</code>';
        setFormEnabled(false);
        return;
    }

    setStatus("Checking whether your reset link is still valid.", "status_loading");
    setFormEnabled(false);

    try {
        await validateResetToken(token);
        setStatus("Your reset link is valid. Enter a new password below.", "status_ready");
        setFormEnabled(true);
    } catch (error) {
        setStatus(error.message || "This reset link is invalid or expired.", "status_error");
        document.getElementById("resetHelpText").innerHTML =
            'Your link may have expired. Please request a new one from <code>forgot-password.html</code>.';
        setFormEnabled(false);
    }
}

resetPasswordForm?.addEventListener("submit", async (event) => {
    event.preventDefault();

    const token = getTokenFromUrl();
    const newPassword = newPasswordInput.value.trim();
    const confirmPassword = confirmPasswordInput.value.trim();

    if (!token) {
        showPopup("error", "Reset token is missing.");
        return;
    }

    if (!newPassword || !confirmPassword) {
        showPopup("error", "Please fill in both password fields.");
        return;
    }

    if (newPassword.length < 6) {
        showPopup("error", "New password must be at least 6 characters.");
        return;
    }

    if (newPassword !== confirmPassword) {
        showPopup("error", "Password confirmation does not match.");
        return;
    }

    resetPasswordButton.disabled = true;
    resetPasswordButton.textContent = "Resetting...";

    try {
        await submitPasswordReset(token, newPassword);
        showPopup(
            "success",
            "Your password has been reset successfully.",
            () => {
                window.location.href = "login.html";
            }
        );
        resetPasswordForm.reset();
    } catch (error) {
        showPopup(
            "error",
            error.message || "Could not reset your password. Please try again."
        );
    } finally {
        resetPasswordButton.disabled = false;
        resetPasswordButton.textContent = "Reset password";
    }
});

initializeResetPage();
