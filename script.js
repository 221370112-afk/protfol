(function () {
    /* 1. LOADER - hide after 1.5s, uses both DOMContentLoaded + setTimeout for reliability */
    function hideLoader() {
        var loader = document.getElementById('loader');
        if (!loader) return;
        loader.style.opacity = '0';
        loader.style.visibility = 'hidden';
        loader.style.pointerEvents = 'none';
        setTimeout(function () { if (loader.parentNode) loader.parentNode.removeChild(loader); }, 900);
    }
    setTimeout(hideLoader, 1500);

    document.addEventListener('DOMContentLoaded', function () {

        /* 2. NAVBAR */
        var navbar = document.getElementById('navbar');
        var navLinks = document.querySelectorAll('.nav-link');
        var sections = document.querySelectorAll('section[id]');

        function updateNavbar() {
            if (!navbar) return;
            if (window.scrollY > 60) { navbar.classList.add('scrolled'); }
            else { navbar.classList.remove('scrolled'); }
        }

        function updateActiveLink() {
            var currentSection = '';
            var offset = navbar ? navbar.offsetHeight + 20 : 80;
            sections.forEach(function (s) {
                if (window.scrollY >= s.offsetTop - offset) currentSection = s.getAttribute('id');
            });
            navLinks.forEach(function (link) {
                link.classList.remove('active');
                if (link.getAttribute('href') === '#' + currentSection) link.classList.add('active');
            });
        }

        window.addEventListener('scroll', function () { updateNavbar(); updateActiveLink(); }, { passive: true });
        updateNavbar(); updateActiveLink();

        /* 3. MOBILE MENU */
        var navToggle = document.getElementById('navToggle');
        var navLinksContainer = document.getElementById('navLinks');
        if (navToggle && navLinksContainer) {
            navToggle.addEventListener('click', function () {
                navToggle.classList.toggle('active');
                navLinksContainer.classList.toggle('active');
            });
            navLinksContainer.querySelectorAll('a').forEach(function (a) {
                a.addEventListener('click', function () {
                    navToggle.classList.remove('active');
                    navLinksContainer.classList.remove('active');
                });
            });
        }

        /* 4. SCROLL REVEAL */
        var revealSel = '.reveal, .reveal-left, .reveal-right, .reveal-scale, .reveal-3d';
        if ('IntersectionObserver' in window) {
            var obs = new IntersectionObserver(function (entries) {
                entries.forEach(function (e) {
                    if (e.isIntersecting) { e.target.classList.add('active'); obs.unobserve(e.target); }
                });
            }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
            document.querySelectorAll(revealSel).forEach(function (el) { obs.observe(el); });
        } else {
            function revealOnScroll() {
                var tp = window.innerHeight * 0.9;
                document.querySelectorAll(revealSel).forEach(function (el) {
                    if (el.getBoundingClientRect().top < tp) el.classList.add('active');
                });
            }
            window.addEventListener('scroll', revealOnScroll, { passive: true });
            revealOnScroll();
        }

        /* 5. PROJECTS ACCORDION */
        document.querySelectorAll('.project-group-toggle').forEach(function (toggle) {
            toggle.addEventListener('click', function () {
                var targetId = toggle.getAttribute('data-target');
                var panel = document.getElementById(targetId);
                if (!panel) return;
                var isOpen = panel.classList.contains('open');
                document.querySelectorAll('.project-group-panel').forEach(function (p) { p.classList.remove('open'); });
                document.querySelectorAll('.project-group-toggle').forEach(function (t) { t.classList.remove('active'); });
                if (!isOpen) {
                    panel.classList.add('open');
                    toggle.classList.add('active');
                    setTimeout(function () {
                        panel.querySelectorAll(revealSel).forEach(function (el) { el.classList.add('active'); });
                        initTilt();
                    }, 120);
                }
            });
        });

        /* 6. 3D TILT */
        function initTilt() {
            document.querySelectorAll('[data-tilt]').forEach(function (el) {
                if (el._tiltDone) return;
                el._tiltDone = true;
                el.addEventListener('mousemove', function (e) {
                    var r = el.getBoundingClientRect();
                    var rx = (((e.clientY - r.top) / r.height) - 0.5) * -10;
                    var ry = (((e.clientX - r.left) / r.width) - 0.5) * 10;
                    el.style.transform = 'perspective(900px) rotateX(' + rx + 'deg) rotateY(' + ry + 'deg) scale(1.02)';
                });
                el.addEventListener('mouseleave', function () { el.style.transform = ''; });
            });
        }
        initTilt();

        /* 7. CURSOR GLOW */
        var glow = document.getElementById('cursorGlow');
        if (glow && !('ontouchstart' in window)) {
            glow.style.display = 'block';
            var mx = 0, my = 0, gx = 0, gy = 0;
            document.addEventListener('mousemove', function (e) { mx = e.clientX; my = e.clientY; });
            (function tick() {
                gx += (mx - gx) * 0.1; gy += (my - gy) * 0.1;
                glow.style.left = gx + 'px'; glow.style.top = gy + 'px';
                requestAnimationFrame(tick);
            })();
        }

        /* 8. SMOOTH SCROLL */
        document.querySelectorAll('a[href^="#"]').forEach(function (a) {
            a.addEventListener('click', function (e) {
                var target = document.querySelector(a.getAttribute('href'));
                if (target) {
                    e.preventDefault();
                    var offset = navbar ? navbar.offsetHeight : 70;
                    window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY - offset, behavior: 'smooth' });
                }
            });
        });

        /* 9. PROJECT GALLERY LIGHTBOX */
        var lightbox = document.getElementById('lightbox');
        var lightboxImg = document.getElementById('lightboxImg');
        var lightboxTitle = document.getElementById('lightboxTitle');
        var lightboxCounter = document.getElementById('lightboxCounter');
        var lightboxClose = document.getElementById('lightboxClose');
        var lightboxPrev = document.getElementById('lightboxPrev');
        var lightboxNext = document.getElementById('lightboxNext');
        var galleryImages = [];
        var galleryTitle = '';
        var galleryIndex = 0;

        function openLightbox(images, title, startIndex) {
            galleryImages = images;
            galleryTitle = title;
            galleryIndex = startIndex || 0;
            renderLightbox();
            lightbox.classList.add('open');
            lightbox.setAttribute('aria-hidden', 'false');
            document.body.style.overflow = 'hidden';
        }

        function closeLightbox() {
            lightbox.classList.remove('open');
            lightbox.setAttribute('aria-hidden', 'true');
            document.body.style.overflow = '';
        }

        function renderLightbox() {
            lightboxImg.src = galleryImages[galleryIndex];
            lightboxImg.alt = galleryTitle;
            lightboxTitle.textContent = galleryTitle;
            lightboxCounter.textContent = (galleryIndex + 1) + ' / ' + galleryImages.length;
        }

        function showNext() {
            galleryIndex = (galleryIndex + 1) % galleryImages.length;
            renderLightbox();
        }

        function showPrev() {
            galleryIndex = (galleryIndex - 1 + galleryImages.length) % galleryImages.length;
            renderLightbox();
        }

        document.querySelectorAll('.project-card.has-gallery').forEach(function (card) {
            card.addEventListener('click', function () {
                var raw = card.getAttribute('data-gallery');
                if (!raw) return;
                var images = raw.split(',').map(function (s) { return s.trim(); });
                var title = card.getAttribute('data-project-title') || '';
                openLightbox(images, title, 0);
            });
        });

        if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
        if (lightboxNext) lightboxNext.addEventListener('click', function (e) { e.stopPropagation(); showNext(); });
        if (lightboxPrev) lightboxPrev.addEventListener('click', function (e) { e.stopPropagation(); showPrev(); });

        if (lightbox) {
            lightbox.addEventListener('click', function (e) {
                if (e.target === lightbox) closeLightbox();
            });
        }

        document.addEventListener('keydown', function (e) {
            if (!lightbox || !lightbox.classList.contains('open')) return;
            if (e.key === 'Escape') closeLightbox();
            if (e.key === 'ArrowRight') showNext();
            if (e.key === 'ArrowLeft') showPrev();
        });

        /* 10. BROKEN IMAGE FALLBACK */
        document.querySelectorAll('.project-card img').forEach(function (img) {
            img.addEventListener('error', function () {
                var c = [['#E8E0CC', '#C4B89A'], ['#D4CDB8', '#B8A88A'], ['#F0EBD8', '#D4CDB8'], ['#C9A96E', '#8B7355']];
                var p = c[Math.floor(Math.random() * c.length)];
                var lbl = (img.alt || 'Project').replace(/[<>&"]/g, '');
                img.src = 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="800" height="500"><defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="' + p[0] + '"/><stop offset="100%" stop-color="' + p[1] + '"/></linearGradient></defs><rect fill="url(#g)" width="800" height="500"/><text x="400" y="240" text-anchor="middle" font-family="serif" font-size="22" fill="#3A2A1A" opacity="0.6">' + lbl + '</text></svg>');
            });
        });

    }); // end DOMContentLoaded
})();