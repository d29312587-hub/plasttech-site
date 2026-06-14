document.addEventListener('DOMContentLoaded', function() {
    initMobileMenu();
    initContactForm();
    initLogoClick();
    initCookieConsent();
});

// ========== МОБИЛЬНОЕ МЕНЮ ==========
function initMobileMenu() {
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const mobileMenu = document.querySelector('.mobile-menu');
    const mobileMenuClose = document.querySelector('.mobile-menu-close');
    if (!mobileMenuBtn || !mobileMenu) return;
    const openMenu = () => { mobileMenu.classList.add('active'); document.body.style.overflow = 'hidden'; };
    const closeMenu = () => { mobileMenu.classList.remove('active'); document.body.style.overflow = ''; };
    mobileMenuBtn.addEventListener('click', openMenu);
    if (mobileMenuClose) mobileMenuClose.addEventListener('click', closeMenu);
    mobileMenu.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
    mobileMenu.addEventListener('click', (e) => { if (e.target === mobileMenu) closeMenu(); });
}

// ========== КЛИК ПО ЛОГОТИПУ ==========
function initLogoClick() {
    const logo = document.querySelector('.logo');
    const mobileLogo = document.querySelector('.mobile-logo');
    const goToHome = (e) => { e.preventDefault(); window.location.href = 'index.html'; };
    if (logo) { logo.style.cursor = 'pointer'; logo.addEventListener('click', goToHome); }
    if (mobileLogo) { mobileLogo.style.cursor = 'pointer'; mobileLogo.addEventListener('click', goToHome); }
}

// ========== ФОРМА С СОХРАНЕНИЕМ В FIRESTORE ==========
function initContactForm() {
    const contactForm = document.getElementById('contactForm');
    if (!contactForm) return;
    contactForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        if (!window.auth || !window.auth.currentUser) {
            showSuccessMessage('Пожалуйста, войдите или зарегистрируйтесь, чтобы отправить заявку.', true);
            if (typeof window.openAuthModal === 'function') window.openAuthModal();
            return;
        }
        const formData = {
            name: document.getElementById('name').value.trim(),
            company: document.getElementById('company').value.trim(),
            phone: document.getElementById('phone').value.trim(),
            email: document.getElementById('email').value.trim(),
            message: document.getElementById('message').value.trim(),
            userId: window.auth.currentUser.uid,
            createdAt: new Date()
        };
        if (validateForm(formData)) {
            try {
                // Используем глобальные переменные, инициализированные в Firebase-скрипте
                const { collection, addDoc } = await import("https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js");
                await addDoc(collection(window.db, 'requests'), formData);
                showSuccessMessage('Заявка успешно отправлена! Мы свяжемся с вами.');
                contactForm.reset();
                clearFormErrors();
            } catch (err) {
                console.error(err);
                showSuccessMessage('Ошибка отправки: ' + err.message, true);
            }
        }
    });
}

function clearFormErrors() {
    document.querySelectorAll('.form-error').forEach(error => error.remove());
    document.querySelectorAll('.form-group input, .form-group textarea').forEach(field => field.classList.remove('error'));
}

function showFieldError(fieldId, message) {
    const field = document.getElementById(fieldId);
    if (!field) return;
    field.classList.add('error');
    const existingError = field.parentNode.querySelector('.form-error');
    if (existingError) existingError.remove();
    const errorDiv = document.createElement('div');
    errorDiv.className = 'form-error';
    errorDiv.innerHTML = `<span>${message}</span>`;
    field.parentNode.appendChild(errorDiv);
}

function validateForm(data) {
    clearFormErrors();
    let isValid = true;
    if (!data.name) { showFieldError('name', 'Заполните это поле'); isValid = false; }
    if (!data.phone) { showFieldError('phone', 'Заполните это поле'); isValid = false; }
    else if (!isValidPhone(data.phone)) { showFieldError('phone', 'Некорректный телефон (минимум 10 цифр)'); isValid = false; }
    if (!data.email) { showFieldError('email', 'Заполните это поле'); isValid = false; }
    else if (!isValidEmail(data.email)) { showFieldError('email', 'Некорректный email'); isValid = false; }
    if (!data.message) { showFieldError('message', 'Опишите вашу задачу'); isValid = false; }
    return isValid;
}

function isValidEmail(email) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email); }
function isValidPhone(phone) { return /^[\d\s\-\+\(\)]+$/.test(phone) && phone.replace(/\D/g, '').length >= 10; }

function showSuccessMessage(message, isError = false) {
    const oldMsg = document.querySelector('.success-message');
    if (oldMsg) oldMsg.remove();
    const msg = document.createElement('div');
    msg.className = 'success-message';
    msg.innerHTML = `<div class="success-content" style="background:${isError ? '#e74c3c' : '#27ae60'}"><i class="fas ${isError ? 'fa-exclamation-triangle' : 'fa-check-circle'}"></i><span>${message}</span><button class="success-close">&times;</button></div>`;
    document.body.appendChild(msg);
    setTimeout(() => msg.classList.add('show'), 10);
    msg.querySelector('.success-close').addEventListener('click', () => {
        msg.classList.remove('show');
        setTimeout(() => msg.remove(), 400);
    });
    setTimeout(() => {
        if (msg && msg.parentNode) {
            msg.classList.remove('show');
            setTimeout(() => msg.remove(), 400);
        }
    }, 5000);
}

function initCookieConsent() {
    if (document.querySelector('.cookie-consent')) return;
    const consentKey = 'cookie_consent_accepted';
    if (localStorage.getItem(consentKey)) return;
    const cookieDiv = document.createElement('div');
    cookieDiv.className = 'cookie-consent';
    cookieDiv.innerHTML = `<p>Сайт использует cookie для удобства. Пользуясь сервисом, вы соглашаетесь.</p><button class="cookie-btn" id="acceptCookie">Согласен</button>`;
    document.body.appendChild(cookieDiv);
    setTimeout(() => cookieDiv.classList.add('show'), 10);
    const acceptBtn = cookieDiv.querySelector('#acceptCookie');
    acceptBtn.addEventListener('click', () => {
        localStorage.setItem(consentKey, 'true');
        cookieDiv.classList.remove('show');
        setTimeout(() => cookieDiv.remove(), 400);
    });
}
