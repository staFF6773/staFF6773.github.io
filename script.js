(function() {
    // Año actual en el footer
    const yearEl = document.getElementById('year');
    if (yearEl) {
        yearEl.textContent = new Date().getFullYear();
    }

    // Animación de entrada suave
    document.addEventListener('DOMContentLoaded', function() {
        const mainContent = document.querySelector('.main-content');
        const topBar = document.querySelector('.top-bar');
        const footer = document.querySelector('.footer');

        if (mainContent) {
            mainContent.style.opacity = '0';
            mainContent.style.transform = 'translateY(8px)';
            mainContent.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
            setTimeout(() => {
                mainContent.style.opacity = '1';
                mainContent.style.transform = 'translateY(0)';
            }, 100);
        }

        if (topBar) {
            topBar.style.opacity = '0';
            topBar.style.transition = 'opacity 0.6s ease';
            setTimeout(() => {
                topBar.style.opacity = '1';
            }, 200);
        }

        if (footer) {
            footer.style.opacity = '0';
            footer.style.transition = 'opacity 0.6s ease';
            setTimeout(() => {
                footer.style.opacity = '1';
            }, 300);
        }
    });

    // Obtener commits recientes del repositorio CubicLauncher
    const commitsContainer = document.getElementById('commitsContainer');
    const repoApiUrl = 'https://api.github.com/repos/CubicLauncherDevs/CubicLauncher/commits?per_page=5';

    async function fetchCommits() {
        try {
            const response = await fetch(repoApiUrl);
            if (!response.ok) {
                throw new Error('No se pudieron cargar los commits');
            }
            const commits = await response.json();
            renderCommits(commits);
        } catch (error) {
            commitsContainer.innerHTML = `
                <div class="loading-commits" style="color: #ff6b6b;">
                    ⚠ No se pudieron cargar los commits. Intenta recargar.
                </div>
            `;
        }
    }

    function renderCommits(commits) {
        if (!commits || commits.length === 0) {
            commitsContainer.innerHTML = `<div class="loading-commits">No hay commits recientes.</div>`;
            return;
        }

        const commitsHtml = commits.map(commit => {
            const message = commit.commit?.message || 'Sin mensaje';
            const authorName = commit.commit?.author?.name || commit.author?.login || 'Desconocido';
            const authorAvatar = commit.author?.avatar_url || commit.committer?.avatar_url || '';
            const commitDate = new Date(commit.commit?.author?.date || commit.commit?.committer?.date || Date.now());
            const formattedDate = commitDate.toLocaleDateString('es-ES', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
            const commitUrl = commit.html_url || '#';
            const shortSha = commit.sha ? commit.sha.substring(0, 7) : '';

            return `
                <div class="commit-item">
                    ${authorAvatar ? `<img src="${authorAvatar}" alt="${authorName}" class="commit-avatar" onerror="this.style.display='none'">` : ''}
                    <div class="commit-info">
                        <div class="commit-message" title="${message}">${message}</div>
                        <div class="commit-meta">
                            <span class="commit-author">${authorName}</span>
                            <span class="commit-date">${formattedDate}</span>
                            ${shortSha ? `<span>#${shortSha}</span>` : ''}
                        </div>
                    </div>
                    <a href="${commitUrl}" target="_blank" rel="noopener noreferrer" class="commit-link" title="Ver commit">↗</a>
                </div>
            `;
        }).join('');

        commitsContainer.innerHTML = commitsHtml;
    }

    // Iniciar la carga de commits
    fetchCommits();
})();
