# Hero Portrait Top-Right Corner Icon Badge Plan

## Overview
Add the uploaded circular icon (`/assets/aistudio/apps.40749.14551954140006744.d20500b3-e3f5-4e22-9b0f-0c38504cc190_5cc63691.png`) as a floating 3D badge on the **top-right corner** overlapping the edge of the Hero portrait image in `HomePage.tsx`.

## Planned Changes
1. **Hero Portrait Badge (`src/pages/HomePage.tsx`)**:
   - Place the uploaded icon inside `<figure className="hero-portrait">` anchored to the top-right corner (`className="hero-portrait-corner-icon"`), overlapping the portrait's top-right edge.
2. **3D Depth & Responsive Sizing (`src/index.css`)**:
   - Style `.hero-portrait-corner-icon` with `position: absolute; top: -18px; right: -18px; z-index: 3; width: 56px; height: 56px; border-radius: 50%; transform: translateZ(36px);` (and `46px` on mobile screens so it stays inside the viewport without horizontal overflow) with a subtle floating glow and smooth hover scale.
