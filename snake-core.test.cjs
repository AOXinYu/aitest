const test = require("node:test");
const assert = require("node:assert/strict");
const path = require("node:path");
const { pathToFileURL } = require("node:url");

const moduleUrl = pathToFileURL(
  path.join(__dirname, "snake-core.mjs"),
).href;

async function loadSnakeCore() {
  return import(moduleUrl);
}

test("snake moves one cell in its active direction", async () => {
  const { stepGame } = await loadSnakeCore();
  const state = {
    gridSize: 6,
    snake: [
      { x: 2, y: 2 },
      { x: 1, y: 2 },
      { x: 0, y: 2 },
    ],
    direction: "right",
    queuedDirection: "right",
    foodSeed: 0,
    food: { x: 5, y: 5 },
    score: 0,
    status: "running",
  };

  const nextState = stepGame(state);

  assert.deepEqual(nextState.snake, [
    { x: 3, y: 2 },
    { x: 2, y: 2 },
    { x: 1, y: 2 },
  ]);
  assert.equal(nextState.score, 0);
  assert.equal(nextState.status, "running");
});

test("snake grows and increments score when it eats food", async () => {
  const { stepGame } = await loadSnakeCore();
  const state = {
    gridSize: 6,
    snake: [
      { x: 2, y: 2 },
      { x: 1, y: 2 },
      { x: 0, y: 2 },
    ],
    direction: "right",
    queuedDirection: "right",
    foodSeed: 0,
    food: { x: 3, y: 2 },
    score: 0,
    status: "running",
  };

  const nextState = stepGame(state);

  assert.deepEqual(nextState.snake, [
    { x: 3, y: 2 },
    { x: 2, y: 2 },
    { x: 1, y: 2 },
    { x: 0, y: 2 },
  ]);
  assert.equal(nextState.score, 1);
  assert.notDeepEqual(nextState.food, state.food);
});

test("snake ends the game when it hits a wall", async () => {
  const { stepGame } = await loadSnakeCore();
  const state = {
    gridSize: 4,
    snake: [
      { x: 3, y: 1 },
      { x: 2, y: 1 },
      { x: 1, y: 1 },
    ],
    direction: "right",
    queuedDirection: "right",
    foodSeed: 0,
    food: { x: 0, y: 0 },
    score: 0,
    status: "running",
  };

  const nextState = stepGame(state);

  assert.equal(nextState.status, "game-over");
});

test("food placement skips occupied cells deterministically", async () => {
  const { placeFood } = await loadSnakeCore();
  const snake = [
    { x: 0, y: 0 },
    { x: 1, y: 0 },
    { x: 2, y: 0 },
  ];

  assert.deepEqual(placeFood(snake, 4, 0), { x: 3, y: 0 });
  assert.deepEqual(placeFood(snake, 4, 5), { x: 1, y: 1 });
});

test("moving into the vacated tail cell is allowed", async () => {
  const { stepGame } = await loadSnakeCore();
  const state = {
    gridSize: 5,
    snake: [
      { x: 2, y: 2 },
      { x: 2, y: 1 },
      { x: 1, y: 1 },
      { x: 1, y: 2 },
    ],
    direction: "left",
    queuedDirection: "left",
    foodSeed: 0,
    food: { x: 4, y: 4 },
    score: 0,
    status: "running",
  };

  const nextState = stepGame(state);

  assert.equal(nextState.status, "running");
  assert.deepEqual(nextState.snake, [
    { x: 1, y: 2 },
    { x: 2, y: 2 },
    { x: 2, y: 1 },
    { x: 1, y: 1 },
  ]);
});

test("clearing the final open cell marks the game as won", async () => {
  const { stepGame } = await loadSnakeCore();
  const state = {
    gridSize: 4,
    snake: [
      { x: 2, y: 3 },
      { x: 1, y: 3 },
      { x: 0, y: 3 },
      { x: 0, y: 2 },
      { x: 1, y: 2 },
      { x: 2, y: 2 },
      { x: 3, y: 2 },
      { x: 3, y: 1 },
      { x: 2, y: 1 },
      { x: 1, y: 1 },
      { x: 0, y: 1 },
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      { x: 2, y: 0 },
      { x: 3, y: 0 },
    ],
    direction: "right",
    queuedDirection: "right",
    foodSeed: 0,
    food: { x: 3, y: 3 },
    score: 12,
    status: "running",
  };

  const nextState = stepGame(state);

  assert.equal(nextState.status, "won");
  assert.equal(nextState.food, null);
  assert.equal(nextState.score, 13);
  assert.equal(nextState.snake.length, 16);
});
