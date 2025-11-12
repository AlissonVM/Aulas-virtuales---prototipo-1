document.addEventListener('DOMContentLoaded', () => {
    // 1. Funcionalidad de Accesibilidad (Mantener)
    const body = document.body;
    const contrastToggle = document.getElementById('contrast-toggle');
    const fontToggle = document.getElementById('font-toggle');
    const readerToggle = document.getElementById('reader-toggle');

    if (contrastToggle) {
        contrastToggle.addEventListener('click', () => body.classList.toggle('high-contrast'));
    }
    if (fontToggle) {
        fontToggle.addEventListener('click', () => body.classList.toggle('large-font'));
    }
    if (readerToggle) {
        readerToggle.addEventListener('click', () => {
            alert('Simulación de Lector de Pantalla (TTS) activo. Leyendo el contenido principal...');
        });
    }

    // 2. Lógica de Bienvenida del Dashboard (Mantener)
    const welcomeBanner = document.getElementById('welcome-banner');
    if (welcomeBanner && localStorage.getItem('showWelcome') === 'true') {
        welcomeBanner.classList.add('active');
        localStorage.removeItem('showWelcome');
    }

    // 3. LÓGICA DE MENÚ DINÁMICO (CRÍTICO)
    const userProfile = localStorage.getItem('userProfile');
    const dashboardLinkLi = document.getElementById('nav-dashboard-link');
    const loginLinkLi = document.getElementById('nav-login-link');
    const logoutLinkLi = document.getElementById('nav-logout-link');
    const logoutButton = document.getElementById('logout-button');

    // Función de logout
    if (logoutButton) {
        logoutButton.addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.removeItem('userProfile');
            localStorage.removeItem('showWelcome');
            // Redirigir al inicio 
            // Determinar la ruta relativa para index.html (si está en pages/ o docs/, retroceder)
            const path = window.location.pathname;
            const target = path.includes('/pages/') || path.includes('/docs/') ? '../index.html' : 'index.html';
            window.location.href = target; 
        });
    }

    if (userProfile) {
        // Logeado: Ocultar login/acceso adaptado, mostrar cerrar sesión.
        if (loginLinkLi) loginLinkLi.style.display = 'none';
        if (logoutLinkLi) logoutLinkLi.style.display = 'list-item';
        
        if (dashboardLinkLi) {
            let dashboardText = 'Mi Dashboard';
            let dashboardFile = '';
            
            if (userProfile === 'student') {
                dashboardText = 'Mi Dashboard Alumno';
                dashboardFile = 'dashboard.html';
            } else if (userProfile === 'teacher') {
                dashboardText = 'Mi Dashboard Docente';
                dashboardFile = 'dashboard-teacher.html';
            }
            
            // Actualizar el texto y el enlace en el menú principal
            const aTag = dashboardLinkLi.querySelector('a');
            if(aTag && !aTag.href.includes(dashboardFile)) { 
                aTag.textContent = dashboardText;
                
                // Determinar la ruta relativa correcta (si estamos en pages/, docs/ o root)
                const path = window.location.pathname;
                if (path.includes('/pages/')) {
                    aTag.href = dashboardFile; // Ya estamos en la carpeta pages/
                } else if (path.includes('/docs/')) {
                    aTag.href = '../pages/' + dashboardFile;
                } else { // Estamos en la raíz (index.html)
                    aTag.href = 'pages/' + dashboardFile;
                }
            }
        }
    } else {
        // No logeado: Asegurar que los links de login/dashboard apuntan al login.
        if (dashboardLinkLi) dashboardLinkLi.style.display = 'list-item';
        if (loginLinkLi) loginLinkLi.style.display = 'list-item';
        if (logoutLinkLi) logoutLinkLi.style.display = 'none';
        
        // Asegurar que el link de Dashboard Alumno apunte al login
        if (dashboardLinkLi) {
            const aTag = dashboardLinkLi.querySelector('a');
            if(aTag) {
                 aTag.textContent = 'Mi Dashboard Alumno';
                 aTag.href = (window.location.pathname.endsWith('index.html') || window.location.pathname === '/') ? 'pages/login-student-classic.html' : 'login-student-classic.html'; 
            }
        }
    }
    
    // 4. Lógica específica para el Acceso Adaptado (pages/login.html)
    const profileSelector = document.querySelector('.profile-selector');
    if (profileSelector) {
        profileSelector.querySelectorAll('button').forEach(button => {
            button.addEventListener('click', () => {
                const profileType = button.getAttribute('data-profile');
                localStorage.setItem('userProfile', profileType); 
                localStorage.setItem('showWelcome', 'true');
                window.location.href = 'dashboard.html'; // Redirección correcta después de login adaptado
            });
        });
    }
});
