# Atharva Takle — Portfolio

An interactive portfolio built as an answer to one question: **"Who is Atharva Takle?"**

Live: https://atharvaaat.github.io

## Concept

Instead of a static résumé page, the site opens like a query to an automated system. The question types itself out, narrows down to my name, and a swarm of small builder agents assembles the page in front of you — section by section, as you scroll. Past the intro, flowing binary resolves into an interactive 3D universe (Three.js) where each node is a technical concept I work with — agentic AI, RAG, API gateways, distributed systems, Kubernetes, authorization, vector databases, and more — each one its own explorable "room" with a live, working visualization of how it actually functions, not just a description of it.

## Stack

- Vanilla JS, no framework or build step
- [Three.js](https://threejs.org/) (r128) for the 3D concept universe
- Hand-built SVG diagram/animation engine for the per-concept interactive visualizations (flow diagrams, a real HNSW nearest-neighbor search simulation, a Ray Serve autoscaling simulation, a Kubernetes reconcile-loop simulation, an asyncio timeline)
- Web Audio API + an `<audio>` element for ambient sound and UI feedback
- IntersectionObserver-driven scroll-triggered build sequence

## Files

| File | Purpose |
|---|---|
| `index.html` | Page structure and styles |
| `content.js` | All dimension/project/content data |
| `viz.js` | Interactive per-concept diagram engine |
| `universe.js` | 3D universe scene, dimension rooms, camera |
| `intro.js` | Opening sequence and scroll-triggered swarm build |
| `sound.js` | Audio playback and UI sound effects |
| `aura.mp3` | Background track |

## Running locally

No build step — just serve the folder:

```bash
python3 -m http.server 8000
```

Then open `http://localhost:8000`.

## Deployment

Served directly via GitHub Pages from this repo's `main` branch.
