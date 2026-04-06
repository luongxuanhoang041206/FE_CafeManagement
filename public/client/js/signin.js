// ════════════════════════════════════════════════════
// CUSTOM POPUP — dùng chung với login.js
// ════════════════════════════════════════════════════
function showPopup(type, message, onConfirm) {
    document.getElementById('customPopup')?.remove();

    const isSuccess = type === 'success';
    const popup = document.createElement('div');
    popup.id = 'customPopup';
    popup.innerHTML = `
        <div class="popup-overlay">
            <div class="popup-box popup-${type}">
                <div class="popup-icon">${isSuccess ? '☕' : '✖'}</div>
                <p class="popup-message">${message}</p>
                <button class="popup-btn popup-btn-${type}" id="popupConfirmBtn">
                    ${isSuccess ? 'Đăng nhập ngay' : 'Thử lại'}
                </button>
            </div>
        </div>
    `;
    document.body.appendChild(popup);

    requestAnimationFrame(() => {
        popup.querySelector('.popup-overlay').classList.add('show');
        popup.querySelector('.popup-box').classList.add('show');
    });

    document.getElementById('popupConfirmBtn').addEventListener('click', () => {
        popup.querySelector('.popup-box').classList.remove('show');
        setTimeout(() => { popup.remove(); onConfirm?.(); }, 250);
    });
}

const popupStyle = document.createElement('style');
popupStyle.textContent = `
    .popup-overlay {
        position: fixed; inset: 0;
        background: rgba(59,47,47,0.45);
        backdrop-filter: blur(3px);
        z-index: 99999;
        display: flex; align-items: center; justify-content: center;
        opacity: 0; transition: opacity 0.25s ease;
    }
    .popup-overlay.show { opacity: 1; }
    .popup-box {
        background: #f5f2ed;
        border-radius: 20px;
        padding: 40px 36px 32px;
        width: 340px; text-align: center;
        box-shadow: 0 24px 64px rgba(59,47,47,0.22);
        transform: translateY(24px) scale(0.96);
        transition: transform 0.28s cubic-bezier(0.34,1.56,0.64,1);
        border-top: 5px solid #b77e4b;
    }
    .popup-box.popup-error { border-top-color: #c0392b; }
    .popup-box.show { transform: translateY(0) scale(1); }
    .popup-icon { font-size: 2.8rem; margin-bottom: 14px; line-height: 1; }
    .popup-message {
        font-family: "Montserrat", sans-serif;
        font-size: 15px; font-weight: 600;
        color: #3b2f2f; line-height: 1.6; margin-bottom: 24px;
    }
    .popup-btn {
        padding: 10px 32px; border: none; border-radius: 10px;
        font-family: "Montserrat", sans-serif;
        font-size: 14px; font-weight: 700; cursor: pointer;
        transition: background 0.2s, transform 0.1s;
        box-shadow: 0 4px 12px rgba(0,0,0,0.12);
    }
    .popup-btn-success { background: #b77e4b; color: #fff; }
    .popup-btn-success:hover { background: #d1670b; }
    .popup-btn-error { background: #3b2f2f; color: #fff; }
    .popup-btn-error:hover { background: #5c4a3d; }
    .popup-btn:active { transform: scale(0.96); }
`;
document.head.appendChild(popupStyle);

// ════════════════════════════════════════════════════
// PASSWORD MATCH VALIDATION
// ════════════════════════════════════════════════════
const password = document.getElementById('password');
const confirm = document.getElementById('confirm');

confirm.addEventListener('input', () => {
    if (password.value !== confirm.value) {
        confirm.setCustomValidity('Mật khẩu không khớp!');
    } else {
        confirm.setCustomValidity('');
    }
});

// ════════════════════════════════════════════════════
// SIGN IN FORM
// ════════════════════════════════════════════════════
const signinForm = document.getElementById('form');

signinForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const firstName = document.getElementById('fname').value.trim();
    const lastName = document.getElementById('lname').value.trim();
    const username = document.getElementById('username').value.trim();
    const email = document.getElementById('email').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const pwd = document.getElementById('password').value;

    // Gửi lên API
    const name = firstName + " " + lastName;

    fetch("https://cafemanagement-rgd5.onrender.com/auth/register", {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            username,
            email,
            password: pwd,
            name   // ✅ đúng format BE
        })
    })
        .then(async response => {
            if (response.ok) {
                showPopup('success', 'Đăng ký thành công! ☕<br>Chào mừng bạn đến với Hai Gau Coffee.', () => {
                    window.location.href = 'login.html';
                });
            } else {
                const errorMsg = await response.text();
                showPopup('error', errorMsg || 'Đăng ký thất bại!<br>Vui lòng kiểm tra lại thông tin.');
            }
        })
        .catch(() => {
            showPopup('error', 'Không thể kết nối tới máy chủ.<br>Vui lòng thử lại sau!');
        });
});