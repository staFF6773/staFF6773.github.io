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

    // Obtener el total de descargas de las releases de CubicLauncher
    const totalDownloadsEl = document.getElementById('totalDownloads');
    const latestVersionEl = document.getElementById('latestVersion');
    const downloadsChartEl = document.getElementById('downloadsChart');
    const downloadsNoteEl = document.getElementById('downloadsNote');
    const releasesApiUrl = 'https://api.github.com/repos/CubicLauncherDevs/CubicLauncher/releases?per_page=100';

    function escapeHtml(value) {
        return String(value)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    function getReleaseDownloads(release) {
        return (release.assets || []).reduce((sum, asset) => {
            return sum + (asset.download_count || 0);
        }, 0);
    }

    function renderDownloadsChart(releases) {
        if (!downloadsChartEl) {
            return;
        }

        const rows = releases
            .map(release => ({
                tag: release.tag_name || 'sin-tag',
                count: getReleaseDownloads(release)
            }))
            .filter(row => row.count > 0)
            .sort((a, b) => b.count - a.count);

        if (rows.length === 0) {
            downloadsChartEl.innerHTML = `<div class="loading-commits">Todavía no hay descargas registradas.</div>`;
            return;
        }

        const total = rows.reduce((sum, row) => sum + row.count, 0);
        const topRows = rows.slice(0, 10);
        const maxCount = topRows[0].count;

        downloadsChartEl.innerHTML = topRows.map(row => {
            const percentage = maxCount > 0 ? (row.count / maxCount) * 100 : 0;
            const formatted = row.count.toLocaleString('es-ES');

            return `
                <div class="download-row" title="${escapeHtml(row.tag)} — ${formatted} descargas">
                    <span class="download-version">${escapeHtml(row.tag)}</span>
                    <span class="download-bar-track">
                        <span class="download-bar-fill" data-width="${percentage.toFixed(1)}"></span>
                    </span>
                    <span class="download-count">${formatted}</span>
                </div>
            `;
        }).join('');

        requestAnimationFrame(() => {
            downloadsChartEl.querySelectorAll('.download-bar-fill').forEach(bar => {
                bar.style.width = `${bar.dataset.width}%`;
            });
        });

        if (downloadsNoteEl) {
            downloadsNoteEl.textContent = `Top ${topRows.length} de ${releases.length} releases · ${total.toLocaleString('es-ES')} descargas totales`;
        }
    }

    async function fetchDownloads() {
        try {
            let url = releasesApiUrl;
            let releases = [];

            while (url) {
                const response = await fetch(url);
                if (!response.ok) {
                    throw new Error('No se pudieron cargar las descargas');
                }
                const page = await response.json();
                releases = releases.concat(page);

                const link = response.headers.get('Link');
                const nextMatch = link && link.match(/<([^>]+)>;\s*rel="next"/);
                url = nextMatch ? nextMatch[1] : null;
            }

            const total = releases.reduce((sum, release) => {
                return sum + getReleaseDownloads(release);
            }, 0);

            if (totalDownloadsEl) {
                totalDownloadsEl.textContent = total.toLocaleString('es-ES');
            }
            if (latestVersionEl && releases.length > 0) {
                latestVersionEl.textContent = releases[0].tag_name || '—';
            }

            renderDownloadsChart(releases);
        } catch (error) {
            if (totalDownloadsEl) {
                totalDownloadsEl.textContent = '—';
            }
            if (downloadsChartEl) {
                downloadsChartEl.innerHTML = `
                    <div class="loading-commits" style="color: #ff6b6b;">
                        ⚠ No se pudieron cargar las descargas. Intenta recargar.
                    </div>
                `;
            }
        }
    }

    // Iniciar la carga de commits y descargas
    fetchCommits();
    fetchDownloads();
})();
