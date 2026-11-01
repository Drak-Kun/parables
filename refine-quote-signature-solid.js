const fs = require("fs");
const file = "app/(tabs)/index.tsx";
if (!fs.existsSync(file)) {
  console.error("Could not find " + file + ". Run this from the Parables project root.");
  process.exit(1);
}
let source = fs.readFileSync(file, "utf8");

// Locate the signature path associated with the Spanish quote, without changing
// the Hola signature or any other screen content.
const quoteIndex = source.indexOf("Un pequeño progreso cada día");
if (quoteIndex < 0) {
  console.error("Could not find the Spanish quote. No files were changed.");
  process.exit(1);
}
const tail = source.slice(quoteIndex);
const pathMatches = [...tail.matchAll(/<Path\b[^>]*\/?>/gs)];
if (!pathMatches.length) {
  console.error("Could not find an SVG Path after the Spanish quote. No files were changed.");
  process.exit(1);
}

// The quote signature is the final SVG path after the quote text.
const selected = pathMatches[pathMatches.length - 1];
let pathTag = selected[0];
const original = pathTag;

// Convert gradient/blended fill to a solid accent color.
if (/\bfill=["']url\(/.test(pathTag)) {
  pathTag = pathTag.replace(/\bfill=["']url\([^"']+\)["']/, 'fill="#FF9D20"');
} else if (/\bstroke=["']url\(/.test(pathTag)) {
  pathTag = pathTag.replace(/\bstroke=["']url\([^"']+\)["']/, 'stroke="#FF9D20"');
} else if (/\bfill=["'][^"']+["']/.test(pathTag)) {
  pathTag = pathTag.replace(/\bfill=["'][^"']+["']/, 'fill="#FF9D20"');
} else {
  console.error("The quote signature path has no gradient fill/stroke to replace. No files were changed.");
  process.exit(1);
}

// Preserve the existing path geometry and thickness profile; remove opacity blending.
pathTag = pathTag.replace(/\bopacity=["'][^"']+["']/, "");
if (pathTag === original) {
  console.error("No change was needed or a supported fill was not found. No files were changed.");
  process.exit(1);
}
const absoluteIndex = quoteIndex + selected.index;
source = source.slice(0, absoluteIndex) + pathTag + source.slice(absoluteIndex + original.length);
fs.writeFileSync(file, source);
console.log("Updated only the Spanish quote signature to a solid orange stroke/fill.");
