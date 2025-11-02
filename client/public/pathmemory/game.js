document.addEventListener('DOMContentLoaded', () => {
    const menuScreen = document.getElementById('menuScreen');
    const howToPlayScreen = document.getElementById('howToPlayScreen');
    const gameScreen = document.getElementById('gameScreen');
    const levelCompleteScreen = document.getElementById('levelCompleteScreen');
    const gameOverScreen = document.getElementById('gameOverScreen');

    const startButton = document.getElementById('startButton');
    const howToPlayButton = document.getElementById('howToPlayButton');
    const backToMenuButton = document.getElementById('backToMenuButton');
    const restartButton = document.getElementById('restartButton');
    const menuButton = document.getElementById('menuButton');
    const nextLevelButton = document.getElementById('nextLevelButton');
    const playAgainButton = document.getElementById('playAgainButton');

    const levelDisplay = document.getElementById('levelDisplay');
    const scoreDisplay = document.getElementById('scoreDisplay');
    const livesDisplay = document.getElementById('livesDisplay');
    const completeScore = document.getElementById('completeScore');
    const bonusPoints = document.getElementById('bonusPoints');
    const finalLevel = document.getElementById('finalLevel');
    const finalScore = document.getElementById('finalScore');

    const gridContainer = document.getElementById('gridContainer');
    
    const correctSound = document.getElementById('correctSound');
    const wrongSound = document.getElementById('wrongSound');
    const levelCompleteSound = document.getElementById('levelCompleteSound');
    const gameOverSound = document.getElementById('gameOverSound');
    const clickSound = document.getElementById('clickSound');
    const applauseSound = document.getElementById('applauseSound');

    let currentLevel = 1;
    let score = 0;
    let lives = 3;
    let correctPath = [];
    let playerPath = [];
    let gridSize = 3;
    let pathLength = 3;
    let showPathTimeout;
    let isShowingPath = false;
    let isPlayerTurn = false;
    
    const levelConfigs = [
        { grid: 3, path: 3, showTime: 2000 },  // Level 1
        { grid: 3, path: 4, showTime: 2000 },  // Level 2
        { grid: 4, path: 4, showTime: 2000 },  // Level 3
        { grid: 4, path: 5, showTime: 1800 },  // Level 4
        { grid: 4, path: 6, showTime: 1800 },  // Level 5
        { grid: 5, path: 6, showTime: 1800 },  // Level 6
        { grid: 5, path: 7, showTime: 1600 },  // Level 7
        { grid: 5, path: 8, showTime: 1600 },  // Level 8
        { grid: 6, path: 8, showTime: 1500 },  // Level 9
        { grid: 6, path: 9, showTime: 1500 },  // Level 10
        { grid: 6, path: 10, showTime: 1400 }, // Level 11
        { grid: 7, path: 10, showTime: 1400 }, // Level 12
        { grid: 7, path: 11, showTime: 1300 }, // Level 13
        { grid: 7, path: 12, showTime: 1300 }, // Level 14
        { grid: 8, path: 12, showTime: 1200 }  // Level 15
    ];

    startButton.addEventListener('click', startGame);
    howToPlayButton.addEventListener('click', showHowToPlay);
    backToMenuButton.addEventListener('click', showMenu);
    restartButton.addEventListener('click', restartLevel);
    menuButton.addEventListener('click', returnToMenu);
    nextLevelButton.addEventListener('click', nextLevel);
    playAgainButton.addEventListener('click', playAgain);
    
    function startGame() {
        currentLevel = 1;
        score = 0;
        lives = 3;
        updateUI();
        showGameScreen();
        setupLevel();
    }

    function showHowToPlay() {
        menuScreen.classList.remove('active');
        menuScreen.style.display = "none";
        howToPlayScreen.classList.add('active');
    }

    function showMenu() {
        howToPlayScreen.classList.remove('active');
        gameOverScreen.classList.remove('active');
        gameScreen.classList.remove('active');
        menuScreen.classList.add('active');
        menuScreen.style.display = "flex";
    }

    function showGameScreen() {
        menuScreen.classList.remove('active');
        menuScreen.style.display = "none";
        howToPlayScreen.classList.remove('active');
        levelCompleteScreen.classList.remove('active');
        gameOverScreen.classList.remove('active');
        gameScreen.classList.add('active');
    }

    function showLevelComplete() {
        console.log("🏆 Level completed! Level:", currentLevel, "Score:", score, "Lives:", lives);
        
        menuScreen.style.display = "none";
        howToPlayScreen.classList.remove('active');
        gameScreen.classList.remove('active');
        gameOverScreen.classList.remove('active');
        
        const bonus = currentLevel * 100 + lives * 50;
        score += bonus;

        completeScore.textContent = score - bonus;
        bonusPoints.textContent = bonus;

        levelCompleteScreen.classList.add('active');

        levelCompleteSound.currentTime = 0;
        levelCompleteSound.play();

        // Send win result to parent (React app)
        const winMessage = {
            type: 'PM_RESULT',
            level: currentLevel,
            score: score,
            livesRemaining: lives,
            won: true
        };
        console.log("🎉 Sending WIN result to parent:", winMessage);
        window.parent.postMessage(winMessage, '*');

        // const applauseSound = document.getElementById('applauseSound');
        setTimeout(() => {
            applauseSound.currentTime = 0;
            applauseSound.play().catch(e => console.log("Applause sound error:", e));
        }, 500);
    }

    function showGameOver() {
        console.log("💀 Game over! Level:", currentLevel, "Score:", score, "Lives:", lives);
        
        menuScreen.style.display = "none";
        howToPlayScreen.classList.remove('active');
        gameScreen.classList.remove('active');
        levelCompleteScreen.classList.remove('active');

        finalLevel.textContent = currentLevel;
        finalScore.textContent = score;
        
        gameOverScreen.classList.add('active');

        gameOverSound.currentTime = 0;
        gameOverSound.play();

        // Send loss result to parent (React app)
        const lossMessage = {
            type: 'PM_RESULT',
            level: currentLevel,
            score: score,
            livesRemaining: lives,
            won: false
        };
        console.log("💀 Sending LOSS result to parent:", lossMessage);
        window.parent.postMessage(lossMessage, '*');
    }

    function returnToMenu() {
        clearTimeout(showPathTimeout);
        showMenu();
    }

    function restartLevel() {
        clearTimeout(showPathTimeout);
        setupLevel();
    }

    function nextLevel() {
        clearTimeout(showPathTimeout);

        currentLevel++;
        if (currentLevel > levelConfigs.length) {
            showGameOver();
            return;
        }
        
        updateUI();

        showGameScreen();
        setupLevel();
    }

    function playAgain() {
        startGame();
    }

    function updateUI() {
        levelDisplay.textContent = currentLevel;
        scoreDisplay.textContent = score;
        livesDisplay.textContent = lives;
    }

    function setupLevel() {
        gridContainer.innerHTML = '';
        playerPath = [];
        
        const config = levelConfigs[currentLevel - 1] || levelConfigs[levelConfigs.length - 1];
        gridSize = config.grid;
        pathLength = config.path;

        gridContainer.style.gridTemplateColumns = `repeat(${gridSize}, 1fr)`;
        gridContainer.style.gridTemplateRows = `repeat(${gridSize}, 1fr)`;

        for (let i = 0; i < gridSize * gridSize; i++) {
            const tile = document.createElement('div');
            tile.className = 'tile';
            tile.dataset.index = i;
            tile.addEventListener('click', handleTileClick);
            gridContainer.appendChild(tile);
        }
        
        correctPath = generatePath(pathLength, gridSize);

        showPathToPlayer(config.showTime);

        updateUI();
    }

    function generatePath(length, gridSize) {
        const path = [];
        const gridArea = gridSize * gridSize;
        
        let currentPos = Math.floor(Math.random() * gridArea);
        path.push(currentPos);

        while (path.length < length) {
            const neighbors = getNeighbors(currentPos, gridSize);
            const validNeighbors = neighbors.filter(pos => !path.includes(pos));

            if (validNeighbors.length === 0) {
                return generatePath(length, gridSize);
            }
            
            currentPos = validNeighbors[Math.floor(Math.random() * validNeighbors.length)];
            path.push(currentPos);
        }

        return path;
    }

    function getNeighbors(pos, gridSize) {
        const neighbors = [];
        const row = Math.floor(pos / gridSize);
        const col = pos % gridSize;
        
        if (row > 0) neighbors.push(pos - gridSize);
        if (row < gridSize - 1) neighbors.push(pos + gridSize);
        if (col > 0) neighbors.push(pos - 1);
        if (col < gridSize - 1) neighbors.push(pos + 1);

        return neighbors;
    }

    function showPathToPlayer(showTime) {
        isShowingPath = true;
        isPlayerTurn = false;

        let i = 0;
        const tiles = document.querySelectorAll('.tile');

        function highlightNextTile() {
            tiles.forEach(tile => tile.classList.remove('highlight'));

            if (i < correctPath.length) {
                tiles[correctPath[i]].classList.add('highlight');

                try {
                    if (clickSound.readyState > 0) {
                        clickSound.currentTime = 0;
                        clickSound.play().catch(e => console.log("Audio play error:", e));
                    }
                } catch (e) {
                    console.log("Audio error:", e);
                }

                i++;
                showPathTimeout = setTimeout(highlightNextTile, 500);
            } else {
                tiles.forEach(tile => tile.classList.remove('highlight'));
                isShowingPath = false;
                isPlayerTurn = true;
            }
        }

        highlightNextTile();
    }

    function handleTileClick(e) {
        if (!isPlayerTurn || isShowingPath) return;

        const clickedIndex = parseInt(e.target.dataset.index);
        clickSound.currentTime = 0;
        clickSound.play();
        
        if (clickedIndex === correctPath[playerPath.length]) {
            e.target.classList.add('correct');
            playerPath.push(clickedIndex);
            
            if (playerPath.length === correctPath.length) {
                isPlayerTurn = false;
                score += currentLevel * 50;
                setTimeout(showLevelComplete, 800);
            } else {
                correctSound.currentTime = 0;
                correctSound.play();
            }
        } else {
            e.target.classList.add('wrong');
            lives--;
            updateUI();

            if (lives <= 0) {
                isPlayerTurn = false;
                setTimeout(showGameOver, 800);
            } else {
                wrongSound.currentTime = 0;
                wrongSound.play();
                setTimeout(() => {
                    playerPath = [];
                    const tiles = document.querySelectorAll('.tile');
                    tiles.forEach(tile => {
                        tile.classList.remove('correct', 'wrong');
                    });
                }, 800);
            }
        }
    }

    showMenu();
});