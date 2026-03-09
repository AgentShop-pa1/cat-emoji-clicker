// Игровые переменные
let gameState = {
    isPlaying: false,
    score: 0,
    level: 1,
    combo: 0,
    maxCombo: 0,
    catsClicked: 0,
    totalCats: 0,
    gameSpeed: 3000,
    catSpeed: 3,
    spawnRate: 1.0
};

// Элементы DOM
const elements = {
    startScreen: document.getElementById('startScreen'),
    gameOverScreen: document.getElementById('gameOverScreen'),
    startBtn: document.getElementById('startBtn'),
    restartBtn: document.getElementById('restartBtn'),
    gameZone: document.getElementById('gameZone'),
    scoreValue: document.getElementById('scoreValue'),
    levelValue: document.getElementById('levelValue'),
    comboDisplay: document.getElementById('comboDisplay'),
    comboValue: document.getElementById('comboValue'),
    finalScore: document.getElementById('finalScore'),
    particles: document.getElementById('particles')
};

// Массивы котов (разные эмоджи)
const catEmojis = ['🐱', '😸', '😹', '😺', '😻', '🙀', '😿', '😾'];

// Звуки (Web Audio API)
const audioContext = new (window.AudioContext || window.webkitAudioContext)();

// Создание звука клика
function createClickSound() {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(400, audioContext.currentTime + 0.1);
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.1);
}

// Создание звука уровня
function createLevelUpSound() {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.setValueAtTime(440, audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(880, audioContext.currentTime + 0.3);
    
    gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.3);
}

// Инициализация игры
function initGame() {
    resetGameState();
    updateUI();
    
    elements.startBtn.addEventListener('click', startGame);
    elements.restartBtn.addEventListener('click', restartGame);
    
    // Предотвращение скролла на мобильных
    document.addEventListener('touchmove', (e) => e.preventDefault(), { passive: false });
}

// Сброс состояния игры
function resetGameState() {
    gameState.isPlaying = false;
    gameState.score = 0;
    gameState.level = 1;
    gameState.combo = 0;
    gameState.maxCombo = 0;
    gameState.catsClicked = 0;
    gameState.totalCats = 0;
    gameState.gameSpeed = 3000;
    gameState.catSpeed = 3;
    gameState.spawnRate = 1.0;
    
    // Очистка игровой зоны
    elements.gameZone.innerHTML = '';
    elements.particles.innerHTML = '';
    
    // Скрытие комбо
    elements.comboDisplay.classList.remove('active');
}

// Обновление UI
function updateUI() {
    elements.scoreValue.textContent = gameState.score.toLocaleString();
    elements.levelValue.textContent = gameState.level;
    elements.comboValue.textContent = Math.max(1, gameState.combo);
    elements.finalScore.textContent = gameState.score.toLocaleString();
}

// Начало игры
function startGame() {
    gameState.isPlaying = true;
    elements.startScreen.classList.add('hidden');
    
    // Разрешение звука на мобильных
    if (audioContext.state === 'suspended') {
        audioContext.resume();
    }
    
    // Запуск спавна котов
    setTimeout(spawnCat, 1000);
    
    // Запуск увеличения сложности
    setInterval(() => {
        if (gameState.isPlaying) {
            increaseDifficulty();
        }
    }, 15000);
}

// Перезапуск игры
function restartGame() {
    elements.gameOverScreen.classList.remove('show');
    resetGameState();
    updateUI();
    startGame();
}

// Создание падающего кота
function spawnCat() {
    if (!gameState.isPlaying) return;
    
    const cat = document.createElement('div');
    cat.className = 'falling-cat';
    cat.textContent = catEmojis[Math.floor(Math.random() * catEmojis.length)];
    
    // Случайная позиция по горизонтали
    const x = Math.random() * (window.innerWidth - 60);
    cat.style.left = x + 'px';
    cat.style.top = '-60px';
    
    // Случайная скорость падения
    const fallDuration = gameState.catSpeed + Math.random() * 2;
    cat.style.animationDuration = fallDuration + 's';
    
    // Добавление в игровую зону
    elements.gameZone.appendChild(cat);
    gameState.totalCats++;
    
    // Обработчик клика
    cat.addEventListener('click', () => clickCat(cat, x));
    cat.addEventListener('touchstart', (e) => {
        e.preventDefault();
        clickCat(cat, x);
    });
    
    // Удаление кота после падения
    setTimeout(() => {
        if (cat.parentNode) {
            cat.remove();
            // Сброс комбо если кот упал
            if (gameState.combo > 0) {
                gameState.combo = 0;
                elements.comboDisplay.classList.remove('active');
            }
        }
    }, fallDuration * 1000 + 100);
    
    // Планирование следующего кота
    const nextSpawn = gameState.gameSpeed / gameState.spawnRate + Math.random() * 500;
    setTimeout(spawnCat, nextSpawn);
}

// Клик по коту
function clickCat(cat, x) {
    if (cat.classList.contains('clicked')) return;
    
    cat.classList.add('clicked');
    gameState.catsClicked++;
    gameState.combo++;
    
    // Подсчёт очков с учётом комбо
    const baseScore = 10;
    const comboMultiplier = Math.max(1, gameState.combo);
    const points = baseScore * comboMultiplier;
    gameState.score += points;
    
    // Обновление максимального комбо
    if (gameState.combo > gameState.maxCombo) {
        gameState.maxCombo = gameState.combo;
    }
    
    // Показ очков
    showScorePopup(x, cat.offsetTop, points);
    
    // Показ комбо
    if (gameState.combo > 1) {
        elements.comboDisplay.classList.add('active');
    }
    
    // Эффекты
    createClickSound();
    createParticles(x + 30, cat.offsetTop + 30);
    
    // Проверка уровня
    checkLevelUp();
    
    // Обновление UI
    updateUI();
    
    // Удаление кота
    setTimeout(() => cat.remove(), 400);
}

// Показ всплывающих очков
function showScorePopup(x, y, points) {
    const popup = document.createElement('div');
    popup.className = 'score-popup';
    popup.textContent = `+${points}`;
    popup.style.left = x + 'px';
    popup.style.top = y + 'px';
    
    elements.gameZone.appendChild(popup);
    
    setTimeout(() => popup.remove(), 1000);
}

// Создание партиклов
function createParticles(x, y) {
    for (let i = 0; i < 8; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        
        const angle = (i / 8) * Math.PI * 2;
        const velocity = 50 + Math.random() * 50;
        const endX = x + Math.cos(angle) * velocity;
        const endY = y + Math.sin(angle) * velocity;
        
        particle.style.left = x + 'px';
        particle.style.top = y + 'px';
        particle.style.setProperty('--endX', endX + 'px');
        particle.style.setProperty('--endY', endY + 'px');
        
        // Анимация партикла
        particle.style.animation = 'none';
        particle.style.transform = `translate(${endX - x}px, ${endY - y}px)`;
        particle.style.opacity = '0';
        
        elements.particles.appendChild(particle);
        
        setTimeout(() => particle.remove(), 800);
    }
}

// Проверка повышения уровня
function checkLevelUp() {
    const requiredScore = gameState.level * 500;
    
    if (gameState.score >= requiredScore) {
        gameState.level++;
        createLevelUpSound();
        
        // Эффект повышения уровня
        elements.levelValue.style.animation = 'none';
        setTimeout(() => {
            elements.levelValue.style.animation = 'comboPulse 0.6s ease-in-out';
        }, 10);
    }
}

// Увеличение сложности
function increaseDifficulty() {
    if (gameState.gameSpeed > 800) {
        gameState.gameSpeed -= 100;
    }
    if (gameState.catSpeed > 1.5) {
        gameState.catSpeed -= 0.1;
    }
    if (gameState.spawnRate < 2.0) {
        gameState.spawnRate += 0.1;
    }
}

// Окончание игры
function endGame() {
    gameState.isPlaying = false;
    elements.gameOverScreen.classList.add('show');
    
    // Очистка игровой зоны
    setTimeout(() => {
        elements.gameZone.innerHTML = '';
    }, 1000);
}

// Проверка на окончание игры (если долго не кликали)
let lastClickTime = Date.now();
setInterval(() => {
    if (gameState.isPlaying && Date.now() - lastClickTime > 10000) {
        // Если не кликали 10 секунд и есть коты на экране
        const cats = elements.gameZone.querySelectorAll('.falling-cat');
        if (cats.length > 5) {
            endGame();
        }
    }
}, 1000);

// Обновление времени последнего клика
document.addEventListener('click', () => {
    if (gameState.isPlaying) {
        lastClickTime = Date.now();
    }
});

document.addEventListener('touchstart', () => {
    if (gameState.isPlaying) {
        lastClickTime = Date.now();
    }
});

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', initGame);

// Предотвращение контекстного меню
document.addEventListener('contextmenu', (e) => e.preventDefault());

// Обработка изменения размера экрана
window.addEventListener('resize', () => {
    // Удаление котов за пределами экрана
    const cats = elements.gameZone.querySelectorAll('.falling-cat');
    cats.forEach(cat => {
        if (cat.offsetLeft > window.innerWidth) {
            cat.remove();
        }
    });
});

// Предотвращение выделения текста
document.addEventListener('selectstart', (e) => e.preventDefault());

// Оптимизация производительности
let animationFrame;
function optimizePerformance() {
    const cats = elements.gameZone.querySelectorAll('.falling-cat');
    const particles = elements.particles.querySelectorAll('.particle');
    
    // Ограничение количества элементов
    if (cats.length > 15) {
        cats[0].remove();
    }
    
    if (particles.length > 20) {
        particles[0].remove();
    }
}

setInterval(optimizePerformance, 1000);