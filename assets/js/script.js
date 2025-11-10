/**
 * Lógica de Accesibilidad y Persistencia de Sesión
 * El código está envuelto en una IIFE para evitar la contaminación del scope global.
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
        if (!ttsActive) return;
        
        if (window.speechSynthesis.speaking) {
            window.speechSynthesis.cancel();
        }

        const speech = new SpeechSynthesisUtterance(text);
        speech.lang = 'es-ES'; 
        window.speechSynthesis.speak(speech);
    }

    // Aplicar los escuchadores de foco para la narración
    function setupTTSListeners() {
        // Seleccionar todos los elementos interactivos que queremos narrar
        const interactives = document.querySelectorAll('a:not(.disabled), button:not(.disabled), [role="button"], input[type="submit"]');

        interactives.forEach(element => {
            // El evento 'focus' es crucial para la accesibilidad por teclado
            element.addEventListener('focus', function() {
                // Usar el aria-label o aria-describedby si existen, sino, usar el texto
                let textToSpeak = element.getAttribute('aria-label') || element.textContent;
                
                // Si el elemento tiene un aria-describedby, busca ese elemento para narrar su contenido también
                const describedById = element.getAttribute('aria-describedby');
                if (describedById) {
                    const describedByElement = document.getElementById(describedById);
                    if (describedByElement) {
                        textToSpeak += `. Información adicional: ${describedByElement.textContent}`;
                    }
                }

                speakText(textToSpeak.trim());
            });
            // Detener la narración al salir del foco
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
        
        // --- Lógica de Bienvenida en Dashboard ---
        const welcomeMessage = document.getElementById('welcome-message');
        const userProfile = localStorage.getItem('userProfile');
        const showWelcome = localStorage.getItem('showWelcome');

        if (welcomeMessage && userProfile && showWelcome === 'true') {
            const message = `¡Bienvenido, ${userProfile}! Tu sesión está adaptada.`;
            welcomeMessage.textContent = message;
            welcomeMessage.classList.add('active'); // Muestra el mensaje con estilo CSS
            speakText(message);
            
            // Limpiar las banderas para que el mensaje no aparezca en recargas
            localStorage.removeItem('showWelcome');
            localStorage.removeItem('userProfile');
            
            // Ocultar el mensaje después de un tiempo
            setTimeout(() => welcomeMessage.classList.remove('active'), 4000);
        }
    }


    // --- 2. Escuchadores de Eventos del Widget ---

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
        body.classList.toggle('reader-active', ttsActive); // Activa la clase para CSS (pictogramas)

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

    // --- 3. Lógica Específica para la página de Acceso Adaptado (login.html) ---
    const profileButtons = document.querySelectorAll('.profile-selector button');

    profileButtons.forEach(button => {
        button.addEventListener('click', (event) => {
            const profile = event.currentTarget.getAttribute('data-profile');

            // Guardar el perfil en localStorage y establecer la bandera de bienvenida
            localStorage.setItem('userProfile', profile);
            localStorage.setItem('showWelcome', 'true');
            
            const message = `Acceso exitoso. Redirigiendo al dashboard adaptado para ${profile}.`;
            
            // Mostrar mensaje de feedback in-page (no bloqueante)
            const feedbackDiv = document.createElement('div');
            feedbackDiv.classList.add('login-feedback-message');
            feedbackDiv.textContent = message;
            
            event.currentTarget.closest('.profile-selector').appendChild(feedbackDiv);
            speakText(message);

            // Redirigir
            setTimeout(() => {
                window.location.href = '../pages/dashboard.html';
            }, 1500); 
        });
    });


    // Cargar el estado al iniciar
    loadAccessibilityState();

})();
