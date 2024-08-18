document.addEventListener('DOMContentLoaded', function () {
    const languageButton = document.getElementById('languageButton');
    const languageMenu = document.getElementById('languageMenu');
    const menuItems = languageMenu.querySelectorAll('a');

    // Función para mostrar/ocultar el menú
    languageButton.addEventListener('click', function () {
        if (languageMenu.style.display === 'block') {
            languageMenu.style.display = 'none';
        } else {
            languageMenu.style.display = 'block';
        }
    });

    // Función para cambiar el idioma
    menuItems.forEach(item => {
        item.addEventListener('click', function (e) {
            e.preventDefault(); // Evita el comportamiento por defecto del enlace

            const lang = this.getAttribute('data-lang');
            if (lang) {
                changeLanguage(lang);
                languageMenu.style.display = 'none'; // Ocultar el menú después de seleccionar
            }
        });
    });

    // Función para cambiar el idioma usando Google Translate
    function changeLanguage(lang) {
        // Verificar si el script de Google Translate ya se ha añadido
        if (!document.getElementById('google_translate_script')) {
            const translateScript = document.createElement('script');
            translateScript.id = 'google_translate_script';
            translateScript.src = `https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit`;
            document.body.appendChild(translateScript);
        }

        // Verificar si el div de Google Translate ya existe
        if (!document.getElementById('google_translate_element')) {
            const translateDiv = document.createElement('div');
            translateDiv.id = 'google_translate_element';
            document.body.insertBefore(translateDiv, document.body.firstChild);
        }

        window.googleTranslateElementInit = function() {
            new google.translate.TranslateElement({
                pageLanguage: 'es', // Idioma original de la página
                includedLanguages: 'es,en', // Idiomas que se pueden traducir
                layout: google.translate.TranslateElement.InlineLayout.SIMPLE
            }, 'google_translate_element');
        };

        // Cambia el idioma a través de Google Translate
        setTimeout(function() {
            const frame = document.querySelector('iframe.goog-te-banner-frame');
            if (frame) {
                frame.contentWindow.postMessage({language: lang}, '*');
            }
        }, 500);
    }
});
