const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const scoreText = document.getElementById("score");

const box = 20;

let snake = [
  { x: 200, y: 200 }
];

let food = {
  x: Math.floor(Math.random() * 20) * box,
  y: Math.floor(Math.random() * 20) * box
};

let direction = "RIGHT";
let score = 0;
let gameInterval;

document.addEventListener("keydown", changeDirection);

function changeDirection(event) {
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

function drawGame() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw snake
  for (let i = 0; i < snake.length; i++) {
    ctx.fillStyle = i === 0 ? "lime" : "green";
    ctx.fillRect(snake[i].x, snake[i].y, box, box);
  }

  // Draw food
  ctx.fillStyle = "red";
  ctx.fillRect(food.x, food.y, box, box);

  let headX = snake[0].x;
  let headY = snake[0].y;

  if (direction === "UP") headY -= box;
  if (direction === "DOWN") headY += box;
  if (direction === "LEFT") headX -= box;
  if (direction === "RIGHT") headX += box;

  // Check if snake eats food
  if (headX === food.x && headY === food.y) {
    score++;
    scoreText.textContent = score;

    food = {
      x: Math.floor(Math.random() * 20) * box,
      y: Math.floor(Math.random() * 20) * box
    };
  } else {
    snake.pop();
  }

  const newHead = {
    x: headX,
    y: headY
  };

  // Check wall collision
  if (
    headX < 0 ||
    headY < 0 ||
    headX >= canvas.width ||
    headY >= canvas.height
  ) {
    gameOver();
    return;
  }

  // Check self collision
  for (let i = 0; i < snake.length; i++) {
    if (headX === snake[i].x && headY === snake[i].y) {
      gameOver();
      return;
    }
  }

  snake.unshift(newHead);
}

function gameOver() {
  clearInterval(gameInterval);
  alert("Game Over! Your score is " + score);
}

function restartGame() {
  snake = [
    { x: 200, y: 200 }
  ];

  food = {
    x: Math.floor(Math.random() * 20) * box,
    y: Math.floor(Math.random() * 20) * box
  };

  direction = "RIGHT";
  score = 0;
  scoreText.textContent = score;

  clearInterval(gameInterval);
  gameInterval = setInterval(drawGame, 150);
}

gameInterval = setInterval(drawGame, 150);