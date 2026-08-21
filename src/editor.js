class Editor {
  constructor({ namesList, nameCount, form, input, onChange }) {
    Object.assign(this, { namesList, nameCount, form, input, onChange });
    this.names = [];
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const name = input.value.trim();
      if (!name) return;
      input.value = "";
      this.onChange([...this.names, name]);
      input.focus();
    });
  }

  setNames(names) {
    this.names = [...names];
    this.render();
  }

  render() {
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
      const dot = document.createElement("span");
      dot.className = "colour-dot";
      dot.style.backgroundColor = Wheel.COLOURS[index % Wheel.COLOURS.length];
      const input = document.createElement("input");
      input.value = name;
      input.maxLength = 60;
      input.setAttribute("aria-label", `Edit ${name}`);
      input.addEventListener("change", () => {
        const value = input.value.trim();
        if (!value) return void (input.value = name);
        const updated = [...this.names];
        updated[index] = value;
        this.onChange(updated);
      });
      const remove = document.createElement("button");
      remove.type = "button";
      remove.className = "remove-button";
      remove.innerHTML = "&times;";
      remove.setAttribute("aria-label", `Remove ${name}`);
      remove.addEventListener("click", () => this.onChange(this.names.filter((_, itemIndex) => itemIndex !== index)));
      row.append(dot, input, remove);
      this.namesList.append(row);
    });
  }
}
