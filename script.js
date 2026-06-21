const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const scoreText = document.getElementById("score");
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
let lastMoveTime = 0;
let gameRunning = false;
let gamePaused = false;

document.addEventListener("keydown", changeDirection);
canvas.addEventListener("click", handleCanvasClick);

function changeDirection(event) {
  if (
    event.key === "ArrowUp" ||
    event.key === "ArrowDown" ||
    event.key === "ArrowLeft" ||
    event.key === "ArrowRight"
  ) {
    event.preventDefault();
  }

  if (!gameRunning) {
    return;
  }

  if (event.key === "ArrowUp" && direction !== "DOWN") {
    direction = "UP";
  } else if (event.key === "ArrowDown" && direction !== "UP") {
    direction = "DOWN";
  } else if (event.key === "ArrowLeft" && direction !== "RIGHT") {
    direction = "LEFT";
  } else if (event.key === "ArrowRight" && direction !== "LEFT") {
    direction = "RIGHT";
  }
}

function handleCanvasClick() {
  if (gameRunning || gamePaused) {
    return;
  }

  if (setupControls.style.display !== "none") {
    startGame();
    return;
  }

  restartGame();
}

function createFood() {
  let newFood;

  do {
    newFood = {
      x: Math.floor(Math.random() * 20) * box,
      y: Math.floor(Math.random() * 20) * box
    };
  } while (
    snake.some(part => part.x === newFood.x && part.y === newFood.y)
  );

  return newFood;
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
  ctx.fillText("Click Resume Game to continue", canvas.width / 2, 220);
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
}

function startGame() {
  resetGameData();

  gameSpeed = Number(difficultySelect.value);

  clearInterval(gameInterval);
  cancelAnimationFrame(animationFrameId);

  gameRunning = true;
  gamePaused = false;
  lastMoveTime = performance.now();

  showGameControls();

  gameInterval = setInterval(updateGame, gameSpeed);
  animationFrameId = requestAnimationFrame(drawGame);
}

function restartGame() {
  gameRunning = false;
  gamePaused = false;

  clearInterval(gameInterval);
  cancelAnimationFrame(animationFrameId);

  snake = [];
  previousSnake = [];
  food = null;
  direction = "RIGHT";
  score = 0;
  scoreText.textContent = score;

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

    pauseButton.textContent = "Resume Game";
    drawPauseScreen();
  } else {
    gamePaused = false;
    gameRunning = true;

    lastMoveTime = performance.now();

    pauseButton.textContent = "Pause Game";

    clearInterval(gameInterval);
    cancelAnimationFrame(animationFrameId);

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

  // Draw food
  ctx.fillStyle = "red";
  ctx.fillRect(food.x, food.y, box, box);

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
    drawWrappedRoundedRect(parts[0].x, parts[0].y, box, box, 6, "lime");
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

  // Draw the head on top
  drawWrappedRoundedRect(parts[0].x, parts[0].y, box, box, 7, "lime");
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

function gameOver() {
  gameRunning = false;
  gamePaused = false;

  clearInterval(gameInterval);
  cancelAnimationFrame(animationFrameId);

  pauseButton.textContent = "Pause Game";

  drawGameOverScreen();
}

drawStartScreen();
