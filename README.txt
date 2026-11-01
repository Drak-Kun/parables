PARABLES HOME — ALIGNMENT FIXES

Replace only:
  app/(tabs)/index.tsx

Fixes included:
1. Equal left/right horizontal padding (24px), with the streak badge no longer shifted
   beyond the right content edge.
2. The greeting underline is now a short curved signature ending under "Hola";
   it is a filled tapered stroke that gets thinner and more transparent at the tail.
3. The streak badge outline now uses a fixed-size SVG inside a positioned wrapper,
   rather than relying on an absolute-fill SVG with no explicit dimensions.
4. Home content fills the available screen height and no longer adds a fake 105px
   bottom spacer.

IMPORTANT — bottom navigation:
The bottom navigation is rendered by app/(tabs)/_layout.tsx, not index.tsx.
To make it truly dock to the screen bottom, ensure its tabBarStyle has:
  position: "absolute",
  bottom: 0,
  left: 0,
  right: 0,
  marginBottom: 0

Do not set a positive bottom offset or bottom margin. Preserve the navigator's
safe-area handling for the Android gesture/navigation area. If your layout currently
uses a custom floating bar, remove its extra bottom offset.

Apply:
  cd ~/parables
  unzip -o ~/storage/downloads/parables-home-alignment-fixes.zip -d .
  npx tsc --noEmit

This ZIP intentionally replaces only the Home screen file; it does not overwrite
your tab navigator configuration.
