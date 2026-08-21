const STORAGE_KEY = "oliverius.wheel";
const DEFAULT_NAMES = ["Olivia", "Noah", "Amelia", "Leo", "Mia", "Arthur"];
const COLOURS = ["#ef6a4c", "#f2b84b", "#48a692", "#557bb5", "#9b6bb5", "#e7859a", "#75a957", "#e89145"];

const canvas = document.querySelector("#wheel");
const context = canvas.getContext("2d");
const spinButton = document.querySelector("#spin-button");
const namesList = document.querySelector("#names-list");
const nameCount = document.querySelector("#name-count");
const addForm = document.querySelector("#add-form");
const newNameInput = document.querySelector("#new-name");
const result = document.querySelector("#result");
const resultName = document.querySelector("#result-name");
const resultLabel = result.querySelector(".result-label");

let names = loadNames();
let rotation = 0;
let spinning = false;

function loadNames() {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (Array.isArray(stored)) return stored.filter((name) => typeof name === "string").map((name) => name.trim()).filter(Boolean);
  } catch (error) {
    console.warn("The saved wheel could not be read.", error);
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_NAMES));
  return [...DEFAULT_NAMES];
}

function saveNames() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(names));
}

function fitText(text, maxWidth, initialSize) {
  let size = initialSize;
  do {
    context.font = `700 ${size}px "DM Sans", sans-serif`;
    if (context.measureText(text).width <= maxWidth) return size;
    size -= 1;
  } while (size > 10);
  return size;
}

function drawWheel() {
  const bounds = canvas.getBoundingClientRect();
  const cssSize = Math.max(280, Math.round(bounds.width));
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = cssSize * dpr;
  canvas.height = cssSize * dpr;
  context.setTransform(dpr, 0, 0, dpr, 0, 0);

  const center = cssSize / 2;
  const radius = center - 6;
  const count = Math.max(names.length, 1);
  const arc = (Math.PI * 2) / count;

  context.clearRect(0, 0, cssSize, cssSize);
  for (let index = 0; index < count; index += 1) {
    const start = -Math.PI / 2 - arc / 2 + index * arc;
    context.beginPath();
    context.moveTo(center, center);
    context.arc(center, center, radius, start, start + arc);
    context.closePath();
    context.fillStyle = names.length ? COLOURS[index % COLOURS.length] : "#d9d2c8";
    context.fill();
    context.strokeStyle = "rgba(255,255,255,.72)";
    context.lineWidth = 3;
    context.stroke();

    if (!names.length) continue;
    const angle = start + arc / 2;
    const availableWidth = Math.min(radius * 0.46, 150);
    context.save();
    context.translate(center, center);
    context.rotate(angle);
    context.textAlign = "right";
    context.textBaseline = "middle";
    context.fillStyle = "#fff";
    context.shadowColor = "rgba(0,0,0,.16)";
    context.shadowBlur = 2;
    fitText(names[index], availableWidth, Math.min(18, 240 / count + 10));
    let label = names[index];
    while (context.measureText(label).width > availableWidth && label.length > 2) label = `${label.slice(0, -2)}…`;
    context.fillText(label, radius * 0.84, 0);
    context.restore();
  }

  context.beginPath();
  context.arc(center, center, radius, 0, Math.PI * 2);
  context.lineWidth = 7;
  context.strokeStyle = "#fff";
  context.stroke();
}

function renderEditor() {
  namesList.replaceChildren();
  nameCount.textContent = `${names.length} ${names.length === 1 ? "name" : "names"}`;

  if (!names.length) {
    const empty = document.createElement("p");
    empty.className = "empty-message";
    empty.textContent = "Your wheel is empty. Add a name to get started.";
    namesList.append(empty);
  }

  names.forEach((name, index) => {
    const row = document.createElement("div");
    row.className = "name-row";

    const dot = document.createElement("span");
    dot.className = "colour-dot";
    dot.style.backgroundColor = COLOURS[index % COLOURS.length];

    const input = document.createElement("input");
    input.value = name;
    input.maxLength = 60;
    input.setAttribute("aria-label", `Edit ${name}`);
    input.addEventListener("change", () => {
      const value = input.value.trim();
      if (!value) {
        input.value = names[index];
        return;
      }
      names[index] = value;
      saveNames();
      renderEditor();
      drawWheel();
    });

    const remove = document.createElement("button");
    remove.type = "button";
    remove.className = "remove-button";
    remove.innerHTML = "&times;";
    remove.setAttribute("aria-label", `Remove ${name}`);
    remove.addEventListener("click", () => {
      names.splice(index, 1);
      saveNames();
      renderEditor();
      drawWheel();
    });

    row.append(dot, input, remove);
    namesList.append(row);
  });

  spinButton.disabled = names.length === 0 || spinning;
}

function randomIndex(max) {
  if (window.crypto?.getRandomValues) {
    const range = 0x100000000;
    const limit = range - (range % max);
    const value = new Uint32Array(1);
    do window.crypto.getRandomValues(value); while (value[0] >= limit);
    return value[0] % max;
  }
  return Math.floor(Math.random() * max);
}

function spin() {
  if (spinning || names.length === 0) return;
  spinning = true;
  spinButton.disabled = true;
  result.classList.remove("winner");
  resultLabel.textContent = "Round and round…";
  resultName.textContent = "Good luck!";

  const winnerIndex = randomIndex(names.length);
  const slice = 360 / names.length;
  const target = -winnerIndex * slice;
  const currentNormalized = ((rotation % 360) + 360) % 360;
  const targetNormalized = ((target % 360) + 360) % 360;
  const forwardDistance = (targetNormalized - currentNormalized + 360) % 360;
  rotation += 5 * 360 + forwardDistance;

  canvas.style.transition = "transform 4.8s cubic-bezier(.12,.68,.16,1)";
  canvas.style.transform = `rotate(${rotation}deg)`;

  const finish = () => {
    spinning = false;
    spinButton.disabled = false;
    resultLabel.textContent = "The wheel chose";
    resultName.textContent = names[winnerIndex];
    result.classList.add("winner");
  };
  canvas.addEventListener("transitionend", finish, { once: true });
}

addForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const name = newNameInput.value.trim();
  if (!name) return;
  names.push(name);
  newNameInput.value = "";
  saveNames();
  renderEditor();
  drawWheel();
  newNameInput.focus();
});

spinButton.addEventListener("click", spin);
new ResizeObserver(drawWheel).observe(canvas);
renderEditor();
drawWheel();
