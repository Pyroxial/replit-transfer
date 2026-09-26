---
name: WebGL preview fallback
description: Why the BBREU visualizer keeps a non-WebGL rendering path for browser previews.
---

Interactive 3D previews must remain usable when the browser cannot create a WebGL context. Treat renderer creation as fallible and keep a visible 2D or static assembly fallback rather than allowing the renderer error to take down the whole React surface.

**Why:** The Replit screenshot browser did not expose a usable WebGL context, even though Three.js loaded correctly. Without a guarded renderer constructor, the app rendered only its error boundary.

**How to apply:** For future Three.js artifact work, verify the preview in a no-WebGL environment and preserve the fallback path when adjusting scene initialization.