/**
 * Lógica de Accesibilidad y Persistencia de Sesión
 * Controla la activación condicional de la accesibilidad, el lector expandido, y la redirección.
 */
(function() {
    const root = document.documentElement;
    const body = document.body;
    const contrastToggle = document.getElementById('contrast-toggle');
    const fontToggle = document.getElementById('font-toggle');
    const readerToggle = document.getElementById('reader-toggle');
    
    // Configuración Inicial y Persistencia
    let currentFontSize = 100; // Almacenado como porcentaje
    let ttsActive = false; 
    
    // Elementos de menú
    const userProfile = localStorage.getItem('userProfile');
    const dashboardLinkLi = document.getElementById('nav-dashboard-link');
    const loginLinkLi = document.getElementById('nav-login-link');
    const logoutLinkLi = document.getElementById('nav-logout-link');
    const logoutButton = document.getElementById('logout-button');

    // --- 1. Funciones Centrales de Accesibilidad ---

    function speakText(text) {
        if (!ttsActive || !window.speechSynthesis) return;
        
        if (window.speechSynthesis.speaking) {
            window.speechSynthesis.cancel();
        }

        const speech = new SpeechSynthesisUtterance(text);
        speech.lang = 'es-ES'; 
        window.speechSynthesis.speak(speech);
    }

    // ARREGLO CRÍTICO: Lector de Pantalla Expandido
    function setupTTSListeners() {
        const interactives = document.querySelectorAll('a:not(.disabled), button:not(.disabled), [role="button"], input[type="submit"]');
        const contentElements = document.querySelectorAll('h1, h2, h3, p:not(.thread-meta), .hero-subtitle, .need-card h4, .need-card p, .standard-card h4, .ods-item');

        interactives.forEach(element => {
            element.addEventListener('focus', function() {
                let textToSpeak = element.getAttribute('aria-label') || element.textContent;
                speakText(textToSpeak.trim());
            });
            element.addEventListener('blur', function() {
                if (window.speechSynthesis.speaking) window.speechSynthesis.cancel();
            });
        });
        
        contentElements.forEach(element => {
             element.addEventListener('mouseenter', function() {
                if (ttsActive) {
                     speakText(element.textContent.trim());
                }
            });
             element.addEventListener('mouseleave', function() {
                if (window.speechSynthesis.speaking) window.speechSynthesis.cancel();
            });
        });
    }

    function loadAccessibilityState() {
        // Cargar estado persistente (si existe)
        if (localStorage.getItem('contrastMode') === 'active') {
            body.classList.add('high-contrast');
        }

        if (localStorage.getItem('fontSize')) {
            currentFontSize = parseInt(localStorage.getItem('fontSize'));
            root.style.fontSize = currentFontSize + '%';
        }

        if (localStorage.getItem('ttsActive') === 'true') {
            ttsActive = true;
            if (readerToggle) readerToggle.textContent = 'Lector 🔇';
            setupTTSListeners();
        }
        
        // Lógica de Bienvenida en Dashboard
        const welcomeMessage = document.getElementById('welcome-banner');
        if (welcomeMessage && localStorage.getItem('showWelcome') === 'true') {
            setTimeout(() => {
                welcomeMessage.classList.add('active'); 
                speakText("¡Bienvenido/a! Tu sesión adaptada está lista.");
            }, 100);
            localStorage.removeItem('showWelcome');
        }
    }


    // --- 2. Eventos del Widget ---
    
    if (contrastToggle) {
        contrastToggle.addEventListener('click', () => {
            body.classList.toggle('high-contrast');
            localStorage.setItem('contrastMode', body.classList.contains('high-contrast') ? 'active' : 'inactive');
        });
    }

    if (fontToggle) {
        fontToggle.addEventListener('click', () => {
            if (currentFontSize === 150) {
                currentFontSize = 100;
            } else {
                currentFontSize += 10;
            }
            root.style.fontSize = currentFontSize + '%';
            localStorage.setItem('fontSize', currentFontSize);
        });
    }
    
    if (readerToggle) {
        readerToggle.addEventListener('click', () => {
            ttsActive = !ttsActive;
            localStorage.setItem('ttsActive', ttsActive);
            body.classList.toggle('reader-active', ttsActive);

            if (ttsActive) {
                readerToggle.textContent = 'Lector 🔇';
                speakText("Lector de pantalla activado.");
                setupTTSListeners();
            } else {
                readerToggle.textContent = 'Lector 🔊';
                if (window.speechSynthesis.speaking) {
                    window.speechSynthesis.cancel();
                }
            }
        });
    }

    // --- 3. Lógica de Login y Menú Dinámico ---

    // Función de logout
    if (logoutButton) {
        logoutButton.addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.removeItem('userProfile');
            localStorage.setItem('contrastMode', 'inactive'); 
            localStorage.setItem('fontSize', 100);
            localStorage.setItem('ttsActive', 'false');
            localStorage.removeItem('showWelcome');
            const path = window.location.pathname;
            const target = (path.includes('/pages/') || path.includes('/docs/') || path.includes('/classes/')) ? '../index.html' : 'index.html';
            window.location.href = target; 
        });
    }

    // Lógica del menú dinámico
    if (userProfile) {
        if (loginLinkLi) loginLinkLi.style.display = 'none';
        if (logoutLinkLi) logoutLinkLi.style.display = 'list-item';
        
        if (dashboardLinkLi) {
            let dashboardText = userProfile.includes('teacher') ? 'Mi Dashboard Docente' : 'Mi Dashboard Alumno';
            let dashboardFile = userProfile.includes('teacher') ? 'dashboard-teacher.html' : 'dashboard.html';
            
            const aTag = dashboardLinkLi.querySelector('a');
            if(aTag) { 
                aTag.textContent = dashboardText;
                
                const path = window.location.pathname;
                const prefix = (path.includes('/pages/') || path.includes('/docs/') || path.includes('/classes/')) ? '../pages/' : 'pages/';
                aTag.href = prefix + dashboardFile;
            }
        }
    } else {
        if (logoutLinkLi) logoutLinkLi.style.display = 'none';
    }

    // Lógica de Acceso Adaptado (pages/login.html)
    const profileSelector = document.querySelector('.profile-selector');
    if (profileSelector) {
        profileSelector.querySelectorAll('button').forEach(button => {
            button.addEventListener('click', () => {
                const profile = button.getAttribute('data-profile');
                
                // RESTABLECER PRIMERO
                localStorage.setItem('contrastMode', 'inactive');
                localStorage.setItem('fontSize', 100);
                localStorage.setItem('ttsActive', 'false');
                root.style.fontSize = '100%';
                body.classList.remove('high-contrast');
                
                // ACTIVACIÓN CONDICIONAL DE SIMULACIÓN VISUAL
                if (profile === "student-visual") {
                    localStorage.setItem('contrastMode', 'active');
                    localStorage.setItem('fontSize', 120);
                    localStorage.setItem('ttsActive', 'true');
                }
                
                // Redirigir al perfil correcto
                localStorage.setItem('userProfile', profile.includes('teacher') ? 'teacher' : 'student');
                localStorage.setItem('showWelcome', 'true');
                
                const targetDashboard = profile.includes('teacher') ? 'dashboard-teacher.html' : 'dashboard.html';
                window.location.href = targetDashboard; 
            });
        });
    }


    // Lógica de Login Clásico
    const studentLoginForm = document.getElementById('student-login-form');
    if (studentLoginForm) {
        studentLoginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            localStorage.setItem('userProfile', 'student');
            localStorage.setItem('showWelcome', 'true');
            window.location.href = 'dashboard.html'; 
        });
    }

    const teacherLoginForm = document.getElementById('teacher-login-form');
    if (teacherLoginForm) {
        teacherLoginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            localStorage.setItem('userProfile', 'teacher');
            localStorage.setItem('showWelcome', 'true');
            window.location.href = 'dashboard-teacher.html';
        });
    }

    // Lógica de Evaluación (Simulación de finalización de módulo)
    const module1Card = document.getElementById('module-1-card');
    if (module1Card) {
        module1Card.addEventListener('click', (e) => {
            if (e.target.tagName === 'A' || e.target.tagName === 'BUTTON') return; 

            // Simular progreso completado (100%)
            const progressFill = document.getElementById('overall-progress');
            if (progressFill) progressFill.style.width = '100%';

            const ctaButton = document.getElementById('m1-cta');
            if (ctaButton) {
                ctaButton.textContent = 'Iniciar Evaluación';
                ctaButton.href = 'evaluation.html';
                ctaButton.classList.add('button-evaluation');
                ctaButton.classList.remove('button-accent');
                ctaButton.classList.remove('disabled');
                ctaButton.removeAttribute('aria-disabled');
                ctaButton.removeAttribute('tabindex');
            }
        });
    }

    // Cargar el estado al iniciar
    loadAccessibilityState();

})();
