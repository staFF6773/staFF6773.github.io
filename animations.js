<<<<<<< HEAD
// Animations are cancelled, welcome back to 1996!
// Keeping this script empty stops the modern features without a 404
console.log("Modern smooth animations disabled for pure Web 1.0 experience.");
=======
/* ═══════════════════════════════════════════════════════
   animations.js
   ═══════════════════════════════════════════════════════ */

(() => {
    'use strict';

    /* ──────────────────────────────────────────────────────
       1. PARTICLE CANVAS
       Floating dust particles that drift and react to mouse
       ────────────────────────────────────────────────────── */
    function initParticles() {
        const canvas = document.createElement('canvas');
        canvas.id = 'particle-canvas';
        Object.assign(canvas.style, {
            position: 'fixed',
            top: '0', left: '0',
            width: '100%', height: '100%',
            pointerEvents: 'none',
            zIndex: '0',
            opacity: '1'
        });
        document.body.prepend(canvas);

        const ctx = canvas.getContext('2d');
        let W, H, particles, mouse = { x: -9999, y: -9999 };

        const COUNT = Math.min(80, Math.floor(window.innerWidth / 16));

        class Particle {
            constructor() { this.reset(true); }

            reset(random) {
                this.x = random ? Math.random() * W : (Math.random() > .5 ? -10 : W + 10);
                this.y = Math.random() * H;
                this.r = Math.random() * 1.4 + 0.4;
                this.vx = (Math.random() - .5) * 0.35;
                this.vy = (Math.random() - .5) * 0.20;
                this.life = Math.random();           // 0-1 phase offset for alpha pulse
                this.speed = Math.random() * 0.004 + 0.002;
                this.baseAlpha = Math.random() * 0.4 + 0.08;
            }

            update() {
                // mouse repulsion (soft)
                const dx = this.x - mouse.x;
                const dy = this.y - mouse.y;
                const d = Math.sqrt(dx * dx + dy * dy);
                if (d < 120) {
                    const force = (120 - d) / 120;
                    this.vx += (dx / d) * force * 0.6;
                    this.vy += (dy / d) * force * 0.6;
                }

                // dampen
                this.vx *= 0.96;
                this.vy *= 0.96;

                this.x += this.vx;
                this.y += this.vy;
                this.life += this.speed;

                // wrap or reset
                if (this.x < -20 || this.x > W + 20 || this.y < -20 || this.y > H + 20) {
                    this.reset(false);
                }
            }

            draw() {
                const alpha = this.baseAlpha * (0.6 + 0.4 * Math.sin(this.life * Math.PI * 2));
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(180, 190, 210, ${alpha})`;
                ctx.fill();
            }
        }

        function resize() {
            W = canvas.width = window.innerWidth;
            H = canvas.height = window.innerHeight;
            if (!particles) {
                particles = Array.from({ length: COUNT }, () => new Particle());
            }
        }

        function drawConnections() {
            for (let i = 0; i < particles.length; i++) {
                for (let j = i + 1; j < particles.length; j++) {
                    const a = particles[i], b = particles[j];
                    const dx = a.x - b.x, dy = a.y - b.y;
                    const d = Math.sqrt(dx * dx + dy * dy);
                    if (d < 90) {
                        ctx.beginPath();
                        ctx.moveTo(a.x, a.y);
                        ctx.lineTo(b.x, b.y);
                        ctx.strokeStyle = `rgba(150, 165, 190, ${0.13 * (1 - d / 90)})`;
                        ctx.lineWidth = 0.5;
                        ctx.stroke();
                    }
                }
            }
        }

        let raf;
        function loop() {
            ctx.clearRect(0, 0, W, H);
            drawConnections();
            particles.forEach(p => { p.update(); p.draw(); });
            raf = requestAnimationFrame(loop);
        }

        window.addEventListener('resize', resize);
        window.addEventListener('mousemove', e => { mouse.x = e.clientX; mouse.y = e.clientY; });

        resize();
        loop();
    }


    /* ──────────────────────────────────────────────────────
       2. 3-D CARD TILT with specular highlight
       ────────────────────────────────────────────────────── */
    function initTilt() {
        const cards = document.querySelectorAll('section, header');
        const MAX = 8;          // max tilt degrees

        cards.forEach(card => {
            let raf, cx = 0, cy = 0, tx = 0, ty = 0;

            // specular layer
            const spec = document.createElement('div');
            spec.className = 'tilt-spec';
            Object.assign(spec.style, {
                position: 'absolute', inset: '0',
                borderRadius: 'inherit',
                pointerEvents: 'none',
                zIndex: '1',
                transition: 'opacity 0.4s',
                opacity: '0'
            });
            card.style.position = 'relative';
            card.style.overflow = 'hidden';
            card.prepend(spec);

            function tick() {
                cx += (tx - cx) * 0.12;
                cy += (ty - cy) * 0.12;
                card.style.transform = `perspective(900px) rotateX(${cy}deg) rotateY(${cx}deg) translateZ(4px)`;
                const px = 50 + cx * 3, py = 50 + cy * 3;
                spec.style.background =
                    `radial-gradient(circle at ${px}% ${py}%, rgba(255,255,255,0.09) 0%, transparent 65%)`;
                raf = requestAnimationFrame(tick);
            }

            card.addEventListener('mouseenter', () => {
                spec.style.opacity = '1';
                card.style.transition = 'box-shadow 0.3s, border-color 0.3s';
                raf = requestAnimationFrame(tick);
            });

            card.addEventListener('mousemove', e => {
                const r = card.getBoundingClientRect();
                const nx = (e.clientX - r.left) / r.width - 0.5;  // -0.5 to 0.5
                const ny = (e.clientY - r.top) / r.height - 0.5;
                tx = nx * MAX * 2;
                ty = -ny * MAX * 2;
            });

            card.addEventListener('mouseleave', () => {
                cancelAnimationFrame(raf);
                tx = 0; ty = 0;
                spec.style.opacity = '0';
                card.style.transition = 'transform 0.6s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.4s, border-color 0.3s';
                card.style.transform = 'perspective(900px) rotateX(0deg) rotateY(0deg) translateZ(0)';
                cx = 0; cy = 0;
            });
        });
    }


    /* ──────────────────────────────────────────────────────
       3. MAGNETIC BUTTONS
       Buttons shift position toward cursor when nearby
       ────────────────────────────────────────────────────── */
    function initMagnetic() {
        const buttons = document.querySelectorAll('.social-icon, .cta-button, .language-selector button');
        const PULL = 0.35;

        buttons.forEach(btn => {
            btn.style.transition = 'transform 0.3s cubic-bezier(0.34,1.56,0.64,1), background 0.25s, border-color 0.25s, box-shadow 0.25s';

            btn.addEventListener('mousemove', e => {
                const r = btn.getBoundingClientRect();
                const cx = r.left + r.width / 2;
                const cy = r.top + r.height / 2;
                const dx = (e.clientX - cx) * PULL;
                const dy = (e.clientY - cy) * PULL;
                btn.style.transform = `translate(${dx}px, ${dy}px) scale(1.04)`;
            });

            btn.addEventListener('mouseleave', () => {
                btn.style.transform = 'translate(0,0) scale(1)';
            });
        });
    }


    /* ──────────────────────────────────────────────────────
       4. TEXT SCRAMBLE on h1
       Reveals the text through a randomised character rain
       ────────────────────────────────────────────────────── */
    function initScramble() {
        const el = document.querySelector('h1');
        if (!el) return;
        const original = el.textContent.trim();
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_/';
        let frame = 0;
        let raf;

        function randomChar() {
            return chars[Math.floor(Math.random() * chars.length)];
        }

        function scramble(progress) {
            const revealed = Math.floor(progress * original.length);
            let out = '';
            for (let i = 0; i < original.length; i++) {
                if (i < revealed) {
                    out += original[i];
                } else if (original[i] === ' ') {
                    out += ' ';
                } else {
                    out += `<span style="color:rgba(160,174,192,0.45)">${randomChar()}</span>`;
                }
            }
            el.innerHTML = out;
        }

        const DURATION = 55; // frames
        function tick() {
            frame++;
            const progress = Math.min(frame / DURATION, 1);
            const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
            scramble(eased);
            if (progress < 1) {
                raf = requestAnimationFrame(tick);
            } else {
                el.textContent = original;
            }
        }

        // small delay so it starts after page loads
        setTimeout(() => requestAnimationFrame(tick), 400);
    }


    /* ──────────────────────────────────────────────────────
       5. CLICK RIPPLE on glass panels
       ────────────────────────────────────────────────────── */
    function initRipple() {
        document.querySelectorAll('section, header, .skill-category').forEach(el => {
            el.addEventListener('click', function (e) {
                const r = this.getBoundingClientRect();
                const size = Math.max(r.width, r.height) * 1.5;
                const x = e.clientX - r.left - size / 2;
                const y = e.clientY - r.top - size / 2;

                const ripple = document.createElement('span');
                Object.assign(ripple.style, {
                    position: 'absolute',
                    width: size + 'px',
                    height: size + 'px',
                    left: x + 'px',
                    top: y + 'px',
                    borderRadius: '50%',
                    background: 'rgba(200, 210, 230, 0.06)',
                    transform: 'scale(0)',
                    pointerEvents: 'none',
                    zIndex: '99',
                    animation: 'rippleExpand 0.65s cubic-bezier(0.22,1,0.36,1) forwards'
                });

                this.appendChild(ripple);
                ripple.addEventListener('animationend', () => ripple.remove());
            });
        });

        // inject ripple keyframes once
        if (!document.getElementById('ripple-kf')) {
            const style = document.createElement('style');
            style.id = 'ripple-kf';
            style.textContent = `
      @keyframes rippleExpand {
        to { transform: scale(1); opacity: 0; }
      }`;
            document.head.appendChild(style);
        }
    }


    /* ──────────────────────────────────────────────────────
       6. MOUSE PARALLAX on background orbs
       The ::before and ::after pseudo-elements can't be
       targeted directly, so we move a pair of real divs
       ────────────────────────────────────────────────────── */
    function initParallax() {
        /* inject two parallax orb elements */
        const orb1 = document.createElement('div');
        const orb2 = document.createElement('div');

        [orb1, orb2].forEach((o, i) => {
            Object.assign(o.style, {
                position: 'fixed',
                borderRadius: '50%',
                pointerEvents: 'none',
                zIndex: '0',
                willChange: 'transform'
            });
            document.body.appendChild(o);
        });

        Object.assign(orb1.style, {
            width: '580px', height: '580px',
            top: '-180px', left: '-180px',
            background: 'radial-gradient(circle at 40% 40%, rgba(80,95,120,0.20) 0%, transparent 70%)',
            filter: 'blur(40px)'
        });
        Object.assign(orb2.style, {
            width: '660px', height: '660px',
            bottom: '-220px', right: '-220px',
            background: 'radial-gradient(circle at 60% 60%, rgba(60,78,108,0.18) 0%, transparent 70%)',
            filter: 'blur(44px)'
        });

        let mx = 0, my = 0, cx1 = 0, cy1 = 0, cx2 = 0, cy2 = 0;

        window.addEventListener('mousemove', e => {
            // normalise to -1 … 1
            mx = (e.clientX / window.innerWidth - 0.5) * 2;
            my = (e.clientY / window.innerHeight - 0.5) * 2;
        });

        function loop() {
            cx1 += (mx * 40 - cx1) * 0.04;
            cy1 += (my * 30 - cy1) * 0.04;
            cx2 += (-mx * 35 - cx2) * 0.035;
            cy2 += (-my * 28 - cy2) * 0.035;

            orb1.style.transform = `translate(${cx1}px, ${cy1}px)`;
            orb2.style.transform = `translate(${cx2}px, ${cy2}px)`;
            requestAnimationFrame(loop);
        }
        loop();
    }


    /* ──────────────────────────────────────────────────────
       7. STAGGERED SCROLL REVEAL with clip-path
       Sections clip in from the bottom
       ────────────────────────────────────────────────────── */
    function initReveal() {
        const items = document.querySelectorAll('section, nav');
        const style = document.createElement('style');
        style.textContent = `
    .reveal-hidden {
      opacity: 0;
      clip-path: inset(12px 0 0 0 round 24px);
      transform: translateY(18px);
      transition:
        opacity    0.65s cubic-bezier(0.22,1,0.36,1),
        clip-path  0.65s cubic-bezier(0.22,1,0.36,1),
        transform  0.65s cubic-bezier(0.22,1,0.36,1);
    }
    .reveal-visible {
      opacity: 1 !important;
      clip-path: inset(0px 0 0 0 round 24px) !important;
      transform: translateY(0) !important;
    }
  `;
        document.head.appendChild(style);

        items.forEach((el, i) => {
            el.classList.add('reveal-hidden');
            el.style.transitionDelay = (i * 0.06) + 's';
        });

        const io = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.replace('reveal-hidden', 'reveal-visible');
                    io.unobserve(entry.target);
                }
            });
        }, { threshold: 0.08 });

        items.forEach(el => io.observe(el));
    }


    /* ──────────────────────────────────────────────────────
       8. CURSOR SPOTLIGHT on sections (upgraded)
       Smooth lag-follow spotlight using lerp
       ────────────────────────────────────────────────────── */
    function initSpotlight() {
        const sections = document.querySelectorAll('section');

        sections.forEach(sec => {
            let cx = 50, cy = 50, tx = 50, ty = 50;
            let active = false, raf;

            function tick() {
                cx += (tx - cx) * 0.08;
                cy += (ty - cy) * 0.08;
                sec.style.setProperty('--mx', cx.toFixed(2) + '%');
                sec.style.setProperty('--my', cy.toFixed(2) + '%');
                if (active) raf = requestAnimationFrame(tick);
            }

            sec.addEventListener('mouseenter', () => {
                active = true;
                raf = requestAnimationFrame(tick);
            });

            sec.addEventListener('mousemove', e => {
                const r = sec.getBoundingClientRect();
                tx = ((e.clientX - r.left) / r.width) * 100;
                ty = ((e.clientY - r.top) / r.height) * 100;
            });

            sec.addEventListener('mouseleave', () => {
                active = false;
                cancelAnimationFrame(raf);
            });
        });
    }


    /* ──────────────────────────────────────────────────────
       BOOT — wait for DOM
       ────────────────────────────────────────────────────── */
    function boot() {
        initParticles();
        initTilt();
        initMagnetic();
        initScramble();
        initRipple();
        initParallax();
        initReveal();
        initSpotlight();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', boot);
    } else {
        boot();
    }

})();
>>>>>>> a0bc81ce036d397e0f44241ac96c4ba379cc6523
