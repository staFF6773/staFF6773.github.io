document.addEventListener('DOMContentLoaded', (event) => {
    const sections = document.querySelectorAll('section');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, {
        threshold: 0.1
    });

    sections.forEach(section => {
        section.style.opacity = '0';
        section.style.transform = 'translateY(20px)';
        section.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
        observer.observe(section);
    });

    // Funcionalidad de modo oscuro
    const darkModeToggle = document.getElementById('darkModeToggle');
    const body = document.body;

    // Verificar si hay una preferencia guardada
    const isDarkMode = localStorage.getItem('darkMode') === 'true';

    // Aplicar el modo oscuro si está guardado
    if (isDarkMode) {
        body.classList.add('dark');
    }

    darkModeToggle.addEventListener('click', () => {
        body.classList.toggle('dark');
        localStorage.setItem('darkMode', body.classList.contains('dark'));
    });


    function createFlower() {
        const flower = document.createElement('div');
        flower.className = 'flower';
        flower.style.left = Math.random() * window.innerWidth + 'px';
        flower.style.top = window.innerHeight + 'px';
        document.getElementById('flower-container').appendChild(flower);
        
        const duration = Math.random() * 10 + 10;
        flower.animate([
            { transform: `translateY(0) rotate(0deg)` },
            { transform: `translateY(-${window.innerHeight + 40}px) rotate(360deg)` }
        ], {
            duration: duration * 1000,
            easing: 'linear',
            iterations: 1
        }).onfinish = () => flower.remove();
    }

    setInterval(createFlower, 300);

    // Parallax effect
    document.addEventListener('mousemove', (e) => {
        const parallaxElements = document.querySelectorAll('.parallax');
        parallaxElements.forEach((el) => {
            const speed = el.getAttribute('data-depth') || 0.1;
            const x = (window.innerWidth - e.pageX * speed) / 100;
            const y = (window.innerHeight - e.pageY * speed) / 100;
            el.style.transform = `translateX(${x}px) translateY(${y}px)`;
        });
    });
});
