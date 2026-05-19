/* ==============================================
   DEGA MOTION - VANILLA JS
   Animaciones, scroll reveal, parallax, micro-interacciones
   Sin dependencias externas, optimizado para performance
   ============================================== */

(function () {
    'use strict';

    /* ==============================================
       1. PRELOADER
       Simula carga con contador y barra de progreso
       ============================================== */
    const preloader = document.getElementById('preloader');
    const preloaderFill = document.getElementById('preloaderFill');
    const preloaderCounter = document.getElementById('preloaderCounter');

    function initPreloader() {
        let progress = 0;
        const duration = 1800; // duración total del preloader (ms)
        const startTime = performance.now();

        function tick(now) {
            const elapsed = now - startTime;
            progress = Math.min((elapsed / duration) * 100, 100);

            if (preloaderFill) preloaderFill.style.width = progress + '%';
            if (preloaderCounter) preloaderCounter.textContent = String(Math.floor(progress)).padStart(2, '0');

            if (progress < 100) {
                requestAnimationFrame(tick);
            } else {
                // Espera 400ms y oculta el preloader
                setTimeout(() => {
                    preloader.classList.add('is-hidden');
                    document.body.style.overflow = '';
                    // Dispara las animaciones de entrada del hero
                    triggerInitialReveal();
                }, 400);
            }
        }

        // Bloquea scroll mientras carga
        document.body.style.overflow = 'hidden';
        requestAnimationFrame(tick);
    }

    /* ==============================================
       2. REVEAL ON SCROLL (IntersectionObserver)
       Elementos aparecen con fade + blur + translate
       ============================================== */
    const revealElements = document.querySelectorAll('[data-reveal]');

    function initRevealObserver() {
        if (!('IntersectionObserver' in window)) {
            // Fallback: mostrar todos
            revealElements.forEach(el => el.classList.add('is-revealed'));
            return;
        }

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const delay = parseInt(entry.target.dataset.delay || 0, 10);
                    setTimeout(() => {
                        entry.target.classList.add('is-revealed');
                    }, delay);
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.12,
            rootMargin: '0px 0px -50px 0px'
        });

        revealElements.forEach(el => observer.observe(el));
    }

    // Función que revela inmediatamente los elementos del hero
    // (porque ya están en viewport al cargar)
    function triggerInitialReveal() {
        const heroReveals = document.querySelectorAll('.hero [data-reveal]');
        heroReveals.forEach(el => {
            const delay = parseInt(el.dataset.delay || 0, 10);
            setTimeout(() => el.classList.add('is-revealed'), delay);
        });
    }

    /* ==============================================
       3. NAVBAR — Scroll y menú móvil
       ============================================== */
    const navbar = document.getElementById('navbar');
    const navToggle = document.getElementById('navToggle');
    const navMobile = document.getElementById('navMobile');

    function initNavbar() {
        // Cambio de estilo al hacer scroll
        let lastScroll = 0;
        function handleScroll() {
            const scrollY = window.scrollY;
            if (scrollY > 50) {
                navbar.classList.add('is-scrolled');
            } else {
                navbar.classList.remove('is-scrolled');
            }
            lastScroll = scrollY;
        }
        window.addEventListener('scroll', handleScroll, { passive: true });

        // Toggle menú móvil
        if (navToggle) {
            navToggle.addEventListener('click', () => {
                navToggle.classList.toggle('is-open');
                navMobile.classList.toggle('is-open');
                document.body.style.overflow = navMobile.classList.contains('is-open') ? 'hidden' : '';
            });
        }

        // Cierra el menú móvil al hacer click en un enlace
        const mobileLinks = navMobile.querySelectorAll('.navbar__mobile-link');
        mobileLinks.forEach(link => {
            link.addEventListener('click', () => {
                navToggle.classList.remove('is-open');
                navMobile.classList.remove('is-open');
                document.body.style.overflow = '';
            });
        });
    }

    /* ==============================================
       4. PARALLAX SUTIL
       Mueve elementos decorativos al hacer scroll
       ============================================== */
    const parallaxElements = document.querySelectorAll('[data-parallax]');

    function initParallax() {
        if (parallaxElements.length === 0) return;

        let ticking = false;

        function updateParallax() {
            const scrollY = window.scrollY;
            parallaxElements.forEach(el => {
                const speed = parseFloat(el.dataset.parallax) || 0.3;
                const rect = el.getBoundingClientRect();
                const offset = (window.innerHeight - rect.top) * speed;
                el.style.transform = `translate3d(0, ${offset * 0.1}px, 0)`;
            });
            ticking = false;
        }

        window.addEventListener('scroll', () => {
            if (!ticking) {
                requestAnimationFrame(updateParallax);
                ticking = true;
            }
        }, { passive: true });
    }

    /* ==============================================
       5. CURSOR PERSONALIZADO (Desktop)
       Punto naranja con seguidor circular
       ============================================== */
    const cursor = document.getElementById('customCursor');
    const cursorFollower = document.getElementById('customCursorFollower');

    function initCustomCursor() {
        // Solo aplica si hay mouse fino (no en touch)
        if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
        if (!cursor || !cursorFollower) return;

        let mouseX = 0, mouseY = 0;
        let followerX = 0, followerY = 0;

        document.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
            cursor.style.left = mouseX + 'px';
            cursor.style.top = mouseY + 'px';
        });

        // Animación suave del seguidor (lerp)
        function animateFollower() {
            followerX += (mouseX - followerX) * 0.15;
            followerY += (mouseY - followerY) * 0.15;
            cursorFollower.style.left = followerX + 'px';
            cursorFollower.style.top = followerY + 'px';
            requestAnimationFrame(animateFollower);
        }
        animateFollower();

        // Hover sobre elementos interactivos
        const hoverables = document.querySelectorAll('a, button, .arsenal-card, .reel-item, .marquee__item');
        hoverables.forEach(el => {
            el.addEventListener('mouseenter', () => {
                cursor.classList.add('is-hovering');
                cursorFollower.classList.add('is-hovering');
            });
            el.addEventListener('mouseleave', () => {
                cursor.classList.remove('is-hovering');
                cursorFollower.classList.remove('is-hovering');
            });
        });
    }

    /* ==============================================
       6. SMOOTH SCROLL para anclas internas
       ============================================== */
    function initSmoothScroll() {
        // Seleccionar todos los anchors internos: navbar desktop, móvil y CTAs
        const anchors = document.querySelectorAll('a[href^="#"]');

        anchors.forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                const targetId = this.getAttribute('href');
                if (!targetId || targetId === '#' || targetId.length < 2) return;

                const target = document.querySelector(targetId);
                if (target) {
                    e.preventDefault();

                    // Cerrar menú móvil si está abierto
                    const navMobileEl = document.getElementById('navMobile');
                    const navToggleEl = document.getElementById('navToggle');
                    if (navMobileEl && navMobileEl.classList.contains('is-open')) {
                        navMobileEl.classList.remove('is-open');
                        if (navToggleEl) navToggleEl.classList.remove('is-open');
                        document.body.style.overflow = '';
                    }

                    // Calcular offset dinámico según el alto real de la navbar
                    const navbarEl = document.getElementById('navbar');
                    const navbarHeight = navbarEl ? navbarEl.offsetHeight : 72;

                    const targetRect = target.getBoundingClientRect();
                    const targetTop = targetRect.top + window.scrollY - navbarHeight - 8;

                    // Smooth scroll con easing cúbico
                    const startPos = window.scrollY;
                    const distance = targetTop - startPos;
                    const duration = Math.min(900, Math.max(400, Math.abs(distance) * 0.5));
                    let startTime = null;

                    function easeInOutCubic(t) {
                        return t < 0.5
                            ? 4 * t * t * t
                            : 1 - Math.pow(-2 * t + 2, 3) / 2;
                    }

                    function animateScroll(currentTime) {
                        if (!startTime) startTime = currentTime;
                        const elapsed = currentTime - startTime;
                        const progress = Math.min(elapsed / duration, 1);
                        const eased = easeInOutCubic(progress);

                        window.scrollTo(0, startPos + distance * eased);

                        if (progress < 1) {
                            requestAnimationFrame(animateScroll);
                        }
                    }

                    requestAnimationFrame(animateScroll);
                }
            });
        });
    }

    /* ==============================================
       7. VIDEO LAZY LOAD (performance)
       Pausa videos fuera de viewport para ahorrar batería/red
       ============================================== */
    function initVideoLazyLoad() {
        const videos = document.querySelectorAll('video[autoplay]');
        if (!('IntersectionObserver' in window)) return;

        const videoObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                const video = entry.target;
                if (entry.isIntersecting) {
                    // Reproduce si está visible
                    if (video.paused) {
                        const playPromise = video.play();
                        if (playPromise !== undefined) {
                            playPromise.catch(() => {
                                // Autoplay bloqueado, ignorar
                            });
                        }
                    }
                } else {
                    // Pausa si está fuera de viewport (excepto el hero)
                    if (!video.closest('.hero') && !video.paused) {
                        video.pause();
                    }
                }
            });
        }, { threshold: 0.1 });

        videos.forEach(video => videoObserver.observe(video));
    }

    /* ==============================================
       8. MICRO-INTERACCIÓN: Efecto magnético en botones
       Los botones se atraen sutilmente al cursor
       ============================================== */
    function initMagneticButtons() {
        if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

        const magneticButtons = document.querySelectorAll('.btn--primary, .btn--whatsapp, .navbar__cta');

        magneticButtons.forEach(btn => {
            btn.addEventListener('mousemove', (e) => {
                const rect = btn.getBoundingClientRect();
                const x = e.clientX - rect.left - rect.width / 2;
                const y = e.clientY - rect.top - rect.height / 2;
                btn.style.transform = `translate(${x * 0.15}px, ${y * 0.15}px) translateY(-2px)`;
            });

            btn.addEventListener('mouseleave', () => {
                btn.style.transform = '';
            });
        });
    }

    /* ==============================================
       9. ANIMACIÓN DEL CONTADOR (Stats hero)
       Los números crecen de 0 a su valor final
       ============================================== */
    function initStatsCounter() {
        const stats = document.querySelectorAll('.hero__stat-num');
        if (stats.length === 0) return;

        const animateValue = (el, end, suffix, duration) => {
            const start = 0;
            const startTime = performance.now();

            function tick(now) {
                const elapsed = now - startTime;
                const progress = Math.min(elapsed / duration, 1);
                // Easing easeOutExpo
                const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
                const current = Math.floor(start + (end - start) * eased);
                el.textContent = (suffix === 'plus' ? '+' : '') + current + (suffix === '4K' ? 'K' : '') + (suffix === 'h' ? 'h' : '');
                if (progress < 1) requestAnimationFrame(tick);
            }
            requestAnimationFrame(tick);
        };

        const statsObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const text = entry.target.textContent;
                    if (text.includes('+')) {
                        animateValue(entry.target, 13, 'plus', 1500);
                    } else if (text.includes('K')) {
                        animateValue(entry.target, 4, '4K', 1200);
                    } else if (text.includes('h')) {
                        animateValue(entry.target, 48, 'h', 1500);
                    }
                    statsObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });

        stats.forEach(stat => statsObserver.observe(stat));
    }

    /* ==============================================
       10. ARSENAL CARD — Parallax sutil interno
       El render y el video se mueven ligeramente al hacer hover
       ============================================== */
    function initArsenalCardEffect() {
        if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

        const cards = document.querySelectorAll('.arsenal-card');

        cards.forEach(card => {
            const render = card.querySelector('.gear-svg');
            if (!render) return;

            card.addEventListener('mousemove', (e) => {
                const rect = card.getBoundingClientRect();
                const x = (e.clientX - rect.left) / rect.width - 0.5;
                const y = (e.clientY - rect.top) / rect.height - 0.5;
                render.style.transform = `translate(${x * 10}px, ${y * 10}px) scale(1.05)`;
            });

            card.addEventListener('mouseleave', () => {
                render.style.transform = '';
            });
        });
    }

    /* ==============================================
       11. PERFORMANCE: Pausar animaciones en mobile / batería baja
       ============================================== */
    function checkPerformanceMode() {
        // Si el usuario tiene "reduce motion" o batería baja, simplificar
        if ('connection' in navigator && navigator.connection.saveData) {
            document.documentElement.classList.add('save-data');
        }
    }

    /* ==============================================
       INICIALIZACIÓN
       ============================================== */
    document.addEventListener('DOMContentLoaded', () => {
        initPreloader();
        initRevealObserver();
        initNavbar();
        initParallax();
        initCustomCursor();
        initSmoothScroll();
        initVideoLazyLoad();
        initMagneticButtons();
        initStatsCounter();
        initArsenalCardEffect();
        checkPerformanceMode();
    });

    // Si el DOM ya está listo (por si el script carga después)
    if (document.readyState !== 'loading') {
        // Las funciones ya se ejecutarán al disparar DOMContentLoaded en módulos compatibles
    }

})();
