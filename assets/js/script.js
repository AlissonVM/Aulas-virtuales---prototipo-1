document.addEventListener('DOMContentLoaded', () => {
    const body = document.body;
    const contrastToggle = document.getElementById('contrast-toggle');
    const fontToggle = document.getElementById('font-toggle');
    const readerToggle = document.getElementById('reader-toggle');

    let isReaderActive = false;
    // Carga el tamaño de fuente inicial o usa el base
    let currentFontSize = parseFloat(localStorage.getItem('accessibility-font-size')) || 16;
    body.style.fontSize = `${currentFontSize}px`;

    // Función principal para la narración (TTS - Text-to-Speech)
    function speakText(text) {
        if ('speechSynthesis' in window && isReaderActive) {
            window.speechSynthesis.cancel(); // Detiene la narración anterior
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = 'es-ES'; // Asegura la lectura en español
            window.speechSynthesis.speak(utterance);
        }
    }

    // === 1. Lógica del Widget de Accesibilidad ===

    // A. Alto Contraste
    if (contrastToggle) {
        contrastToggle.addEventListener('click', () => {
            body.classList.toggle('high-contrast');
            const isHighContrast = body.classList.contains('high-contrast');
            localStorage.setItem('accessibility-contrast', isHighContrast ? 'enabled' : 'disabled');
            speakText(`Modo de Contraste ${isHighContrast ? 'Activado' : 'Desactivado'}`);
        });
    }

    // B. Tamaño de Fuente
    if (fontToggle) {
        fontToggle.addEventListener('click', () => {
            currentFontSize = currentFontSize * 1.1; // Aumenta 10%
            if (currentFontSize > 24) { 
                currentFontSize = 16; // Vuelve a la base si es muy grande
            }
            body.style.fontSize = `${currentFontSize}px`;
            localStorage.setItem('accessibility-font-size', currentFontSize);
            speakText(`Tamaño de Fuente ajustado a ${Math.round(currentFontSize)} píxeles.`);
        });
    }

    // C. Lector de Pantalla (TTS y Modo Cognitivo)
    if (readerToggle) {
        readerToggle.addEventListener('click', () => {
            isReaderActive = !isReaderActive;
            body.classList.toggle('reader-mode', isReaderActive);
            localStorage.setItem('accessibility-reader', isReaderActive ? 'enabled' : 'disabled');
            
            const status = isReaderActive ? 'Activado' : 'Desactivado';
            speakText(`Lector de Pantalla y Modo Simplificado: ${status}.`);
            
            if (!isReaderActive) {
                 window.speechSynthesis.cancel(); // Detiene la narración si se desactiva
            }
        });
        
        // Mejora: Narración al enfocar/hover (simula el comportamiento del lector real)
        document.querySelectorAll('h1, h2, h3, p, a, button, li, figcaption').forEach(element => {
            element.addEventListener('mouseenter', () => {
                if (isReaderActive) {
                    speakText(element.textContent);
                }
            });
            element.addEventListener('focus', () => { // Para navegación por teclado
                if (isReaderActive) {
                    speakText(element.textContent);
                }
            });
            element.addEventListener('mouseleave', () => { // Detener al salir
                if (isReaderActive) {
                    window.speechSynthesis.cancel();
                }
            });
            element.addEventListener('blur', () => { // Detener al perder foco
                if (isReaderActive) {
                    window.speechSynthesis.cancel();
                }
            });
        });
    }

    // === 2. Lógica de Persistencia de Estado ===
    // Carga los estados al iniciar la página
    if (localStorage.getItem('accessibility-contrast') === 'enabled') {
        body.classList.add('high-contrast');
    }
    if (localStorage.getItem('accessibility-reader') === 'enabled') {
        isReaderActive = true; // Asegura que la variable JS también refleje el estado
        body.classList.add('reader-mode');
    }
    // La fuente ya se cargó al inicio del script.
});


// === 3. Lógica de Acceso Adaptado (Usada en pages/login.html) ===
function accessWithProfile(profileType) {
    // 1. Limpia cualquier configuración previa y establece la nueva
    localStorage.clear(); 

    let message = "";
    switch (profileType) {
        case 'visual':
            localStorage.setItem('accessibility-contrast', 'enabled');
            localStorage.setItem('accessibility-reader', 'enabled');
            // Podríamos simular también un tamaño de fuente mayor por defecto aquí
            localStorage.setItem('accessibility-font-size', '20'); 
            message = "Experiencia visual optimizada cargada: Alto Contraste y Lector activados. Redirigiendo a tu Dashboard.";
            break;
        case 'auditiva':
            localStorage.setItem('accessibility-subtitles', 'enabled'); // Un flag que el aula podría leer
            message = "Experiencia auditiva optimizada cargada: Subtítulos activos por defecto. Redirigiendo a tu Dashboard.";
            break;
        case 'motriz':
            localStorage.setItem('accessibility-focus-size', 'large'); // Un flag para estilos de foco grandes
            message = "Experiencia motriz optimizada cargada: Navegación por teclado y comandos de voz mejorada. Redirigiendo a tu Dashboard.";
            break;
        case 'cognitiva':
            localStorage.setItem('accessibility-reader', 'enabled'); // Activa el modo simplificado/lector
            // También podría ajustar fuente a una disléxica si tuviéramos ese CSS
            message = "Experiencia cognitiva optimizada cargada: Interfaz simplificada y narración activa. Redirigiendo a tu Dashboard.";
            break;
        default:
            message = "Perfil estándar cargado. Redirigiendo a tu Dashboard.";
    }

    alert(message); // Usa un alert para mostrar la "carga"
    // 2. Redirigir al Dashboard, donde se verá el perfil aplicado
    window.location.href = `../pages/dashboard.html?profile=${profileType}`;
}
