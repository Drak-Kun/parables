const fs = require("fs");
const file = "app/(tabs)/index.tsx";
let source = fs.readFileSync(file, "utf8");

const oldPath = `d="M1 10.8 C 16 3.2, 34 1.5, 49 3.1 C 59 4.1, 67 5.1, 74 5.4
                     C 67 6.2, 59 5.7, 49 4.5 C 33 3.1, 16 6.2, 1 12.5 Z"`;

const newPath = `d="M1 11.2 C 15 5.2, 29 2.1, 43 1.4 C 51 1.0, 59 0.9, 68 0.8
                     C 60 2.0, 52 2.5, 43 2.7 C 28 3.0, 14 6.4, 1 12.4 Z"`;

if (!source.includes(oldPath)) {
  console.error("Could not find the current Hola signature path. No changes made.");
  process.exit(1);
}

source = source.replace(oldPath, newPath);
fs.writeFileSync(file, source);
console.log("Updated Hola signature: one rising arc, tapered to a fine stop at the end.");
