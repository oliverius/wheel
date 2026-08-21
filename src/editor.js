class Editor {
  static COLOURS = ["#ef6a4c", "#f2b84b", "#48a692", "#557bb5", "#9b6bb5", "#e7859a", "#75a957", "#e89145"];

  constructor({ namesList, nameCount, form, input, onChange, onParticipationChange }) {
    Object.assign(this, { namesList, nameCount, form, input, onChange, onParticipationChange });
    this.names = [];
    this.disabledIndices = new Set();
    this.#bindForm();
  }

  setNames(names, disabledIndices = new Set()) {
    this.names = [...names];
    this.disabledIndices = new Set(disabledIndices);
    this.#render();
  }

  getActiveParticipants() {
    return this.names
      .map((name, index) => ({
        name,
        colour: Editor.COLOURS[index % Editor.COLOURS.length],
        index
      }))
      .filter(({ index }) => !this.disabledIndices.has(index));
  }

  disableParticipant(index) {
    this.disabledIndices.add(index);
    this.#render();
    this.onParticipationChange();
  }

  resetRound() {
    this.disabledIndices.clear();
    this.#render();
    this.onParticipationChange();
  }

  #bindForm() {
    this.form.addEventListener("submit", (event) => {
      event.preventDefault();
      const name = this.input.value.trim();
      if (!name) {
        return;
      }
      this.input.value = "";
      this.onChange([...this.names, name]);
      this.input.focus();
    });
  }

  #toggleParticipant(index) {
    if (this.disabledIndices.has(index)) {
      this.disabledIndices.delete(index);
    } else {
      this.disabledIndices.add(index);
    }
    this.#render();
    this.onParticipationChange();
  }

  #render() {
    this.namesList.replaceChildren();
    this.nameCount.textContent = `${this.names.length} ${this.names.length === 1 ? "name" : "names"}`;
    if (!this.names.length) {
      const empty = document.createElement("p");
      empty.className = "empty-message";
      empty.textContent = "Your wheel is empty. Add a name to get started.";
      this.namesList.append(empty);
      return;
    }

    this.names.forEach((name, index) => {
      const row = document.createElement("div");
      row.className = "name-row";
      const isDisabled = this.disabledIndices.has(index);
      row.classList.toggle("is-disabled", isDisabled);
      const dot = document.createElement("span");
      dot.className = "colour-dot";
      dot.style.backgroundColor = Editor.COLOURS[index % Editor.COLOURS.length];
      const input = document.createElement("input");
      input.value = name;
      input.maxLength = 60;
      input.setAttribute("aria-label", `Edit ${name}`);
      input.addEventListener("change", () => {
        const value = input.value.trim();
        if (!value) {
          input.value = name;
          return;
        }
        const updated = [...this.names];
        updated[index] = value;
        this.onChange(updated);
      });
      const visibility = document.createElement("button");
      visibility.type = "button";
      visibility.className = "visibility-button";
      visibility.innerHTML = "&#128065;";
      visibility.setAttribute("aria-label", `${isDisabled ? "Include" : "Exclude"} ${name} ${isDisabled ? "in" : "from"} this round`);
      visibility.title = isDisabled ? "Include in this round" : "Exclude from this round";
      visibility.style.opacity = isDisabled ? ".45" : "1";
      visibility.addEventListener("click", () => this.#toggleParticipant(index));
      const remove = document.createElement("button");
      remove.type = "button";
      remove.className = "remove-button";
      remove.innerHTML = "&times;";
      remove.setAttribute("aria-label", `Remove ${name}`);
      remove.addEventListener("click", () => this.onChange(this.names.filter((_, itemIndex) => itemIndex !== index)));
      row.append(dot, input, visibility, remove);
      this.namesList.append(row);
    });
  }
}
