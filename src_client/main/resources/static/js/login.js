const form = document.getElementById("form");
const password = document.getElementById("password");
const confirm = document.getElementById("confirm");

const rules = {
    length: v => v.length >= 8,
    number: v => /[0-9]/.test(v),
    character: v => /[A-Za-z]/.test(v),
}

form.addEventListener("submit", e => {
    e.preventDefault();
}); 

password.addEventListener("input", (e) => {
    const value = password.value;

    for (let rule in rules){
        let element = document.getElementById(rule);
        element.classList.toggle("valid", rules[rule](value));
    }
});

function validatePassword(){
    if (password.value !== confirm.value){
        confirm.setCustomValidity("Password don not match");
    }
    else{
        confirm.setCustomValidity("");
    }
}

confirm.addEventListener("input", validatePassword);
password.addEventListener("input", validatePassword);