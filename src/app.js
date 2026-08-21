const STORAGE_KEY = "oliverius.wheel";
const DEFAULT_NAMES = ["Alice", "Bob", "Charlie", "Diana", "Eve", "Frank"];
const boundarySound = new Audio("media/audio/ball.mp3");
boundarySound.preload = "auto";
boundarySound.volume = 0.5;
const fanfareSound = new Audio("media/audio/fanfare.mp3");
fanfareSound.preload = "auto";
fanfareSound.volume = 0.5;

function loadNames() {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (Array.isArray(stored)) {
      return stored.filter((name) => typeof name === "string").map((name) => name.trim()).filter(Boolean);
    }
  } catch (error) {
    console.warn("The saved wheel could not be read.", error);
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_NAMES));
  return [...DEFAULT_NAMES];
}

let names = loadNames();

const wheel = new Wheel({
  container: document.querySelector("#wheel-wrap"),
  result: document.querySelector("#result"),
  resultName: document.querySelector("#result-name"),
  resultLabel: document.querySelector("#result .result-label"),
  removeButton: document.querySelector("#remove-winner")
});

const editor = new Editor({
  namesList: document.querySelector("#names-list"),
  nameCount: document.querySelector("#name-count"),
  form: document.querySelector("#add-form"),
  input: document.querySelector("#new-name"),
  onChange: updateNames,
  onParticipationChange: refreshWheel
});

wheel.addEventListener("participantremoved", (event) => {
  editor.disableParticipant(event.detail.index);
});

wheel.addEventListener("winner", (event) => {
  editor.resetRound();
  wheel.showRoundWinner(event.detail.name);
  fanfareSound.currentTime = 0;
  fanfareSound.play().catch(() => {});
});

wheel.addEventListener("segmentchange", () => {
  boundarySound.currentTime = 0;
  boundarySound.play().catch(() => {});
});

function updateNames(updatedNames) {
  names = updatedNames;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(names));
  editor.setNames(names);
  refreshWheel();
}

function refreshWheel() {
  wheel.setParticipants(editor.getActiveParticipants());
}

editor.setNames(names);
refreshWheel();
