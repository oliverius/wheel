class Editor {
  static COLOURS = ["#ef6a4c", "#f2b84b", "#48a692", "#557bb5", "#9b6bb5", "#e7859a", "#75a957", "#e89145", "#c65f74", "#4d8c68", "#6d79b8", "#bd8054"];

  constructor({ namesList, nameCount, allVisibleButton, form, input, onChange, onParticipationChange }) {
    Object.assign(this, { namesList, nameCount, allVisibleButton, form, input, onChange, onParticipationChange });
    this.names = [];
    this.disabledIndices = new Set();
    this.roundDisabledIndices = new Set();
    this.#bindForm();
    this.allVisibleButton.addEventListener("click", () => this.enableAll());
  }

  setNames(names, disabledIndices = new Set()) {
    this.names = [...names];
    this.disabledIndices = new Set(disabledIndices);
    this.roundDisabledIndices.clear();
    this.#render();
  }

  getActiveParticipants() {
    return this.names
      .map((name, index) => ({
        name,
        colour: Editor.COLOURS[index % Editor.COLOURS.length],
        index
      }))
      .filter(({ index }) => !this.disabledIndices.has(index) && !this.roundDisabledIndices.has(index));
  }

  getDisabledIndices() {
    return new Set(this.disabledIndices);
  }

  disableParticipant(index) {
    this.roundDisabledIndices.add(index);
    this.#render();
    this.onParticipationChange();
  }

  resetRound() {
    this.roundDisabledIndices.clear();
    this.#render();
    this.onParticipationChange();
  }

  enableAll() {
    this.disabledIndices.clear();
    this.roundDisabledIndices.clear();
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
      this.onChange([...this.names, name], this.getDisabledIndices());
      this.input.focus();
    });
  }

  #toggleParticipant(index) {
    if (this.disabledIndices.has(index)) {
      this.disabledIndices.delete(index);
    } else if (this.roundDisabledIndices.has(index)) {
      this.roundDisabledIndices.delete(index);
    } else {
      this.disabledIndices.add(index);
    }
    this.#render();
    this.onParticipationChange();
  }

  #render() {
    this.namesList.replaceChildren();
    this.nameCount.textContent = `${this.names.length} ${this.names.length === 1 ? "name" : "names"}`;
    this.allVisibleButton.disabled = this.disabledIndices.size === 0 && this.roundDisabledIndices.size === 0;
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
      const isDisabled = this.disabledIndices.has(index) || this.roundDisabledIndices.has(index);
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
        this.onChange(updated, this.getDisabledIndices());
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
      remove.addEventListener("click", () => {
        const disabledIndices = new Set(
          [...this.disabledIndices]
            .filter((disabledIndex) => disabledIndex !== index)
            .map((disabledIndex) => disabledIndex > index ? disabledIndex - 1 : disabledIndex)
        );
        this.onChange(this.names.filter((_, itemIndex) => itemIndex !== index), disabledIndices);
      });
      row.append(dot, input, visibility, remove);
      this.namesList.append(row);
    });
  }
}
