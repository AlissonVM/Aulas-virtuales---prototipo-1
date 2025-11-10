/**
 * Lógica de Accesibilidad y Persistencia de Sesión
 */
(function() {
    const root = document.documentElement;
    const body = document.body;
    const contrastToggle = document.getElementById('contrast-toggle');
    const fontToggle = document.getElementById('font-toggle');
    const readerToggle = document.getElementById('reader-toggle');
    const widget = document.getElementById('accessibility-widget');
    
    // Configuración Inicial
    let currentFontSize = 100; // Porcentaje de tamaño de fuente
    let ttsActive = false; // Estado del Text-to-Speech

    // --- 1. Persistencia de Opciones ---
    function loadAccessibilityState() {
        const savedContrast = localStorage.getItem('contrastMode');
        const savedFont = localStorage.getItem('fontSize');
        const savedTTS = localStorage.getItem('ttsActive');

        if (savedContrast === 'active') {
            body.classList.add('high-contrast');
        }

        if (savedFont) {
            currentFontSize = parseInt(savedFont);
            root.style.fontSize = currentFontSize + '%';
        }

        if (savedTTS === 'true') {
            ttsActive = true;
            readerToggle.textContent = 'Lector 🔇';
            // Aplicar escuchadores de TTS solo si está activo
            setupTTSListeners();
        }
    }

    // --- 2. Funciones de Navegación/Lógica ---
    function speakText(text) {
        if (!ttsActive) return;
        
        // Detener la narración anterior si existe
        if (window.speechSynthesis.speaking) {
            window.speechSynthesis.cancel();
        }

        const speech = new SpeechSynthesisUtterance(text);
        speech.lang = 'es-ES'; 
        window.speechSynthesis.speak(speech);
    }

    function setupTTSListeners() {
        // Seleccionar todos los elementos interactivos que queremos narrar
        const interactives = document.querySelectorAll('a, button, [role="button"], input[type="submit"]');

        interactives.forEach(element => {
            // El evento 'focus' es crucial para la accesibilidad por teclado
            element.addEventListener('focus', function() {
                // Usar el aria-label si existe, sino, usar el texto
                const textToSpeak = element.getAttribute('aria-label') || element.textContent;
                speakText(textToSpeak.trim());
            });
            // El evento 'blur' es para detener la narración al salir del elemento
            element.addEventListener('blur', function() {
                if (window.speechSynthesis.speaking) {
                    window.speechSynthesis.cancel();
                }
            });
        });
    }

    // --- 3. Escuchadores de Eventos del Widget ---

    contrastToggle.addEventListener('click', () => {
        body.classList.toggle('high-contrast');
        const isContrastActive = body.classList.contains('high-contrast');
        localStorage.setItem('contrastMode', isContrastActive ? 'active' : 'inactive');
    });

    fontToggle.addEventListener('click', () => {
        if (currentFontSize === 150) {
            currentFontSize = 100;
        } else {
            currentFontSize += 10;
        }
        root.style.fontSize = currentFontSize + '%';
        localStorage.setItem('fontSize', currentFontSize);
    });

    readerToggle.addEventListener('click', () => {
        ttsActive = !ttsActive;
        localStorage.setItem('ttsActive', ttsActive);
        
        if (ttsActive) {
            readerToggle.textContent = 'Lector 🔇';
            speakText("Lector de pantalla activado.");
            setupTTSListeners(); // Aplicar listeners al activar
        } else {
            readerToggle.textContent = 'Lector 🔊';
            if (window.speechSynthesis.speaking) {
                window.speechSynthesis.cancel();
            }
            // Los listeners de focus/blur permanecen, pero la función speakText saldrá inmediatamente
            // si ttsActive es false.
        }
    });

    // --- Lógica Específica para la página de Acceso Adaptado (login.html) ---
    const loginButton = document.getElementById('login-button');
    if (loginButton) {
        loginButton.addEventListener('click', accessWithProfile);
    }
    
    // Función mejorada para evitar el bloqueo de alert()
    function accessWithProfile() {
        // En un entorno real, aquí se enviarían las credenciales y el perfil al servidor.
        const profile = "Usuario con Adaptaciones Visuales"; // Perfil de ejemplo
        
        // Simulación de retroalimentación no bloqueante y redirección
        const message = `Acceso exitoso. Redirigiendo al dashboard adaptado para ${profile}.`;
        
        // Creamos un mensaje temporal visible
        const loginForm = document.querySelector('.profile-selector');
        const feedbackDiv = document.createElement('div');
        feedbackDiv.classList.add('login-feedback');
        feedbackDiv.textContent = message;
        
        if (loginForm) {
            loginForm.parentNode.insertBefore(feedbackDiv, loginForm.nextSibling);
            speakText(message); // Narrar el mensaje
        }

        // Redirigir después de un breve retraso
        setTimeout(() => {
            window.location.href = '../pages/dashboard.html';
        }, 1500); // 1.5 segundos para leer el mensaje
    }

    // Cargar el estado al iniciar
    loadAccessibilityState();

})();
