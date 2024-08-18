document.addEventListener("DOMContentLoaded", function() {
    const repoCards = document.querySelectorAll('.repo-card');

    repoCards.forEach(card => {
        const repo = card.getAttribute('data-repo');
        fetch(`https://api.github.com/repos/${repo}`)
            .then(response => response.json())
            .then(data => {
                const starsCount = data.stargazers_count;
                const starsElement = card.querySelector('.stars-count');
                starsElement.textContent = `⭐ ${starsCount} estrellas`;
            })
            .catch(error => {
                console.error('Error fetching repo data:', error);
            });
    });
});