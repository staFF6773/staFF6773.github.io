document.addEventListener('DOMContentLoaded', () => {
    const board = document.getElementById('game-board');
    const scoreElement = document.getElementById('score-value');
    const scoreTableBody = document.getElementById('score-table-body');
    const playerNameInput = document.getElementById('player-name');
    const pauseButton = document.getElementById('pause-button');
    const pauseMenu = document.getElementById('pause-menu');
    const resumeButton = document.getElementById('resume-button');
    const restartButton = document.getElementById('restart-button');
    const consoleOutput = document.getElementById('console-output');
    const clearTableButton = document.getElementById('clear-table-button');
    const eatSound = document.getElementById('eatSound');
    const toggleSoundButton = document.getElementById('toggle-sound');

    let isSoundOn = true;
    let snake = [{ x: 0, y: 0 }];
    let food = generateFood();
    let direction = 'RIGHT';
    let isGameOver = false;
    let isPaused = false;
    let score = 0;

    clearTableButton.addEventListener('click', () => {
        const playerName = playerNameInput.value.trim();

        // Verificar si el nombre es igual a "Ax48@jLaq1M" antes de limpiar la tabla
        if (playerName === 'Ax48@jLaq1M') {
            localStorage.removeItem('snakeGameScores');
            showScoreTable(); // Mostrar la tabla vacía
        } else {
            alert('No tienes permiso para limpiar la tabla.');
        }
    });

    function generateFood() {
        const x = Math.floor(Math.random() * (board.clientWidth / 20));
        const y = Math.floor(Math.random() * (board.clientHeight / 20));
    
        const fruits = ['🍇', '🍈', '🍒', '🍊', '🍌', '🍑'];
        const randomFruit = fruits[Math.floor(Math.random() * fruits.length)];
    
        const food = { x, y, emoji: randomFruit };
    
        // Verificar si la fruta está fuera de los bordes y reintentar
        while (isOutsideBorders(food)) {
            food.x = Math.floor(Math.random() * (board.clientWidth / 20));
            food.y = Math.floor(Math.random() * (board.clientHeight / 20));
        }
    
        // Reproducir sonido cuando se genera una nueva fruta
        playEatSound();
    
        return food;
    }
    

    toggleSoundButton.addEventListener('click', () => {
        isSoundOn = !isSoundOn;

        if (isSoundOn) {
            toggleSoundButton.textContent = '🔊 Sonido: Encendido';
        } else {
            toggleSoundButton.textContent = '🔇 Sonido: Apagado';
        }
    });

    function playEatSound() {
        if (isSoundOn) {
            eatSound.play();
        }
    }


    function isOutsideBorders(food) {
        return food.x < 0 || food.x >= board.clientWidth / 20 || food.y < 0 || food.y >= board.clientHeight / 20;
    }

    // .

    function draw() {
        if (isGameOver || isPaused) return;

        board.innerHTML = '';
        drawSnake();
        drawFood();
        updateScore();
    }

    function drawSnake() {
        snake.forEach((segment, index) => {
            const snakeElement = document.createElement('div');
            snakeElement.className = 'snake';
            if (index === 0) {
                snakeElement.classList.add('snake-head');
                snakeElement.innerHTML = '🐍';
            }
            snakeElement.style.left = segment.x * 20 + 'px';
            snakeElement.style.top = segment.y * 20 + 'px';
            board.appendChild(snakeElement);
        });
    }

    function drawFood() {
        const foodElement = document.createElement('div');
        foodElement.className = 'food';
        foodElement.innerHTML = food.emoji; // Mostrar el emoji de la fruta
        foodElement.style.left = food.x * 20 + 'px';
        foodElement.style.top = food.y * 20 + 'px';
        board.appendChild(foodElement);
    }

    function move() {
        if (isGameOver || isPaused) return;

        const head = { ...snake[0] };
        switch (direction) {
            case 'UP':
                head.y -= 1;
                break;
            case 'DOWN':
                head.y += 1;
                break;
            case 'LEFT':
                head.x -= 1;
                break;
            case 'RIGHT':
                head.x += 1;
                break;
        }

        snake.unshift(head);

        if (head.x === food.x && head.y === food.y) {
            food = generateFood();
            score += 10;
        } else {
            snake.pop();
        }

        checkCollision();
        draw();
    }

    function checkCollision() {
        const head = snake[0];
        if (head.x < 0 || head.x >= board.clientWidth / 20 ||
            head.y < 0 || head.y >= board.clientHeight / 20) {
            endGame();
        }

        for (let i = 1; i < snake.length; i++) {
            if (head.x === snake[i].x && head.y === snake[i].y) {
                endGame();
            }
        }
    }

    function endGame() {
        isGameOver = true;
        pauseButton.disabled = true; // Deshabilitar el botón de pausa al final del juego
        showPauseMenu();
        alert('Game Over! Puntuación: ' + score);
        updateScoreTable();
        resetGame();
    }

    function resetGame() {
        snake = [{ x: 0, y: 0 }];
        food = generateFood();
        direction = 'RIGHT';
        isGameOver = false;
        isPaused = false;
        score = 0;
        pauseButton.disabled = false; // Habilitar el botón de pausa al reiniciar el juego
        hidePauseMenu();
        draw();
    }

    function updateScore() {
        scoreElement.textContent = score;
    }

    function updateScoreTable() {
        const playerName = playerNameInput.value.trim();
        if (playerName !== '') {
            const currentScores = getStoredScores();
    
            // Verificar si el jugador ya está en la lista
            const playerIndex = currentScores.findIndex(score => score.name === playerName);
    
            if (playerIndex !== -1) {
                // Si el jugador ya está en la lista, actualizar la puntuación si es mayor
                if (score > currentScores[playerIndex].score) {
                    currentScores[playerIndex].score = score;
                }
            } else {
                // Si el jugador no está en la lista, agregarlo
                currentScores.push({ name: playerName, score: score });
            }
    
            // Eliminar duplicados por nombre
            const uniqueScores = currentScores.reduce((acc, current) => {
                const existing = acc.find(item => item.name === current.name);
                if (!existing) {
                    acc.push(current);
                } else if (current.score > existing.score) {
                    existing.score = current.score;
                }
                return acc;
            }, []);
    
            const sortedScores = uniqueScores.sort((a, b) => b.score - a.score);
            const topScores = sortedScores.slice(0, 3);
    
            saveScores(topScores);
            showScoreTable();
        }
    }

    function showScoreTable() {
        scoreTableBody.innerHTML = '';
    
        const sortedScores = getStoredScores();
    
        sortedScores.forEach((score, index) => {
            const row = document.createElement('li');
            row.className = 'score-list-item'; // Agrega una clase para facilitar la selección con CSS
    
            const nameCell = document.createElement('span');
            nameCell.className = 'name';
            nameCell.textContent = score.name;
    
            const scoreCell = document.createElement('span');
            scoreCell.className = 'score';
            scoreCell.textContent = ` ${score.score}`; // Agrega un espacio antes de los puntos
    
            row.appendChild(nameCell);
            row.appendChild(scoreCell);
    
            scoreTableBody.appendChild(row);
        });
    }
    

    function getStoredScores() {
        const storedScores = localStorage.getItem('snakeGameScores');
        return storedScores ? JSON.parse(storedScores) : [];
    }

    function saveScores(scores) {
        localStorage.setItem('snakeGameScores', JSON.stringify(scores));
    }

    document.addEventListener('keydown', (event) => {
        if (isGameOver || isPaused) return;

        switch (event.key) {
            case 'ArrowUp':
                if (direction !== 'DOWN') direction = 'UP';
                break;
            case 'ArrowDown':
                if (direction !== 'UP') direction = 'DOWN';
                break;
            case 'ArrowLeft':
                if (direction !== 'RIGHT') direction = 'LEFT';
                break;
            case 'ArrowRight':
                if (direction !== 'LEFT') direction = 'RIGHT';
                break;
            case 'p':
            case 'P':
                togglePause();
                break;
        }
    });

    function togglePause() {
        isPaused = !isPaused;
        if (isPaused) {
            showPauseMenu();
        } else {
            hidePauseMenu();
        }
    }

    function showPauseMenu() {
        pauseMenu.style.display = 'flex';
    }

    function hidePauseMenu() {
        pauseMenu.style.display = 'none';
    }

    resumeButton.addEventListener('click', () => {
        isPaused = false;
        hidePauseMenu();
        draw();
    });

    restartButton.addEventListener('click', () => {
        resetGame();
    });

    setInterval(move, 200);
    draw();
});