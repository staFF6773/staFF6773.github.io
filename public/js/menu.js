document.addEventListener('DOMContentLoaded', function () {

    // Handling repository star counts
    const repos = [
        { id: 'stars-nakama', url: 'https://api.github.com/repos/NakamaStream/NakamaStream' },
        { id: 'stars-betterpvp', url: 'https://api.github.com/repos/Sstudios-Dev/Betterpvp-2.0' },
        { id: 'stars-teaching-feeling', url: 'https://api.github.com/repos/SpanishHgames/teaching-feeling---Launcher' }
    ];

    repos.forEach(repo => {
        fetch(repo.url)
            .then(response => response.json())
            .then(data => {
                if (data && data.stargazers_count !== undefined) {
                    document.getElementById(repo.id).textContent = data.stargazers_count;
                } else {
                    document.getElementById(repo.id).textContent = 'N/A';
                }
            })
            .catch(() => {
                document.getElementById(repo.id).textContent = 'Error';
            });
    });

    AOS.init({
        duration: 1000, // Duración de las animaciones en milisegundos
        easing: 'ease-in-out', // Tipo de transición
        once: false // Si se debe animar solo una vez
    });
});
