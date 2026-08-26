# Spinning Wheel

A simple browser-based wheel for choosing a name at random.

[![Open live demo](https://img.shields.io/badge/Open-Live_Demo-8b5e3c?style=for-the-badge)](https://oliverius.github.io/wheel/)

I use this during daily stand-ups with a remote team. Instead of asking people to raise their hands or deciding who speaks next, we spin the wheel and let it choose the next person.

## Features

- Add and remove names from the wheel.
- Temporarily exclude participants from the current round.
- Remove the selected participant after each spin.
- Continue until only the final winner remains.
- Save the list of names automatically in the browser.
- Play a short sound whenever the pointer crosses into another segment.
- Play a fanfare when only the final participant remains.

## Running locally

Serve the `src` directory with any static HTTP server. For example, with Python:

```sh
python -m http.server 8000 --directory src
```

Then open <http://localhost:8000>.

Or just download the code, it works without a server.

## Using the wheel

1. Add the members of the team to the list.
2. Disable anyone who is absent or should not participate in the current round (for example, they are off today)
3. Select **Spin** to choose the next person.
4. After that person has spoken, select **Remove from wheel**.
5. Spin again until everyone has had a turn.

The original list remains saved for the next stand-up; removing someone from a round does not permanently delete their name.

## Sound options

The boundary sound is stored at:

```text
src/media/audio/ball.mp3
```

`app.js` listens for the wheel's `segmentchange` event and plays the boundary sound. When only one participant remains, the wheel raises `winner` and the app plays `fanfare.mp3` once. This keeps audio concerns separate from the wheel's animation and selection logic.

For short sound effects, MP3 is a good default because it is compact and widely supported. WAV can also be used when file size is unimportant and uncompressed audio is preferred. If the filename or format is changed, update the path near the top of `src/app.js`:

```js
const boundarySound = new Audio("media/audio/ball.mp3");
```

The playback volume can be adjusted between `0` and `1`:

```js
boundarySound.volume = 0.5;
```

Very short click or tick sounds work best because the wheel can cross boundaries quickly near the beginning of a spin.

## Project structure

```text
src/
  index.html          Page structure
  styles.css          Visual styling
  app.js              Application state and sound playback
  editor.js           Participant editor
  wheel.js            Wheel drawing, animation, and events
  media/
    audio/
      ball.mp3        Segment-boundary sound
      fanfare.mp3     Final-winner sound
    favicon/
      wheel.ico       Browser tab icon
```

This project uses plain HTML, CSS, and JavaScript and does not require a build step.
