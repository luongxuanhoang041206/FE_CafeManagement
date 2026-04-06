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
                    ${isSuccess ? "Tiếp tục" : "Đóng"}
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

const resetPasswordForm = document.getElementById("resetPasswordForm");
const resetPasswordButton = document.getElementById("resetPasswordBtn");
const tokenStatusText = document.getElementById("tokenStatusText");
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
let currentUserId = null;

//https://cafemanagement-rgd5.onrender.com
async function validateResetToken(token) {
    const endpoint = `https://cafemanagement-rgd5.onrender.com/reset-password/validate?token=${encodeURIComponent(token)}`;
    // http://localhost:10000/reset-password/validate?token=${encodeURIComponent(token)}
    try {
        const response = await fetch(endpoint, {
            method: "GET"
        });

        if (response.ok) {
            const data = await response.json();
            return data.userId;
        }

        const errorText = await response.text();
        throw new Error(errorText || "Liên kết không hợp lệ hoặc đã hết hạn.");
    } catch (error) {
        throw new Error(error.message || "Liên kết không hợp lệ hoặc đã hết hạn.");
    }
}

async function submitPasswordReset(userId, token, newPassword) {
    const endpoint = "https://cafemanagement-rgd5.onrender.com/resetPassword";
    // http://localhost:10000/requestPassword
    try {
        const response = await fetch(endpoint, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                userId,
                token,
                newPassword
            })
        });

        if (response.ok) {
            return true;
        }

        const errorText = await response.text();
        throw new Error(errorText || "Không thể đặt lại mật khẩu của bạn.");
    } catch (error) {
        throw new Error(error.message || "Không thể đặt lại mật khẩu của bạn.");
    }
}

async function initializeResetPage() {
    const token = getTokenFromUrl();

    if (!token) {
        setStatus("Liên kết này không có token xác thực.", "status_error");
        setFormEnabled(false);
        return;
    }

    setStatus("Đang kiểm tra xem liên kết của bạn còn hạn không...", "status_loading");
    setFormEnabled(false);

    try {
        currentUserId = await validateResetToken(token);
        setStatus("Liên kết hợp lệ. Vui lòng nhập mật khẩu mới ở dưới.", "status_ready");
        setFormEnabled(true);
    } catch (error) {
        setStatus(error.message || "Liên kết này không hợp lệ hoặc đã hết hạn.", "status_error");
        document.getElementById("resetHelpText").innerHTML =
            'Liên kết có thể đã hết hạn. Vui lòng gửi yêu cầu cấp lại từ trang <a href="forgot-password.html">Quên mật khẩu</a>.';
        document.getElementById("resetHelpText").style.display = "block";
        setFormEnabled(false);
    }
}

resetPasswordForm?.addEventListener("submit", async (event) => {
    event.preventDefault();

    const token = getTokenFromUrl();
    const newPassword = newPasswordInput.value.trim();
    const confirmPassword = confirmPasswordInput.value.trim();

    if (!token) {
        showPopup("error", "Không tìm thấy token. Vui lòng kiểm tra lại liên kết.");
        return;
    }

    if (!newPassword || !confirmPassword) {
        showPopup("error", "Vui lòng nhập đầy đủ mật khẩu mới và xác nhận mật khẩu.");
        return;
    }

    if (newPassword.length < 6) {
        showPopup("error", "Mật khẩu mới phải có ít nhất 6 ký tự.");
        return;
    }

    if (newPassword !== confirmPassword) {
        showPopup("error", "Mật khẩu xác nhận không khớp.");
        return;
    }

    resetPasswordButton.disabled = true;
    resetPasswordButton.textContent = "Đang đặt lại...";

    try {
        await submitPasswordReset(currentUserId, token, newPassword);
        showPopup(
            "success",
            "Mật khẩu đã được đặt lại thành công.<br>Đang chuyển hướng...",
            () => {
                window.location.href = "login.html";
            }
        );
        resetPasswordForm.reset();

        // Chuyển hướng sau 2 giây nếu user không click Continue
        setTimeout(() => {
            if(window.location.href.includes('reset-password')) {
                window.location.href = "login.html";
            }
        }, 2000);
    } catch (error) {
        showPopup(
            "error",
            error.message || "Không thể đặt lại mật khẩu. Vui lòng thử lại sau."
        );
    } finally {
        resetPasswordButton.disabled = false;
        resetPasswordButton.textContent = "Đặt lại mật khẩu";
    }
});

initializeResetPage();
