# Quiet Breathwork

Quiet Breathwork is a static, onsen-inspired breathing companion built with plain HTML, CSS, and vanilla JavaScript. It offers calm visuals, gentle pacing, and soft cues for focus.

## How to run

Open `index.html` directly in your browser. No server or build step is required.

## Breathing modes

- **Box breathing**: inhale 4s, hold 4s, exhale 4s, hold 4s
- **4-7-8**: inhale 4s, hold 7s, exhale 8s
- **Physiological sigh**: inhale 2s, inhale 1s, exhale 6s

## Adjusting timings

All timing logic lives in `app.js`. Update the `presets` object to change phase durations or add new presets:

```js
const presets = {
  box: {
    phases: [
      { label: "Inhale", type: "inhale", duration: 4 },
      { label: "Hold", type: "hold-high", duration: 4 },
      { label: "Exhale", type: "exhale", duration: 4 },
      { label: "Hold", type: "hold-low", duration: 4 }
    ]
  }
};
```

You can also change the preparation countdown by adjusting `prepSeconds` near the top of `app.js`.
