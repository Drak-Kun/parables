const fs = require("fs");
const file = "app/(tabs)/index.tsx";
if (!fs.existsSync(file)) {
  console.error("Could not find " + file + ". Run this from the Parables project root.");
  process.exit(1);
}
let source = fs.readFileSync(file, "utf8");

// Find the greeting signature path by its distinctive small viewBox/path coordinates.
const pathRegex = /<Path\b(?=[^>]*\bd=["'][^"']*M1\s+(?:10\.8|11\.2)[^"']*C)[^>]*\/?>/s;
const match = source.match(pathRegex);
if (!match) {
  console.error("Could not locate the Hola signature Path. No files were changed.");
  process.exit(1);
}

let replacement = match[0];
replacement = replacement.replace(
  /\bd=["'][^"']*["']/,
  'd="M1 10.8 C 17 4.0, 35 1.8, 53 3.0 C 62 3.7, 69 4.7, 74 5.3 C 68 5.0, 61 4.5, 53 4.1 C 35 3.0, 17 6.8, 1 12.5 Z"'
);

// Remove any gradient/opacity-based blending from this shape and use a solid accent.
if (/\bfill=["']url\(/.test(replacement)) {
  replacement = replacement.replace(/\bfill=["']url\([^"']+\)["']/, 'fill="#FF9D20"');
} else if (/\bfill=["'][^"']+["']/.test(replacement)) {
  replacement = replacement.replace(/\bfill=["'][^"']+["']/, 'fill="#FF9D20"');
} else {
  replacement = replacement.replace(/(<Path\b)/, '$1 fill="#FF9D20"');
}
replacement = replacement.replace(/\bopacity=["'][^"']+["']/, "");
source = source.replace(match[0], replacement);
fs.writeFileSync(file, source);
console.log("Updated only the Hola signature: solid fill, gently curved and tapered.");
