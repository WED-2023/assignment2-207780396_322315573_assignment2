// Global variables
let users = [];
let currentUser = null;
let gameConfig = {
    shootKey: 32, // Space bar by default
    gameTime: 2, // minutes by default
};
let gameState = {
    score: 0,
    lives: 3,
    isRunning: false,
    timeRemaining: 0,
    timer: null,
    enemyMoveTimer: null,
    enemyShootTimer: null,
    speedUpTimer: null,
    speedIncreaseCount: 0,
    enemies: [],
    playerBullets: [],
    enemyBullets: [],
    gameOver: false,
    animationId: null
};
let gameElements = {
    playerShip: null,
    gameCanvas: null
};
let highScores = {};
let gameCounter = {};

// Initialization and DOM ready
$(document).ready(function() {
    checkBrowserCompatibility();
    
    // Initialize default user
    users.push({
        username: 'p',
        password: 'testuser',
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
        birthDate: '2000-01-01'
    });

    // Populate date dropdowns
    populateDateDropdowns();

    // Screen navigation setup
    setupNavigation();
    
    // Form submissions
    setupForms();
    
    // About modal
    setupAboutModal();
    
    // Game controls
    setupGameControls();
    
    // Initialize select for shoot key
    populateShootKeyOptions();
    
    // background settings
    $('#gameCanvas').css({
        backgroundImage: 'url("background.png")',
        backgroundSize: 'cover',
        backgroundPosition: 'center'
    });
});

function checkBrowserCompatibility() {
    const isChrome = /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor);
    
    if (!isChrome) {
        alert('המשחק מותאם לדפדפן Chrome. אנא השתמש בדפדפן Chrome לחוויית משחק מיטבית.');
    }
    
    const screenWidth = window.screen.width;
    const screenHeight = window.screen.height;
    
    if (screenWidth < 1366 || screenHeight < 768) {
        alert('המשחק מיועד לרזולוציה מינימלית של 1366x768. הרזולוציה הנוכחית שלך היא ' + screenWidth + 'x' + screenHeight);
    }
}

// Initialize date dropdowns
function populateDateDropdowns() {
    // Days
    const daySelect = $('#birthDay');
    for (let i = 1; i <= 31; i++) {
        daySelect.append(`<option value="${i}">${i}</option>`);
    }
    
    // Months
    const monthSelect = $('#birthMonth');
    const months = ['ינואר', 'פברואר', 'מרץ', 'אפריל', 'מאי', 'יוני', 
                  'יולי', 'אוגוסט', 'ספטמבר', 'אוקטובר', 'נובמבר', 'דצמבר'];
    months.forEach((month, i) => {
        monthSelect.append(`<option value="${i+1}">${month}</option>`);
    });
    
    // Years - from current year minus 100 to current year
    const yearSelect = $('#birthYear');
    const currentYear = new Date().getFullYear();
    for (let i = currentYear; i >= currentYear - 100; i--) {
        yearSelect.append(`<option value="${i}">${i}</option>`);
    }
}

// Populate shoot key options
function populateShootKeyOptions() {
    const shootKeySelect = $('#shootKey');
    
    // Add alphabet keys (A-Z)
    for (let i = 65; i <= 90; i++) {
        const keyChar = String.fromCharCode(i);
        shootKeySelect.append(`<option value="${i}">${keyChar}</option>`);
    }
}

// Setup screen navigation
function setupNavigation() {
    $('#welcomeLink').click(function(e) {
        e.preventDefault();
        showScreen('welcomeScreen');
    });
    
    $('#aboutLink').click(function(e) {
        e.preventDefault();
        $('#aboutModal').css('display', 'block');
    });
    
    $('#logoutLink').click(function(e) {
        e.preventDefault();
        currentUser = null;
        showScreen('welcomeScreen');
    });
    
    $('#registerBtn').click(function() {
        showScreen('registerScreen');
    });
    
    $('#loginBtn').click(function() {
        showScreen('loginScreen');
    });
    
    $('#playAgainBtn').click(function() {
        stopGame();
        resetGame();
        showScreen('configScreen');
    });
    
    $('#newGameBtn').click(function() {
        stopGame();
        resetGame();
        showScreen('configScreen');
    });
}

// Setup form submissions
function setupForms() {
    // Registration form
    $('#registerForm').submit(function(e) {
        e.preventDefault();
        
        const username = $('#username').val();
        const password = $('#password').val();
        const confirmPassword = $('#confirmPassword').val();
        const firstName = $('#firstName').val();
        const lastName = $('#lastName').val();
        const email = $('#email').val();
        const day = $('#birthDay').val();
        const month = $('#birthMonth').val();
        const year = $('#birthYear').val();
        
        // Validate form
        if (!username || !password || !confirmPassword || !firstName || !lastName || !email || !day || !month || !year) {
            alert('יש למלא את כל השדות');
            return;
        }
        
        // Validate password
        if (password !== confirmPassword) {
            alert('הסיסמאות אינן תואמות');
            return;
        }
        
        if (password.length < 8 || !/[0-9]/.test(password) || !/[a-zA-Z]/.test(password)) {
            alert('הסיסמה חייבת להכיל לפחות 8 תווים, מספרים ואותיות');
            return;
        }
        
        // Validate names - no numbers
        if (/[0-9]/.test(firstName) || /[0-9]/.test(lastName)) {
            alert('שם פרטי ושם משפחה אינם יכולים להכיל מספרים');
            return;
        }
        
        // Validate email
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            alert('כתובת אימייל לא חוקית');
            return;
        }
        
        // Check if username already exists
        if (users.find(user => user.username === username)) {
            alert('שם המשתמש כבר קיים במערכת');
            return;
        }
        
        // Create new user
        const newUser = {
            username: username,
            password: password,
            firstName: firstName,
            lastName: lastName,
            email: email,
            birthDate: `${year}-${month}-${day}`
        };
        
        users.push(newUser);
        currentUser = newUser;
        highScores[username] = [];
        gameCounter[username] = 0;
        
        showScreen('configScreen');
    });
    
    // Login form
    $('#loginForm').submit(function(e) {
        e.preventDefault();
        
        const username = $('#loginUsername').val();
        const password = $('#loginPassword').val();
        
        // Find user
        const user = users.find(u => u.username === username && u.password === password);
        
        if (user) {
            currentUser = user;
            
            if (!highScores[username]) {
                highScores[username] = [];
            }
            
            if (!gameCounter[username]) {
                gameCounter[username] = 0;
            }
            
            showScreen('configScreen');
            $('#loginError').text('');
        } else {
            $('#loginError').text('שם משתמש או סיסמה שגויים');
        }
    });
    
    // Game configuration form
    $('#configForm').submit(function(e) {
        e.preventDefault();
        
        // Save configuration
        gameConfig.shootKey = parseInt($('#shootKey').val());
        gameConfig.gameTime = parseInt($('#gameTime').val());
        
        // Start game
        showScreen('gameScreen');
        startGame();
    });
}

// Setup about modal
function setupAboutModal() {
    $('.close').click(function() {
        $('#aboutModal').css('display', 'none');
    });
    
    $(window).click(function(e) {
        if (e.target === document.getElementById('aboutModal')) {
            $('#aboutModal').css('display', 'none');
        }
    });
    
    $(document).keydown(function(e) {
        if (e.key === "Escape") {
            $('#aboutModal').css('display', 'none');
        }
    });
}

// Setup game controls
function setupGameControls() {
    // Keyboard controls for the game
    $(document).keydown(function(e) {
        if (!gameState.isRunning) return;
        
        const key = e.which;
        
        // Movement with arrow keys
        switch(key) {
            case 37: 
                movePlayerShip('left');
                break;
            case 38:
                movePlayerShip('up');
                break;
            case 39:
                movePlayerShip('right');
                break;
            case 40:
                movePlayerShip('down');
                break;
        }
        
        // Shooting with configured key
        if (key === gameConfig.shootKey) {
            shootPlayerBullet();
        }
    });
}

function showScreen(screenId) {
    // Hide all screens
    $('.screen').removeClass('active');
    
    // Show requested screen
    $(`#${screenId}`).addClass('active');
}

// Game functions
function startGame() {
    resetGame();
    gameState.isRunning = true;
    createGameElements();
    startGameTimers();
    $('#backgroundMusic')[0].play();
}

function createGameElements() {
    $('#gameCanvas').empty();
    
    gameElements.gameCanvas = document.getElementById('gameCanvas');
    
    createPlayerShip();
    
    createEnemyShips();
}

function createPlayerShip() {
    if (gameElements.playerShip) {
        gameElements.gameCanvas.removeChild(gameElements.playerShip);
    }
    
    const playerShip = document.createElement('div');
    playerShip.className = 'spaceship player-spaceship';
    
    playerShip.style.backgroundImage = 'url("good.png")';
    playerShip.style.backgroundSize = 'contain';
    playerShip.style.backgroundRepeat = 'no-repeat';
    playerShip.style.backgroundPosition = 'center';
    
    playerShip.style.backgroundColor = 'transparent';
    playerShip.style.border = 'none';
    
    const canvasWidth = gameElements.gameCanvas.offsetWidth;
    playerShip.style.left = ((canvasWidth / 2) - 25) + 'px';
    playerShip.style.bottom = '20px';
    
    gameElements.gameCanvas.appendChild(playerShip);
    gameElements.playerShip = playerShip;
    
    playerShip.style.zIndex = '100';
    
    return playerShip;
}

function createEnemyShips() {
    const enemyImages = [
        'spaceship4.png',
        'spaceship3.png',
        'spaceship2.png',
        'spaceship1.png'
    ];
    
    const canvasWidth = gameElements.gameCanvas.offsetWidth;
    
    const spacingX = Math.max(60, canvasWidth / 20);
    const spacingY = 60;
    
    const totalWidth = spacingX * 5;
    const leftOffset = (canvasWidth - totalWidth) / 2;
    const topOffset = 20;
    
    for (let row = 0; row < 4; row++) {
        for (let col = 0; col < 5; col++) {
            const enemy = document.createElement('div');
            enemy.className = 'spaceship enemy-spaceship';
            
            enemy.style.backgroundImage = `url("${enemyImages[row]}")`;
            enemy.style.backgroundSize = 'contain';
            enemy.style.backgroundRepeat = 'no-repeat';
            enemy.style.backgroundPosition = 'center';
            
            enemy.style.backgroundColor = 'transparent';
            enemy.style.border = 'none';
            
            enemy.style.left = (col * spacingX + leftOffset) + 'px';
            enemy.style.top = (row * spacingY + topOffset) + 'px';
            
            enemy.dataset.row = row;
            
            const points = (4 - row) * 5;
            enemy.dataset.points = points;
            
            gameElements.gameCanvas.appendChild(enemy);
            
            gameState.enemies.push({
                element: enemy,
                row: row,
                col: col,
                points: points
            });
        }
    }
}

function startGameTimers() {
    gameState.timeRemaining = gameConfig.gameTime * 60;
    updateTimer();
    
    gameState.timer = setInterval(function() {
        gameState.timeRemaining--;
        updateTimer();
        
        if (gameState.timeRemaining <= 0) {
            endGame('time');
        }
    }, 1000);
    
// Enemy movement
let moveDirection = 'right';
let moveSpeed = 500;
gameState.enemyMoveTimer = setInterval(function() {
    const gameWidth = gameElements.gameCanvas.offsetWidth;
    
    let leftmost = 999999;
    let rightmost = 0;
    
    gameState.enemies.forEach(enemy => {
        const rect = enemy.element.getBoundingClientRect();
        const gameCanvasRect = gameElements.gameCanvas.getBoundingClientRect();
        const relativeLeft = rect.left - gameCanvasRect.left;
        
        if (relativeLeft < leftmost) leftmost = relativeLeft;
        if (relativeLeft + rect.width > rightmost) rightmost = relativeLeft + rect.width;
    });
    
    // Change direction if hitting wall
    if (moveDirection === 'right' && rightmost >= gameWidth - 5) {
        moveDirection = 'left';
    } else if (moveDirection === 'left' && leftmost <= 5) {
        moveDirection = 'right';
    }
    
    // Move all enemies
    gameState.enemies.forEach(enemy => {
        if (moveDirection === 'right') {
            enemy.element.style.left = (parseInt(enemy.element.style.left) + 10) + 'px';
        } else {
            enemy.element.style.left = (parseInt(enemy.element.style.left) - 10) + 'px';
        }
    });
}, moveSpeed);

// Enemy shooting
gameState.enemyShootTimer = setInterval(function() {
    if (gameState.enemies.length === 0) return;
    
    // Select random enemy to shoot
    const randomIndex = Math.floor(Math.random() * gameState.enemies.length);
    const shootingEnemy = gameState.enemies[randomIndex];
    
    // Check if can shoot (previous bullet passed 3/4 of screen)
    let canShoot = true;
    if (gameState.enemyBullets.length > 0) {
        const lastBullet = gameState.enemyBullets[gameState.enemyBullets.length - 1];
        const gameHeight = gameElements.gameCanvas.offsetHeight;
        const bulletRect = lastBullet.element.getBoundingClientRect();
        const gameCanvasRect = gameElements.gameCanvas.getBoundingClientRect();
        const relativeTop = bulletRect.top - gameCanvasRect.top;
        
        if (relativeTop < gameHeight * 0.75) {
            canShoot = false;
        }
    }
    
    if (canShoot) {
        createEnemyBullet(shootingEnemy);
    }
}, 1000);

// Speed up timer - every 5 seconds
gameState.speedUpTimer = setInterval(function() {
    if (gameState.speedIncreaseCount < 4) { // Only speed up 4 times max
        moveSpeed = Math.max(150, moveSpeed - 70);
        
        // Clear and restart enemy movement timer with new speed
        clearInterval(gameState.enemyMoveTimer);
        gameState.enemyMoveTimer = setInterval(function() {
            const gameWidth = gameElements.gameCanvas.offsetWidth;
            
            let leftmost = 999999;
            let rightmost = 0;
            
            gameState.enemies.forEach(enemy => {
                const rect = enemy.element.getBoundingClientRect();
                const gameCanvasRect = gameElements.gameCanvas.getBoundingClientRect();
                const relativeLeft = rect.left - gameCanvasRect.left;
                
                if (relativeLeft < leftmost) leftmost = relativeLeft;
                if (relativeLeft + rect.width > rightmost) rightmost = relativeLeft + rect.width;
            });
            
            // Change direction if hitting wall
            if (moveDirection === 'right' && rightmost >= gameWidth - 5) {
                moveDirection = 'left';
            } else if (moveDirection === 'left' && leftmost <= 5) {
                moveDirection = 'right';
            }
            
            // Move all enemies
            gameState.enemies.forEach(enemy => {
                if (moveDirection === 'right') {
                    enemy.element.style.left = (parseInt(enemy.element.style.left) + 10) + 'px';
                } else {
                    enemy.element.style.left = (parseInt(enemy.element.style.left) - 10) + 'px';
                }
            });
        }, moveSpeed);
        
        gameState.speedIncreaseCount++;
    }
}, 5000);

// Animation loop for bullets
function animationLoop() {
    // Move player bullets
    for (let i = gameState.playerBullets.length - 1; i >= 0; i--) {
        const bullet = gameState.playerBullets[i];
        const bulletElement = bullet.element;
        const currentTop = parseInt(bulletElement.style.top);
        
        bulletElement.style.top = (currentTop - 5) + 'px';
        
        // Check if bullet is out of bounds
        if (currentTop < -15) {
            gameElements.gameCanvas.removeChild(bulletElement);
            gameState.playerBullets.splice(i, 1);
            continue;
        }
        
        // Check for collisions with enemies
        checkBulletEnemyCollisions(bullet);
    }
    
    // Move enemy bullets
    for (let i = gameState.enemyBullets.length - 1; i >= 0; i--) {
        const bullet = gameState.enemyBullets[i];
        const bulletElement = bullet.element;
        const currentTop = parseInt(bulletElement.style.top);
        
        bulletElement.style.top = (currentTop + 5) + 'px';
        
        // Check if bullet is out of bounds
        if (currentTop > gameElements.gameCanvas.offsetHeight) {
            gameElements.gameCanvas.removeChild(bulletElement);
            gameState.enemyBullets.splice(i, 1);
            continue;
        }
        
        // Check for collision with player
        checkBulletPlayerCollision(bullet);
    }
    
    // Continue animation if game is running
    if (gameState.isRunning) {
        gameState.animationId = requestAnimationFrame(animationLoop);
    }
}

// Start animation loop
gameState.animationId = requestAnimationFrame(animationLoop);
}

// Move player ship
function movePlayerShip(direction) {
const playerShip = gameElements.playerShip;
const gameCanvas = gameElements.gameCanvas;
const playerRect = playerShip.getBoundingClientRect();
const gameCanvasRect = gameCanvas.getBoundingClientRect();

// Get current position
const currentLeft = parseInt(playerShip.style.left) || gameCanvas.offsetWidth / 2 - 25;
const currentBottom = parseInt(playerShip.style.bottom) || 20;

// Calculate maximum allowed movement area (40% of bottom screen)
const maxMoveHeight = gameCanvas.offsetHeight * 0.4;
const maxBottom = maxMoveHeight - playerRect.height;

// Calculate movement distances
const moveDistance = 15;

switch(direction) {
    case 'left':
        if (currentLeft > 0) {
            playerShip.style.left = (currentLeft - moveDistance) + 'px';
        }
        break;
    case 'right':
        if (currentLeft < gameCanvas.offsetWidth - playerRect.width) {
            playerShip.style.left = (currentLeft + moveDistance) + 'px';
        }
        break;
    case 'up':
        if (currentBottom < maxBottom) {
            playerShip.style.bottom = (currentBottom + moveDistance) + 'px';
        }
        break;
    case 'down':
        if (currentBottom > 10) {
            playerShip.style.bottom = (currentBottom - moveDistance) + 'px';
        }
        break;
}
}

// Player shooting
function shootPlayerBullet() {
const playerShip = gameElements.playerShip;
const playerRect = playerShip.getBoundingClientRect();
const gameCanvasRect = gameElements.gameCanvas.getBoundingClientRect();

// Create bullet
const bullet = document.createElement('div');
bullet.className = 'bullet';

bullet.style.width = '8px';
bullet.style.height = '20px';
bullet.style.backgroundColor = '#00FFFF';

bullet.style.left = (parseInt(playerShip.style.left) + playerRect.width / 2 - 4) + 'px';
bullet.style.bottom = (parseInt(playerShip.style.bottom) + playerRect.height) + 'px';
bullet.style.top = (gameCanvasRect.height - parseInt(bullet.style.bottom)) + 'px';
gameElements.gameCanvas.appendChild(bullet);

// Add to bullets array
gameState.playerBullets.push({
    element: bullet
});

// Play sound
const shootSound = new Audio('good_music.mp3');
shootSound.play();
}

// Enemy shooting
function createEnemyBullet(enemy) {
const enemyElement = enemy.element;
const enemyRect = enemyElement.getBoundingClientRect();
const gameCanvasRect = gameElements.gameCanvas.getBoundingClientRect();

// Create bullet
const bullet = document.createElement('div');
bullet.className = 'bullet enemy-bullet';

bullet.style.width = '8px';
bullet.style.height = '20px';
bullet.style.backgroundColor = '#FF0000';

// Calculate position
const relativeLeft = enemyRect.left - gameCanvasRect.left + enemyRect.width / 2 - 4;
const relativeTop = enemyRect.top - gameCanvasRect.top + enemyRect.height;

bullet.style.left = relativeLeft + 'px';
bullet.style.top = relativeTop + 'px';
gameElements.gameCanvas.appendChild(bullet);

// Add to enemy bullets array
gameState.enemyBullets.push({
    element: bullet
});
}

// Check for collisions between player bullets and enemies
function checkBulletEnemyCollisions(bullet) {
const bulletElement = bullet.element;
const bulletRect = bulletElement.getBoundingClientRect();

for (let i = gameState.enemies.length - 1; i >= 0; i--) {
    const enemy = gameState.enemies[i];
    const enemyElement = enemy.element;
    const enemyRect = enemyElement.getBoundingClientRect();
    
    // Check for collision
    if (
        bulletRect.left < enemyRect.right &&
        bulletRect.right > enemyRect.left &&
        bulletRect.top < enemyRect.bottom &&
        bulletRect.bottom > enemyRect.top
    ) {
        // Collision detected
        
        // Remove enemy
        gameElements.gameCanvas.removeChild(enemyElement);
        gameState.enemies.splice(i, 1);
        
        // Remove bullet
        gameElements.gameCanvas.removeChild(bulletElement);
        gameState.playerBullets.splice(gameState.playerBullets.indexOf(bullet), 1);
        
        // Add points
        gameState.score += enemy.points;
        $('#score').text(gameState.score);
        
        // Play sound
        const hitSound = new Audio('bad_music.mp4');
        hitSound.play();
        
        // Check if all enemies are destroyed
        if (gameState.enemies.length === 0) {
            endGame('win');
        }
        
        break; // Exit the loop since bullet is already removed
    }
}
}

// Check for collisions between enemy bullets and player
function checkBulletPlayerCollision(bullet) {
const bulletElement = bullet.element;
const bulletRect = bulletElement.getBoundingClientRect();
const playerRect = gameElements.playerShip.getBoundingClientRect();

// Check for collision
if (
    bulletRect.left < playerRect.right &&
    bulletRect.right > playerRect.left &&
    bulletRect.top < playerRect.bottom &&
    bulletRect.bottom > playerRect.top
) {
    // Collision detected
    
    // Remove bullet
    gameElements.gameCanvas.removeChild(bulletElement);
    gameState.enemyBullets.splice(gameState.enemyBullets.indexOf(bullet), 1);
    
    // Decrease lives
    gameState.lives--;
    $('#lives').text(gameState.lives);
    
    // Play sound
    $('#explosionSound')[0].play();
    
    // Check if game over
    if (gameState.lives <= 0) {
        endGame('lives');
    } else {
        // Reset player position
        resetPlayerPosition();
    }
}
}

// Reset player position after being hit
function resetPlayerPosition() {
const playerShip = gameElements.playerShip;
const gameCanvas = gameElements.gameCanvas;

// Move to random position at bottom
playerShip.style.left = (Math.random() * (gameCanvas.offsetWidth - 50)) + 'px';
playerShip.style.bottom = '20px';
}

// Update timer display
function updateTimer() {
const minutes = Math.floor(gameState.timeRemaining / 60);
const seconds = gameState.timeRemaining % 60;
$('#time').text(`${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
}

// End game
function endGame(reason) {
    // Stop game
    stopGame();

    // Set game over message
    let message = '';
    let isHighScore = false;

    switch(reason) {
        case 'win':
            message = '<span dir="ltr">Champion!</span>';
            isHighScore = true;
            break;
        case 'lives':
            message = '<span dir="ltr">You Lost!</span>';
            isHighScore = true;
            break;
        case 'time':
            if (gameState.score < 100) {
                message = '<span dir="ltr">You can do better!</span>';
            } else {
                message = '<span dir="ltr">Winner!</span>';
            }
            isHighScore = true;
            break;
    }

    // Update high scores if applicable
    if (isHighScore && currentUser) {
        if (!gameCounter[currentUser.username]) {
            gameCounter[currentUser.username] = 0;
        }
        gameCounter[currentUser.username]++;
        
        if (!highScores[currentUser.username]) {
            highScores[currentUser.username] = [];
        }
        
        const currentGameNumber = gameCounter[currentUser.username];
        highScores[currentUser.username].push({
            gameNumber: currentGameNumber,
            score: gameState.score
        });
        
        highScores[currentUser.username].sort((a, b) => b.score - a.score);
    }

    // Show game over screen
    $('#gameOverMessage').html(message);
    $('#finalScore span').text(gameState.score);

    // Populate high scores table
    const highScoresList = $('#highScoresList');
    highScoresList.empty();

    if (currentUser && highScores[currentUser.username]) {
        const latestGameNumber = gameCounter[currentUser.username];
        
        highScores[currentUser.username].forEach((scoreObj, index) => {
            const isLatestGame = (scoreObj.gameNumber === latestGameNumber);
            const rowClass = isLatestGame ? 'latest-game' : '';
            
            highScoresList.append(`
                <tr class="${rowClass}">
                    <td>${scoreObj.gameNumber}</td>
                    <td>${scoreObj.score}</td>
                </tr>
            `);
        });
    }

    showScreen('gameOverScreen');
}

// Stop all game processes
function stopGame() {
    gameState.isRunning = false;

    // Clear timers
    clearInterval(gameState.timer);
    clearInterval(gameState.enemyMoveTimer);
    clearInterval(gameState.enemyShootTimer);
    clearInterval(gameState.speedUpTimer);

    // Cancel animation frame
    if (gameState.animationId) {
        cancelAnimationFrame(gameState.animationId);
        gameState.animationId = null;
    }

    // Stop music
    $('#backgroundMusic')[0].pause();
    $('#backgroundMusic')[0].currentTime = 0;
}

// Reset game state
function resetGame() {
    stopGame();

    if (gameElements.gameCanvas) {
        gameElements.gameCanvas.innerHTML = '';
    }

    gameState.enemies = [];
    gameState.playerBullets = [];
    gameState.enemyBullets = [];

    gameState.score = 0;
    gameState.lives = 3;
    gameState.isRunning = false;
    gameState.timeRemaining = gameConfig.gameTime * 60;
    gameState.speedIncreaseCount = 0;
    gameState.gameOver = false;
    gameElements.playerShip = null;

    $('#score').text('0');
    $('#lives').text('3');
    updateTimer();
}