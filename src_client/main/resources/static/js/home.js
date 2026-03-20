const frameCount = 80;
const img = document.getElementById("coffeeFrame");
const section = document.querySelector(".animation-section");
const nextSection = document.querySelector(".next-section");

// Lấy tất cả các khối chữ scroll
const scrollTexts = document.querySelectorAll(".scroll-text");

function currentFrame(index) {
    return `../imagesHome/ezgif-frame-${String(index).padStart(3, '0')}.png`;
}

// Preload frames
const preload = [];
for (let i = 1; i <= frameCount; i++) {
    const image = new Image();
    image.src = currentFrame(i);
    preload.push(image);
}

let targetFrame = 1;
let currentFrameIndex = 1;

window.addEventListener("scroll", () => {
    const rect = section.getBoundingClientRect();
    const sectionHeight = section.offsetHeight - window.innerHeight;

    let progress = -rect.top / sectionHeight;
    progress = Math.min(Math.max(progress, 0), 1);

    // Cập nhật frame target
    targetFrame = Math.floor(progress * (frameCount - 1)) + 1;

    // ---- Điều khiển từng khối chữ theo progress ----
    scrollTexts.forEach(el => {
        const start = parseFloat(el.dataset.start);
        const end   = parseFloat(el.dataset.end);

        const fadeIn  = 0.08;
        const fadeOut = 0.08;

        let opacity = 0;
        let translateY = 50;

        // Intro block: luôn hiện full khi progress <= start (đang ở đầu trang)
        if (el.classList.contains('scroll-text--intro') && progress <= start) {
            opacity = 1;
            translateY = 0;
        } else if (progress >= start && progress <= end) {
            const inProgress  = Math.min((progress - start) / fadeIn, 1);
            const outProgress = Math.min((end - progress) / fadeOut, 1);
            const t = Math.min(inProgress, outProgress);

            opacity    = t;
            translateY = 50 * (1 - t);
        }

        el.style.opacity = opacity;

        // Intro block dùng transform đặc biệt (căn giữa)
        if (el.classList.contains('scroll-text--intro')) {
            el.style.transform = `translate(-50%, calc(-50% + ${translateY}px))`;
        } else {
            el.style.transform = `translateY(${translateY}px)`;
        }
    });

    // ---- Next section bay lên / ẩn khi scroll lên ----
    if (progress >= 0.88) {
        const t = Math.min((progress - 0.88) / 0.10, 1);
        nextSection.style.opacity   = t;
        nextSection.style.transform = `translateY(${80 * (1 - t)}px)`;
    } else {
        nextSection.style.opacity   = 0;
        nextSection.style.transform = `translateY(80px)`;
    }

    // ---- Reveal elements: show/hide dựa theo next-section visibility ----
    // Khi next-section bị ẩn (progress < 0.88), reset tất cả reveal về trạng thái ẩn
    if (progress < 0.85) {
        document.querySelectorAll(".reveal").forEach(el => {
            el.classList.remove("visible");
        });
    }
});

// ---- Animation loop cho frames ----
function animate() {
    currentFrameIndex += (targetFrame - currentFrameIndex) * 0.12;
    const roundedFrame = Math.round(currentFrameIndex);
    img.src = currentFrame(roundedFrame);
    requestAnimationFrame(animate);
}

animate();

// Hiện intro ngay khi load trang
window.addEventListener("load", () => {
    const intro = document.getElementById("scrollText0");
    if (intro) {
        intro.style.transition = "opacity 1.2s ease, transform 1.2s ease";
        intro.style.opacity = 1;
        intro.style.transform = "translate(-50%, -50%)";
        setTimeout(() => { intro.style.transition = ""; }, 1300);
    }
});

// Reveal các element khi scroll vào viewport
const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add("visible");
        }
        // Khi ra khỏi viewport phía trên thì ẩn lại
        else if (!entry.isIntersecting && entry.boundingClientRect.top > 0) {
            entry.target.classList.remove("visible");
        }
    });
}, { threshold: 0.15 });

document.querySelectorAll(".reveal").forEach(el => revealObserver.observe(el));