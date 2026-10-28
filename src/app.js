const STORAGE_KEY = "oliverius.wheel";
const DISABLED_KEY = `${STORAGE_KEY}.disabled`;
const SPEECH_KEY = `${STORAGE_KEY}.speech`;
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
const speechToggle = document.querySelector("#speak-names");
const speechAvailable = "speechSynthesis" in window && "SpeechSynthesisUtterance" in window;
speechToggle.checked = localStorage.getItem(SPEECH_KEY) === "true";
speechToggle.closest("label").hidden = !speechAvailable;
speechToggle.addEventListener("change", () => {
  localStorage.setItem(SPEECH_KEY, String(speechToggle.checked));
});

function loadDisabledIndices(nameCount) {
  try {
    const stored = JSON.parse(localStorage.getItem(DISABLED_KEY));
    if (Array.isArray(stored)) {
      return new Set(stored.filter((index) => Number.isInteger(index) && index >= 0 && index < nameCount));
    }
  } catch (error) {
    console.warn("The saved participant visibility could not be read.", error);
  }
  return new Set();
}

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
  allVisibleButton: document.querySelector("#all-visible"),
  form: document.querySelector("#add-form"),
  input: document.querySelector("#new-name"),
  onChange: updateNames,
  onParticipationChange: () => {
    localStorage.setItem(DISABLED_KEY, JSON.stringify([...editor.getDisabledIndices()]));
    refreshWheel();
  }
});

wheel.addEventListener("participantremoved", (event) => {
  editor.disableParticipant(event.detail.index);
});

wheel.addEventListener("winner", (event) => {
  editor.resetRound();
  wheel.showRoundWinner(event.detail.name);
  fanfareSound.currentTime = 0;
  const speakWinner = () => speakName(event.detail.name);
  fanfareSound.addEventListener("ended", speakWinner, { once: true });
  fanfareSound.play().catch(() => {
    fanfareSound.removeEventListener("ended", speakWinner);
    speakWinner();
  });
});

wheel.addEventListener("segmentchange", () => {
  boundarySound.currentTime = 0;
  boundarySound.play().catch(() => {});
});

wheel.addEventListener("selection", (event) => {
  speakName(event.detail.name);
});

function speakName(name) {
  if (!speechAvailable || !speechToggle.checked) {
    return;
  }
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(new SpeechSynthesisUtterance(name));
}

function updateNames(updatedNames, disabledIndices = editor.getDisabledIndices()) {
  names = updatedNames;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(names));
  editor.setNames(names, disabledIndices);
  localStorage.setItem(DISABLED_KEY, JSON.stringify([...editor.getDisabledIndices()]));
  refreshWheel();
}

function refreshWheel() {
  wheel.setParticipants(editor.getActiveParticipants());
}

editor.setNames(names, loadDisabledIndices(names.length));
refreshWheel();
