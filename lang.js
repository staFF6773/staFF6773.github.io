        function changeLanguage(lang) {
            document.documentElement.lang = lang;

            const elements = document.querySelectorAll('[data-es], [data-en]');
            elements.forEach(el => {
                if (el.hasAttribute(`data-${lang}`)) {
                    el.style.display = '';
                } else {
                    el.style.display = 'none';
                }
            });
            
            document.querySelectorAll('.language-selector button').forEach(btn => {
                if (btn.dataset.lang === lang) {
                    btn.classList.add('active');
                } else {
                    btn.classList.remove('active');
                }
            });
            
            localStorage.setItem('preferredLanguage', lang);
        }
        
        document.addEventListener('DOMContentLoaded', () => {
            const savedLang = localStorage.getItem('preferredLanguage') || 'en';
            changeLanguage(savedLang);
        });