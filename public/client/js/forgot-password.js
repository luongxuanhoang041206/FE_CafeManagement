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
                    ${isSuccess ? "Continue" : "Try again"}
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

const forgotPasswordForm = document.getElementById("forgotPasswordForm");
const forgotPasswordButton = document.getElementById("forgotPasswordBtn");

async function requestResetToken(info) {
    const endpoint = "https://cafemanagement-rgd5.onrender.com/requestResetToken";

    try {
        const response = await fetch(endpoint, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ info })
        });

        if (response.ok) {
            const contentType = response.headers.get("content-type") || "";
            if (contentType.includes("application/json")) {
                await response.json();
            } else {
                await response.text();
            }
            return;
        }

        const errorText = await response.text();
        throw new Error(errorText || `HTTP ${response.status}`);
    } catch (error) {
        throw new Error(error.message || "Could not send the reset request.");
    }
}

forgotPasswordForm?.addEventListener("submit", async (event) => {
    event.preventDefault();

    const accountInfo = document.getElementById("accountInfo").value.trim();

    if (!accountInfo) {
        showPopup("error", "Please enter your email or username.");
        return;
    }

    forgotPasswordButton.disabled = true;
    forgotPasswordButton.textContent = "Sending...";

    try {
        await requestResetToken(accountInfo);
        showPopup(
            "success",
            "Your reset request was sent successfully.<br>Please check your email or follow the server instructions.",
            () => {
                window.location.href = "login.html";
            }
        );
        forgotPasswordForm.reset();
    } catch (error) {
        showPopup(
            "error",
            error.message || "Could not send the reset request.<br>Please try again later."
        );
    } finally {
        forgotPasswordButton.disabled = false;
        forgotPasswordButton.textContent = "Send reset request";
    }
});
