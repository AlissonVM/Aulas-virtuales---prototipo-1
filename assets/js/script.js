/**
 * Lógica de Accesibilidad y Persistencia de Sesión
 * Controla la activación condicional de la accesibilidad y la redirección.
 */
(function() {
    const root = document.documentElement;
    const body = document.body;
    const contrastToggle = document.getElementById('contrast-toggle');
    const fontToggle = document.getElementById('font-toggle');
    const readerToggle = document.getElementById('reader-toggle');
    
    // Configuración Inicial y Persistencia
    let currentFontSize = 100;
    let ttsActive = false;

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

    function setupTTSListeners() {
        // ... (misma lógica de TTS) ...
        const interactives = document.querySelectorAll('a:not(.disabled), button:not(.disabled), [role="button"], input[type="submit"]');

        interactives.forEach(element => {
            element.addEventListener('focus', function() {
                let textToSpeak = element.getAttribute('aria-label') || element.textContent;
                
                const describedById = element.getAttribute('aria-describedby');
                if (describedById) {
                    const describedByElement = document.getElementById(describedById);
                    if (describedByElement) {
                        textToSpeak += `. Información adicional: ${describedByElement.textContent}`;
                    }
                }

                speakText(textToSpeak.trim());
            });
            element.addEventListener('blur', function() {
                if (window.speechSynthesis.speaking) {
                    window.speechSynthesis.cancel();
                }
            });
        });
    }

    function loadAccessibilityState() {
        const savedContrast = localStorage.getItem('contrastMode');
        const savedFont = localStorage.getItem('fontSize');
        const savedTTS = localStorage.getItem('ttsActive');
        
        // Cargar estado persistente (global, no de la simulación inicial)
        if (savedContrast === 'active') {
            body.classList.add('high-contrast');
        }

        if (savedFont) {
            currentFontSize = parseInt(savedFont);
            root.style.fontSize = currentFontSize + '%';
        }

        if (savedTTS === 'true') {
            ttsActive = true;
            if (readerToggle) readerToggle.textContent = 'Lector 🔇';
            setupTTSListeners();
        }
        
        // **IMPORTANTE: Se remueve la activación automática de Alto Contraste en login.html**
        
        // Lógica de Bienvenida en Dashboard
        const welcomeMessage = document.getElementById('welcome-message');
        const userProfile = localStorage.getItem('userProfile');
        const showWelcome = localStorage.getItem('showWelcome');

        if (welcomeMessage && userProfile && showWelcome === 'true') {
            const message = `¡Bienvenido, ${userProfile}! Tu sesión está adaptada.`;
            welcomeMessage.textContent = message;
            welcomeMessage.classList.add('active'); 
            speakText(message);
            
            localStorage.removeItem('showWelcome');
            setTimeout(() => welcomeMessage.classList.remove('active'), 4000);
        }
    }


    // --- 2. Escuchadores de Eventos del Widget ---
    if (contrastToggle) {
        contrastToggle.addEventListener('click', () => {
            body.classList.toggle('high-contrast');
            const isContrastActive = body.classList.contains('high-contrast');
            localStorage.setItem('contrastMode', isContrastActive ? 'active' : 'inactive');
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

    // --- 3. Lógica Específica para la página de Acceso Adaptado (login.html) ---
    const profileButtons = document.querySelectorAll('.profile-selector button');

    profileButtons.forEach(button => {
        button.addEventListener('click', (event) => {
            const profile = event.currentTarget.getAttribute('data-profile');
            
            // **LÓGICA DE SIMULACIÓN DE ACCESO ADAPTADO (Tu solicitud)**
            if (profile === "Estudiante con Discapacidad Visual") {
                // Activa la simulación de baja visión/ceguera
                body.classList.add('high-contrast');
                root.style.fontSize = '120%'; 
                ttsActive = true;
                localStorage.setItem('contrastMode', 'active');
                localStorage.setItem('fontSize', 120);
                localStorage.setItem('ttsActive', 'true');
                setupTTSListeners(); // Habilita el lector antes de la redirección
            } else {
                 // Para otros perfiles (Cognitivo/Motor), se desactivan forzadamente los overrides visuales
                localStorage.setItem('contrastMode', 'inactive');
                localStorage.setItem('fontSize', 100);
                localStorage.setItem('ttsActive', 'false');
                root.style.fontSize = '100%'; 
                body.classList.remove('high-contrast');
                ttsActive = false;
            }


            // Guardar el perfil y establecer la bandera de bienvenida
            localStorage.setItem('userProfile', profile);
            localStorage.setItem('showWelcome', 'true');
            
            const message = `Acceso exitoso. Redirigiendo al dashboard adaptado para ${profile}.`;
            
            // Mostrar mensaje de feedback in-page
            let feedbackDiv = document.querySelector('.login-feedback-message');
            if (!feedbackDiv) {
                feedbackDiv = document.createElement('div');
                feedbackDiv.classList.add('login-feedback-message');
                event.currentTarget.closest('.profile-selector').appendChild(feedbackDiv);
            }
            feedbackDiv.textContent = message;
            
            speakText(message);

            // Redirigir
            setTimeout(() => {
                window.location.href = '../pages/dashboard.html';
            }, 1500); 
        });
    });

    // Lógica simple para login de docentes (simulación por formulario)
    const teacherLoginForm = document.querySelector('.simple-login-form');
    if (teacherLoginForm) {
        teacherLoginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            window.location.href = '../pages/dashboard-teacher.html';
        });
    }

    // Cargar el estado al iniciar
    loadAccessibilityState();

})();
