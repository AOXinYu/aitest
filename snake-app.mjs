import {
  createInitialState,
  GRID_SIZE,
  isTerminalStatus,
  positionsEqual,
  queueDirection,
  stepGame,
  togglePause,
} from "./snake-core.mjs";

const TICK_MS = 140;

const board = document.querySelector("#board");
const scoreValue = document.querySelector("#score");
const statusValue = document.querySelector("#game-status");
const pauseButton = document.querySelector("#pause-button");
const restartButton = document.querySelector("#restart-button");
const controlButtons = document.querySelectorAll("[data-direction]");
const statusHint = document.querySelector("#status-hint");

let state = createInitialState(GRID_SIZE);

buildBoard();
render();

const timer = window.setInterval(() => {
  state = stepGame(state);
  render();
}, TICK_MS);

window.addEventListener("keydown", (event) => {
  const nextDirection = getDirectionForKey(event.key);

  if (nextDirection) {
    event.preventDefault();
    state = queueDirection(state, nextDirection);
    return;
  }

  if (event.code === "Space") {
    event.preventDefault();
    state = togglePause(state);
    render();
  }
});

pauseButton.addEventListener("click", () => {
  state = togglePause(state);
  render();
});

restartButton.addEventListener("click", () => {
  state = createInitialState(GRID_SIZE);
  render();
});

for (const button of controlButtons) {
  button.addEventListener("click", () => {
    state = queueDirection(state, button.dataset.direction);
  });
}

window.addEventListener("beforeunload", () => {
  window.clearInterval(timer);
});

function buildBoard() {
  const cellCount = state.gridSize * state.gridSize;
  const fragment = document.createDocumentFragment();

  board.style.setProperty("--grid-size", String(state.gridSize));

  for (let index = 0; index < cellCount; index += 1) {
    const cell = document.createElement("div");
    cell.className = "cell";
    cell.dataset.index = String(index);
    cell.setAttribute("role", "gridcell");
    fragment.appendChild(cell);
  }

  board.replaceChildren(fragment);
}

function render() {
  const cells = board.children;

  for (const cell of cells) {
    cell.className = "cell";
  }

  state.snake.forEach((segment, index) => {
    const cell = getCell(segment);
    if (!cell) {
      return;
    }

    cell.classList.add("snake");
    if (index === 0) {
      cell.classList.add("head");
    }
  });

  if (state.food) {
    const foodCell = getCell(state.food);
    if (foodCell && !positionsEqual(state.food, state.snake[0])) {
      foodCell.classList.add("food");
    }
  }

  scoreValue.textContent = String(state.score);
  statusValue.textContent = formatStatus(state.status);
  pauseButton.textContent = state.status === "paused" ? "Resume" : "Pause";
  pauseButton.disabled = isTerminalStatus(state.status);
  board.setAttribute("aria-label", getBoardLabel());
  board.dataset.state = state.status;
  updateControlState();
  updateStatusHint();
}

function getCell(position) {
  const index = position.y * state.gridSize + position.x;
  return board.children[index] ?? null;
}

function getDirectionForKey(key) {
  switch (key) {
    case "ArrowUp":
    case "w":
    case "W":
      return "up";
    case "ArrowDown":
    case "s":
    case "S":
      return "down";
    case "ArrowLeft":
    case "a":
    case "A":
      return "left";
    case "ArrowRight":
    case "d":
    case "D":
      return "right";
    default:
      return null;
  }
}

function formatStatus(status) {
  switch (status) {
    case "paused":
      return "Paused";
    case "game-over":
      return "Game Over";
    case "won":
      return "You Win";
    default:
      return "Running";
  }
}

function getBoardLabel() {
  return `Snake game board. Score ${state.score}. ${formatStatus(state.status)}.`;
}

function updateControlState() {
  const disabled = isTerminalStatus(state.status);

  for (const button of controlButtons) {
    button.disabled = disabled;
  }
}

function updateStatusHint() {
  if (!statusHint) {
    return;
  }

  switch (state.status) {
    case "paused":
      statusHint.textContent = "Game paused. Press Space or Resume to continue.";
      return;
    case "game-over":
      statusHint.textContent = "Game over. Press Restart to play again.";
      return;
    case "won":
      statusHint.textContent = "Board cleared. You win! Press Restart for a new round.";
      return;
    default:
      statusHint.textContent = "Use arrow keys or WASD to steer. Press Space to pause.";
  }
}
