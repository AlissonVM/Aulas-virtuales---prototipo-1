document.addEventListener('DOMContentLoaded', () => {
    const body = document.body;
    const contrastToggle = document.getElementById('contrast-toggle');
    const fontToggle = document.getElementById('font-toggle');
    const readerToggle = document.getElementById('reader-toggle');

    // Estado del lector de pantalla (TTS - Text-to-Speech)
    let isReaderActive = false;
    let currentFontSize = parseFloat(localStorage.getItem('accessibility-font-size')) || 16;
    body.style.fontSize = `${currentFontSize}px`;

    // Función principal para la narración (TTS)
    function speakText(text) {
        if ('speechSynthesis' in window && isReaderActive) {
            window.speechSynthesis.cancel(); // Detiene la narración anterior
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = 'es-ES';
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

    // C. Lector Simplificado (TTS y Modo Cognitivo)
    if (readerToggle) {
        readerToggle.addEventListener('click', () => {
            isReaderActive = !isReaderActive;
            body.classList.toggle('reader-mode', isReaderActive);
            localStorage.setItem('accessibility-reader', isReaderActive ? 'enabled' : 'disabled');
            
            const status = isReaderActive ? 'Activado' : 'Desactivado';
            speakText(`Modo Lector Simplificado y Narración por Voz: ${status}.`);
            
            if (!isReaderActive) {
                 window.speechSynthesis.cancel();
            }
        });
        
        // Mejora: Narración al enfocar/hover (simula el comportamiento del lector)
        document.querySelectorAll('h1, h2, h3, p, a, button').forEach(element => {
            // Usa 'mouseenter' para simular el foco visual en el desktop
            element.addEventListener('mouseenter', () => {
                if (isReaderActive) {
                    speakText(element.textContent);
                }
            });
            // Usa 'focus' para la navegación real por teclado
             element.addEventListener('focus', () => {
                if (isReaderActive) {
                    speakText(element.textContent);
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
        isReaderActive = true;
        body.classList.add('reader-mode');
    }
});


// === 3. Lógica de Simulación de Login (Usada en pages/login.html) ===
function simulateLogin(profile) {
    // 1. Limpia y establece la nueva configuración de accesibilidad
    localStorage.clear();

    switch (profile) {
        case 'visual':
            localStorage.setItem('accessibility-contrast', 'enabled');
            localStorage.setItem('accessibility-reader', 'enabled');
            alert("Perfil Visual cargado: Alto Contraste y Lector activados. Redirigiendo a las Aulas.");
            break;
        case 'auditiva':
            localStorage.setItem('accessibility-subtitles', 'enabled');
            alert("Perfil Auditivo cargado: Subtítulos activos por defecto. Redirigiendo a las Aulas.");
            break;
        case 'motriz':
            localStorage.setItem('accessibility-focus-size', 'large'); 
            alert("Perfil Motriz cargado: Navegación optimizada para teclado. Redirigiendo a las Aulas.");
            break;
        case 'cognitiva':
            localStorage.setItem('accessibility-reader', 'enabled'); // Activa el modo simplificado
            alert("Perfil Cognitivo cargado: Interfaz y lenguaje simplificados. Redirigiendo a las Aulas.");
            break;
    }

    // 2. Redirigir al aula virtual simulada para ver la configuración aplicada
    window.location.href = '../classes/class-module-1.html';
}
