const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const scoreText = document.getElementById("score");
const highScoreText = document.getElementById("highScore");
const timerText = document.getElementById("timer");
const difficultySelect = document.getElementById("difficulty");
const setupControls = document.getElementById("setupControls");
const restartButton = document.getElementById("restartButton");
const pauseButton = document.getElementById("pauseButton");

const box = 20;
let gameSpeed = 150;

let snake = [];
let previousSnake = [];
let food;
let direction = "RIGHT";
let score = 0;

let gameInterval;
let animationFrameId;
let timerInterval;
let elapsedSeconds = 0;

let lastMoveTime = 0;
let gameRunning = false;
let gamePaused = false;
let currentLevelName = "medium";

document.addEventListener("keydown", changeDirection);
canvas.addEventListener("click", handleCanvasClick);
difficultySelect.addEventListener("change", updateHighScoreDisplay);

function changeDirection(event) {
  if (
    event.key === "ArrowUp" ||
    event.key === "ArrowDown" ||
    event.key === "ArrowLeft" ||
    event.key === "ArrowRight"
  ) {
    event.preventDefault();
  }

  if (event.key === "ArrowUp") {
    setDirection("UP");
  } else if (event.key === "ArrowDown") {
    setDirection("DOWN");
  } else if (event.key === "ArrowLeft") {
    setDirection("LEFT");
  } else if (event.key === "ArrowRight") {
    setDirection("RIGHT");
  }
}

function setDirection(newDirection) {
  if (!gameRunning) {
    return;
  }

  if (newDirection === "UP" && direction !== "DOWN") {
    direction = "UP";
  } else if (newDirection === "DOWN" && direction !== "UP") {
    direction = "DOWN";
  } else if (newDirection === "LEFT" && direction !== "RIGHT") {
    direction = "LEFT";
  } else if (newDirection === "RIGHT" && direction !== "LEFT") {
    direction = "RIGHT";
  }
}

function handleCanvasClick() {
  if (gameRunning || gamePaused) {
    togglePauseGame();
    return;
  }

  if (setupControls.style.display !== "none") {
    startGame();
    return;
  }

  restartGame();
}

function getSelectedLevelName() {
  return difficultySelect.options[difficultySelect.selectedIndex].text.toLowerCase();
}

function getHighScoreKey() {
  return "snakeHighScore_" + currentLevelName;
}

function getHighScore() {
  return Number(localStorage.getItem(getHighScoreKey())) || 0;
}

function saveHighScore() {
  const currentHighScore = getHighScore();

  if (score > currentHighScore) {
    localStorage.setItem(getHighScoreKey(), score);
  }

  updateHighScoreDisplay();
}

function updateHighScoreDisplay() {
  currentLevelName = getSelectedLevelName();
  highScoreText.textContent = getHighScore();
}

function updateTimerDisplay() {
  const minutes = Math.floor(elapsedSeconds / 60);
  const seconds = elapsedSeconds % 60;

  const formattedMinutes = String(minutes).padStart(2, "0");
  const formattedSeconds = String(seconds).padStart(2, "0");

  timerText.textContent = formattedMinutes + ":" + formattedSeconds;
}

function startTimer() {
  clearInterval(timerInterval);

  timerInterval = setInterval(function () {
    elapsedSeconds++;
    updateTimerDisplay();
  }, 1000);
}

function stopTimer() {
  clearInterval(timerInterval);
}

function resetTimer() {
  elapsedSeconds = 0;
  updateTimerDisplay();
}

function createFood() {
  let newFood;

  do {
    newFood = {
      x: Math.floor(Math.random() * 20) * box,
      y: Math.floor(Math.random() * 20) * box,
      shape: getRandomFoodShape()
    };
  } while (
    snake.some(part => part.x === newFood.x && part.y === newFood.y)
  );

  return newFood;
}

function getRandomFoodShape() {
  const shapes = ["square", "circle", "triangle", "star"];
  const randomIndex = Math.floor(Math.random() * shapes.length);

  return shapes[randomIndex];
}

function showSetupControls() {
  setupControls.style.display = "block";
  restartButton.style.display = "none";
  pauseButton.style.display = "none";
}

function showGameControls() {
  setupControls.style.display = "none";
  restartButton.style.display = "inline-block";
  pauseButton.style.display = "inline-block";
  pauseButton.textContent = "Pause Game";
}

function showGameOverControls() {
  setupControls.style.display = "none";
  restartButton.style.display = "inline-block";
  pauseButton.style.display = "none";
  pauseButton.textContent = "Pause Game";
}

function drawStartScreen() {
  gameRunning = false;
  gamePaused = false;

  clearInterval(gameInterval);
  cancelAnimationFrame(animationFrameId);
  stopTimer();

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "#111";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "lime";
  ctx.font = "32px Arial";
  ctx.textAlign = "center";
  ctx.fillText("Snake Game", canvas.width / 2, 160);

  ctx.fillStyle = "white";
  ctx.font = "18px Arial";
  ctx.fillText("Click to Start the Game", canvas.width / 2, 210);

  updateHighScoreDisplay();
  showSetupControls();
}

function drawGameOverScreen() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "#111";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "red";
  ctx.font = "32px Arial";
  ctx.textAlign = "center";
  ctx.fillText("Game Over", canvas.width / 2, 160);

  ctx.fillStyle = "white";
  ctx.font = "18px Arial";
  ctx.fillText("Click screen or Restart Game", canvas.width / 2, 210);

  showGameOverControls();
}

function drawPauseScreen() {
  ctx.fillStyle = "rgba(0, 0, 0, 0.6)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "yellow";
  ctx.font = "32px Arial";
  ctx.textAlign = "center";
  ctx.fillText("Paused", canvas.width / 2, 180);

  ctx.fillStyle = "white";
  ctx.font = "18px Arial";
  ctx.fillText("Click to continue", canvas.width / 2, 220);
}

function resetGameData() {
  snake = [
    { x: 200, y: 200 }
  ];

  previousSnake = [
    { x: 200, y: 200 }
  ];

  food = createFood();
  direction = "RIGHT";
  score = 0;
  scoreText.textContent = score;

  resetTimer();
}

function startGame() {
  resetGameData();

  gameSpeed = Number(difficultySelect.value);
  currentLevelName = getSelectedLevelName();
  updateHighScoreDisplay();

  clearInterval(gameInterval);
  cancelAnimationFrame(animationFrameId);
  stopTimer();

  gameRunning = true;
  gamePaused = false;
  lastMoveTime = performance.now();

  showGameControls();
  startTimer();

  gameInterval = setInterval(updateGame, gameSpeed);
  animationFrameId = requestAnimationFrame(drawGame);
}

function restartGame() {
  gameRunning = false;
  gamePaused = false;

  clearInterval(gameInterval);
  cancelAnimationFrame(animationFrameId);
  stopTimer();

  snake = [];
  previousSnake = [];
  food = null;
  direction = "RIGHT";
  score = 0;
  scoreText.textContent = score;

  resetTimer();

  pauseButton.textContent = "Pause Game";

  drawStartScreen();
}

function togglePauseGame() {
  if (!gameRunning && !gamePaused) {
    return;
  }

  if (!gamePaused) {
    gamePaused = true;
    gameRunning = false;

    clearInterval(gameInterval);
    cancelAnimationFrame(animationFrameId);
    stopTimer();

    pauseButton.textContent = "Resume Game";
    drawPauseScreen();
  } else {
    gamePaused = false;
    gameRunning = true;

    lastMoveTime = performance.now();

    pauseButton.textContent = "Pause Game";

    clearInterval(gameInterval);
    cancelAnimationFrame(animationFrameId);

    startTimer();

    gameInterval = setInterval(updateGame, gameSpeed);
    animationFrameId = requestAnimationFrame(drawGame);
  }
}

function updateGame() {
  if (!gameRunning) {
    return;
  }

  previousSnake = snake.map(part => {
    return { x: part.x, y: part.y };
  });

  let headX = snake[0].x;
  let headY = snake[0].y;

  if (direction === "UP") {
    headY -= box;
  }

  if (direction === "DOWN") {
    headY += box;
  }

  if (direction === "LEFT") {
    headX -= box;
  }

  if (direction === "RIGHT") {
    headX += box;
  }

  if (headX < 0) {
    headX = canvas.width - box;
  } else if (headX >= canvas.width) {
    headX = 0;
  }

  if (headY < 0) {
    headY = canvas.height - box;
  } else if (headY >= canvas.height) {
    headY = 0;
  }

  const newHead = {
    x: headX,
    y: headY
  };

  const ateFood = headX === food.x && headY === food.y;

  if (!ateFood) {
    snake.pop();
  }

  for (let i = 0; i < snake.length; i++) {
    if (headX === snake[i].x && headY === snake[i].y) {
      gameOver();
      return;
    }
  }

  snake.unshift(newHead);

  if (ateFood) {
    score++;
    scoreText.textContent = score;

    if (score > getHighScore()) {
      localStorage.setItem(getHighScoreKey(), score);
      updateHighScoreDisplay();
    }

    food = createFood();
  }

  lastMoveTime = performance.now();
}

function drawGame(currentTime) {
  if (!gameRunning) {
    return;
  }

  const progress = Math.min((currentTime - lastMoveTime) / gameSpeed, 1);

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  drawFood();
  

  const smoothParts = [];

  for (let i = 0; i < snake.length; i++) {
    const currentPart = snake[i];
    const previousPart = previousSnake[i] || currentPart;

    const smoothX = getSmoothPosition(
      previousPart.x,
      currentPart.x,
      progress,
      canvas.width
    );

    const smoothY = getSmoothPosition(
      previousPart.y,
      currentPart.y,
      progress,
      canvas.height
    );

    smoothParts.push({
      x: smoothX,
      y: smoothY
    });
  }

  drawCurvedSnake(smoothParts);

  animationFrameId = requestAnimationFrame(drawGame);
}

function drawCurvedSnake(parts) {
  if (parts.length === 0) {
    return;
  }

  if (parts.length === 1) {
  drawSnakeHead(parts[0].x, parts[0].y, direction);
  return;
  }

  const centers = getContinuousCenters(parts);

  ctx.save();

  ctx.strokeStyle = "green";
  ctx.lineWidth = box;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  const offsetsX = [-canvas.width, 0, canvas.width];
  const offsetsY = [-canvas.height, 0, canvas.height];

  for (let offsetX of offsetsX) {
    for (let offsetY of offsetsY) {
      ctx.beginPath();
      ctx.moveTo(centers[0].x + offsetX, centers[0].y + offsetY);

      for (let i = 1; i < centers.length; i++) {
        ctx.lineTo(centers[i].x + offsetX, centers[i].y + offsetY);
      }

      ctx.stroke();
    }
  }

  ctx.restore();

  drawSnakeHead(parts[0].x, parts[0].y, direction);
}

function getContinuousCenters(parts) {
  const centers = [];

  for (let i = 0; i < parts.length; i++) {
    let x = parts[i].x + box / 2;
    let y = parts[i].y + box / 2;

    if (i > 0) {
      const previous = centers[i - 1];

      if (x - previous.x > canvas.width / 2) {
        x -= canvas.width;
      } else if (previous.x - x > canvas.width / 2) {
        x += canvas.width;
      }

      if (y - previous.y > canvas.height / 2) {
        y -= canvas.height;
      } else if (previous.y - y > canvas.height / 2) {
        y += canvas.height;
      }
    }

    centers.push({ x, y });
  }

  return centers;
}

function getSmoothPosition(start, end, progress, size) {
  let distance = end - start;

  if (Math.abs(distance) > size / 2) {
    if (distance > 0) {
      start += size;
    } else {
      end += size;
    }
  }

  let position = start + (end - start) * progress;

  if (position < 0) {
    position += size;
  }

  if (position >= size) {
    position -= size;
  }

  return position;
}

function drawWrappedRoundedRect(x, y, width, height, radius, color) {
  const offsetsX = [-canvas.width, 0, canvas.width];
  const offsetsY = [-canvas.height, 0, canvas.height];

  ctx.fillStyle = color;

  for (let offsetX of offsetsX) {
    for (let offsetY of offsetsY) {
      drawRoundedRect(
        x + offsetX,
        y + offsetY,
        width,
        height,
        radius
      );
    }
  }
}

function drawRoundedRect(x, y, width, height, radius) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
  ctx.fill();
}

function drawFood() {
  if (!food) {
    return;
  }

  if (food.shape === "square") {
    drawSquareFood();
  } else if (food.shape === "circle") {
    drawCircleFood();
  } else if (food.shape === "triangle") {
    drawTriangleFood();
  } else if (food.shape === "star") {
    drawStarFood();
  }
}

function drawSquareFood() {
  ctx.fillStyle = "red";
  ctx.fillRect(food.x, food.y, box, box);
}

function drawCircleFood() {
  ctx.fillStyle = "red";

  ctx.beginPath();
  ctx.arc(
    food.x + box / 2,
    food.y + box / 2,
    box / 2,
    0,
    Math.PI * 2
  );
  ctx.fill();
}

function drawTriangleFood() {
  ctx.fillStyle = "red";

  ctx.beginPath();
  ctx.moveTo(food.x + box / 2, food.y);
  ctx.lineTo(food.x, food.y + box);
  ctx.lineTo(food.x + box, food.y + box);
  ctx.closePath();
  ctx.fill();
}

function drawStarFood() {
  ctx.fillStyle = "red";

  const centerX = food.x + box / 2;
  const centerY = food.y + box / 2;
  const outerRadius = box / 2;
  const innerRadius = box / 4;
  const points = 5;

  ctx.beginPath();

  for (let i = 0; i < points * 2; i++) {
    const radius = i % 2 === 0 ? outerRadius : innerRadius;
    const angle = (Math.PI / points) * i - Math.PI / 2;

    const x = centerX + Math.cos(angle) * radius;
    const y = centerY + Math.sin(angle) * radius;

    if (i === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
  }

  ctx.closePath();
  ctx.fill();
}

function drawSnakeHead(x, y, facingDirection) {
  const centerX = x + box / 2;
  const centerY = y + box / 2;
  const radius = box / 2;

  const offsetsX = [-canvas.width, 0, canvas.width];
  const offsetsY = [-canvas.height, 0, canvas.height];

  for (let offsetX of offsetsX) {
    for (let offsetY of offsetsY) {
      drawSingleSnakeHead(
        centerX + offsetX,
        centerY + offsetY,
        radius,
        facingDirection
      );
    }
  }
}

function drawSingleSnakeHead(centerX, centerY, radius, facingDirection) {
  // Head
  ctx.fillStyle = "lime";
  ctx.beginPath();
  ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
  ctx.fill();

  // Eye settings
  const eyeRadius = radius * 0.2;
  let eye1X, eye1Y, eye2X, eye2Y;

  // Mouth settings
  let mouthStartX, mouthStartY, mouthEndX, mouthEndY;

  if (facingDirection === "UP") {
    eye1X = centerX - radius * 0.28;
    eye1Y = centerY - radius * 0.25;
    eye2X = centerX + radius * 0.28;
    eye2Y = centerY - radius * 0.25;

    mouthStartX = centerX - radius * 0.22;
    mouthStartY = centerY + radius * 0.15;
    mouthEndX = centerX + radius * 0.22;
    mouthEndY = centerY + radius * 0.15;
  } else if (facingDirection === "DOWN") {
    eye1X = centerX - radius * 0.28;
    eye1Y = centerY + radius * 0.05;
    eye2X = centerX + radius * 0.28;
    eye2Y = centerY + radius * 0.05;

    mouthStartX = centerX - radius * 0.22;
    mouthStartY = centerY - radius * 0.18;
    mouthEndX = centerX + radius * 0.22;
    mouthEndY = centerY - radius * 0.18;
  } else if (facingDirection === "LEFT") {
    eye1X = centerX - radius * 0.22;
    eye1Y = centerY - radius * 0.22;
    eye2X = centerX - radius * 0.22;
    eye2Y = centerY + radius * 0.22;

    mouthStartX = centerX + radius * 0.10;
    mouthStartY = centerY - radius * 0.18;
    mouthEndX = centerX + radius * 0.10;
    mouthEndY = centerY + radius * 0.18;
  } else {
    // RIGHT
    eye1X = centerX + radius * 0.22;
    eye1Y = centerY - radius * 0.22;
    eye2X = centerX + radius * 0.22;
    eye2Y = centerY + radius * 0.22;

    mouthStartX = centerX - radius * 0.10;
    mouthStartY = centerY - radius * 0.18;
    mouthEndX = centerX - radius * 0.10;
    mouthEndY = centerY + radius * 0.18;
  }

  // Eyes
  ctx.fillStyle = "black";

  ctx.beginPath();
  ctx.arc(eye1X, eye1Y, eyeRadius, 0, Math.PI * 2);
  ctx.fill();

  ctx.beginPath();
  ctx.arc(eye2X, eye2Y, eyeRadius, 0, Math.PI * 2);
  ctx.fill();

  // Mouth
  ctx.strokeStyle = "black";
  ctx.lineWidth = 3;
  ctx.lineCap = "round";

  ctx.beginPath();
  ctx.moveTo(mouthStartX, mouthStartY);
  ctx.lineTo(mouthEndX, mouthEndY);
  ctx.stroke();
}

function gameOver() {
  gameRunning = false;
  gamePaused = false;

  clearInterval(gameInterval);
  cancelAnimationFrame(animationFrameId);
  stopTimer();

  saveHighScore();

  pauseButton.textContent = "Pause Game";

  drawGameOverScreen();
}

updateHighScoreDisplay();
updateTimerDisplay();
drawStartScreen();
