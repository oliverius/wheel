const WHEEL_COLOURS = ["#ef6a4c", "#f2b84b", "#48a692", "#557bb5", "#9b6bb5", "#e7859a", "#75a957", "#e89145"];

class Wheel {
  constructor({ container, result, resultName, resultLabel, removeButton, onWinnerRemoved }) {
    Object.assign(this, { container, result, resultName, resultLabel, removeButton, onWinnerRemoved });
    this.pointer = document.createElement("div");
    this.pointer.className = "pointer";
    this.pointer.setAttribute("aria-hidden", "true");
    this.canvas = document.createElement("canvas");
    this.canvas.id = "wheel";
    this.canvas.setAttribute("aria-label", "Wheel containing the current names");
    this.spinButton = document.createElement("button");
    this.spinButton.type = "button";
    this.spinButton.className = "spin-button";
    this.spinButton.textContent = "Spin";
    this.container.append(this.pointer, this.canvas, this.spinButton);
    this.context = this.canvas.getContext("2d");
    this.names = [];
    this.rotation = 0;
    this.spinning = false;
    this.winnerIndex = null;
    this.spinButton.addEventListener("click", () => this.spin());
    this.removeButton.addEventListener("click", () => this.removeWinner());
    if ("ResizeObserver" in window) {
      new ResizeObserver(() => this.draw()).observe(this.canvas);
    } else {
      window.addEventListener("resize", () => this.draw());
    }
  }

  setNames(names) {
    this.names = [...names];
    this.winnerIndex = null;
    this.removeButton.hidden = true;
    this.spinButton.disabled = !names.length || this.spinning;
    this.draw();
  }

  fitText(text, maxWidth, initialSize) {
    let size = initialSize;
    do {
      this.context.font = `700 ${size}px "DM Sans", sans-serif`;
      if (this.context.measureText(text).width <= maxWidth) return;
      size -= 1;
    } while (size > 10);
  }

  draw() {
    const cssSize = Math.max(280, Math.round(this.canvas.getBoundingClientRect().width));
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.canvas.width = cssSize * dpr;
    this.canvas.height = cssSize * dpr;
    this.context.setTransform(dpr, 0, 0, dpr, 0, 0);
    const center = cssSize / 2;
    const radius = center - 6;
    const count = Math.max(this.names.length, 1);
    const arc = Math.PI * 2 / count;
    this.context.clearRect(0, 0, cssSize, cssSize);

    for (let index = 0; index < count; index += 1) {
      const start = -Math.PI / 2 - arc / 2 + index * arc;
      this.context.beginPath();
      this.context.moveTo(center, center);
      this.context.arc(center, center, radius, start, start + arc);
      this.context.closePath();
      this.context.fillStyle = this.names.length ? WHEEL_COLOURS[index % WHEEL_COLOURS.length] : "#d9d2c8";
      this.context.fill();
      this.context.strokeStyle = "rgba(255,255,255,.72)";
      this.context.lineWidth = 3;
      this.context.stroke();
      if (!this.names.length) continue;

      const availableWidth = Math.min(radius * 0.5, 180);
      this.context.save();
      this.context.translate(center, center);
      this.context.rotate(start + arc / 2);
      this.context.textAlign = "right";
      this.context.textBaseline = "middle";
      this.context.fillStyle = "#fff";
      this.context.shadowColor = "rgba(0,0,0,.16)";
      this.context.shadowBlur = 2;
      this.fitText(this.names[index], availableWidth, Math.min(20, 260 / count + 10));
      let label = this.names[index];
      while (this.context.measureText(label).width > availableWidth && label.length > 2) label = `${label.slice(0, -2)}…`;
      this.context.fillText(label, radius * 0.84, 0);
      this.context.restore();
    }

    this.context.beginPath();
    this.context.arc(center, center, radius, 0, Math.PI * 2);
    this.context.lineWidth = 7;
    this.context.strokeStyle = "#fff";
    this.context.stroke();
  }

  randomIndex(max) {
    if (!window.crypto?.getRandomValues) return Math.floor(Math.random() * max);
    const range = 0x100000000;
    const limit = range - range % max;
    const value = new Uint32Array(1);
    do window.crypto.getRandomValues(value); while (value[0] >= limit);
    return value[0] % max;
  }

  spin() {
    if (this.spinning || !this.names.length) return;
    this.spinning = true;
    this.winnerIndex = null;
    this.spinButton.disabled = true;
    this.removeButton.hidden = true;
    this.result.classList.remove("winner");
    this.resultLabel.textContent = "Round and round…";
    this.resultName.textContent = "Good luck!";
    const winnerIndex = this.randomIndex(this.names.length);
    const target = -winnerIndex * (360 / this.names.length);
    const current = ((this.rotation % 360) + 360) % 360;
    const destination = ((target % 360) + 360) % 360;
    this.rotation += 5 * 360 + (destination - current + 360) % 360;
    this.canvas.style.transition = "transform 4.8s cubic-bezier(.12,.68,.16,1)";
    this.canvas.style.transform = `rotate(${this.rotation}deg)`;
    this.canvas.addEventListener("transitionend", () => {
      this.spinning = false;
      this.winnerIndex = winnerIndex;
      this.spinButton.disabled = false;
      this.resultLabel.textContent = "The wheel chose";
      this.resultName.textContent = this.names[winnerIndex];
      this.removeButton.hidden = false;
      this.result.classList.add("winner");
    }, { once: true });
  }

  removeWinner() {
    if (this.winnerIndex === null) return;
    const index = this.winnerIndex;
    this.winnerIndex = null;
    this.removeButton.hidden = true;
    this.result.classList.remove("winner");
    this.resultLabel.textContent = "Removed from the wheel";
    this.resultName.textContent = "Spin again?";
    this.onWinnerRemoved(index);
  }

  showRoundWinner(name) {
    this.resultLabel.textContent = "Last one standing — today's winner";
    this.resultName.textContent = name;
    this.result.classList.add("winner");
    this.removeButton.hidden = true;
  }
}

Wheel.COLOURS = WHEEL_COLOURS;
