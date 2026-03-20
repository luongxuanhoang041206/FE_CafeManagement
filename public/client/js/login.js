// const form = document.getElementById("form");
// const password = document.getElementById("password");
// const confirm = document.getElementById("confirm");

// const rules = {
//     length: v => v.length >= 8,
//     number: v => /[0-9]/.test(v),
//     character: v => /[A-Za-z]/.test(v),
// }

// form.addEventListener("submit", e => {
//     e.preventDefault();
// }); 

// password.addEventListener("input", (e) => {
//     const value = password.value;

//     for (let rule in rules){
//         let element = document.getElementById(rule);
//         element.classList.toggle("valid", rules[rule](value));
//     }
// });

// function validatePassword(){
//     if (password.value !== confirm.value){
//         confirm.setCustomValidity("Password don not match");
//     }
//     else{
//         confirm.setCustomValidity("");
//     }
// }

// confirm.addEventListener("input", validatePassword);
// password.addEventListener("input", validatePassword);
const loginForm = document.getElementById("form");

loginForm.addEventListener('submit', (event) => {
    event.preventDefault();

    // Lấy giá trị từ ô nhập liệu (ô này giờ dùng chung cho cả User và Email)
    const loginKey = document.getElementById('loginKey').value;
    const password = document.getElementById('password').value;

    const data = {
        username: loginKey, // Ta vẫn gửi key là 'username' để tương thích với Backend cũ
        password: password
    };

    fetch('http://localhost:8080/auth/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
        .then(async response => {
            if (response.ok) {
                // Lưu giá trị đăng nhập vào session
                sessionStorage.setItem("currentUser", loginKey);

                alert("Đăng nhập thành công!");
                window.location.href = "/client/home.html";
            } else {
                const errorMsg = await response.text();
                alert("Thất bại: " + (errorMsg || "Thông tin đăng nhập không chính xác!"));
            }
        })
        .catch(error => {
            console.error("Lỗi:", error);
            alert("Không thể kết nối tới Server!");
        });
});