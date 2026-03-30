const DIRECTIONS = {
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 },
};

const OPPOSITES = {
  up: "down",
  down: "up",
  left: "right",
  right: "left",
};

export const GRID_SIZE = 16;

export function createInitialState(gridSize = GRID_SIZE) {
  const snake = [
    { x: 7, y: 8 },
    { x: 6, y: 8 },
    { x: 5, y: 8 },
  ];
  const foodSeed = 0;

  return {
    gridSize,
    snake,
    direction: "right",
    queuedDirection: "right",
    foodSeed,
    food: placeFood(snake, gridSize, foodSeed),
    score: 0,
    status: "running",
  };
}

export function queueDirection(state, nextDirection) {
  if (!(nextDirection in DIRECTIONS)) {
    return state;
  }

  const currentDirection = state.queuedDirection ?? state.direction;
  if (OPPOSITES[currentDirection] === nextDirection) {
    return state;
  }

  return {
    ...state,
    queuedDirection: nextDirection,
  };
}

export function togglePause(state) {
  if (state.status === "game-over") {
    return state;
  }

  return {
    ...state,
    status: state.status === "paused" ? "running" : "paused",
  };
}

export function stepGame(state) {
  if (state.status !== "running") {
    return state;
  }

  const direction = state.queuedDirection ?? state.direction;
  const nextHead = movePoint(state.snake[0], DIRECTIONS[direction]);
  const ateFood = positionsEqual(nextHead, state.food);
  const collisionBody = ateFood ? state.snake : state.snake.slice(0, -1);

  if (
    isOutOfBounds(nextHead, state.gridSize) ||
    touchesSnake(nextHead, collisionBody)
  ) {
    return {
      ...state,
      direction,
      queuedDirection: direction,
      status: "game-over",
    };
  }

  const nextSnake = [nextHead, ...state.snake];

  if (!ateFood) {
    nextSnake.pop();
  }

  const nextFoodSeed = ateFood ? state.foodSeed + 1 : state.foodSeed;
  const nextFood = ateFood
    ? placeFood(nextSnake, state.gridSize, nextFoodSeed)
    : state.food;

  return {
    ...state,
    snake: nextSnake,
    direction,
    queuedDirection: direction,
    foodSeed: nextFoodSeed,
    food: nextFood,
    score: ateFood ? state.score + 1 : state.score,
  };
}

export function placeFood(snake, gridSize, seed = 0) {
  const occupied = new Set(snake.map(toKey));
  const totalCells = gridSize * gridSize;

  for (let offset = 0; offset < totalCells; offset += 1) {
    const index = (seed + offset) % totalCells;
    const position = {
      x: index % gridSize,
      y: Math.floor(index / gridSize),
    };

    if (!occupied.has(toKey(position))) {
      return position;
    }
  }

  return null;
}

export function positionsEqual(left, right) {
  return Boolean(left && right) && left.x === right.x && left.y === right.y;
}

function movePoint(point, vector) {
  return {
    x: point.x + vector.x,
    y: point.y + vector.y,
  };
}

function isOutOfBounds(point, gridSize) {
  return (
    point.x < 0 ||
    point.y < 0 ||
    point.x >= gridSize ||
    point.y >= gridSize
  );
}

function touchesSnake(point, snake) {
  return snake.some((segment) => positionsEqual(segment, point));
}

function toKey(point) {
  return `${point.x},${point.y}`;
}

export { DIRECTIONS };
