const STORAGE_KEY = "oliverius.wheel";
const DEFAULT_NAMES = ["Alice", "Bob", "Charlie", "Diana", "Eve", "Frank"];

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
let disabledIndices = new Set();

const wheel = new Wheel({
  container: document.querySelector("#wheel-wrap"),
  result: document.querySelector("#result"),
  resultName: document.querySelector("#result-name"),
  resultLabel: document.querySelector("#result .result-label"),
  removeButton: document.querySelector("#remove-winner"),
  onWinnerRemoved: disableActiveParticipant
});

const editor = new Editor({
  namesList: document.querySelector("#names-list"),
  nameCount: document.querySelector("#name-count"),
  form: document.querySelector("#add-form"),
  input: document.querySelector("#new-name"),
  onChange: updateNames,
  onToggle: toggleParticipant
});

function updateNames(updatedNames) {
  names = updatedNames;
  disabledIndices = new Set();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(names));
  refreshComponents();
}

function refreshComponents() {
  editor.setNames(names, disabledIndices);
  wheel.setParticipants(editor.getActiveParticipants());
}

function disableActiveParticipant(activeIndex) {
  const entries = editor.getActiveParticipants();
  const selected = entries[activeIndex];
  if (!selected) return;
  disabledIndices.add(selected.index);
  editor.setNames(names, disabledIndices);
  const remaining = editor.getActiveParticipants();
  if (remaining.length <= 1) {
    const winner = remaining[0]?.name ?? selected.name;
    disabledIndices.clear();
    refreshComponents();
    wheel.showRoundWinner(winner);
    return;
  }
  refreshComponents();
}

function toggleParticipant(index) {
  if (disabledIndices.has(index)) disabledIndices.delete(index);
  else disabledIndices.add(index);
  refreshComponents();
}

refreshComponents();
