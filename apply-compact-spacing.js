const fs = require("fs");
const path = require("path");
const root = process.cwd();
const allowed = [11, 12, 13, 14, 16, 20, 24, 32];

function read(rel) {
  const p = path.join(root, rel);
  if (!fs.existsSync(p)) throw new Error("Missing file: " + rel);
  return { p, value: fs.readFileSync(p, "utf8") };
}
function updateStyle(source, name, props) {
  const re = new RegExp("(^\\\\s*" + name + ":\\\\s*\\\\{)([\\\\s\\\\S]*?)(^\\\\s*\\\\},?)", "m");
  const match = source.match(re);
  if (!match) {
    console.warn("Style not found (left unchanged): " + name);
    return source;
  }
  let body = match[2];
  for (const [key, value] of Object.entries(props)) {
    const prop = new RegExp("(^\\\\s*" + key + ":\\\\s*)([^,\\\\n]+)", "m");
    if (prop.test(body)) body = body.replace(prop, "$1" + value);
    else body += "\\n    " + key + ": " + value + ",";
  }
  return source.replace(re, match[1] + body + match[3]);
}
function save(rel, source) {
  fs.writeFileSync(path.join(root, rel), source);
}

const themeFile = read("constants/theme.ts");
let theme = themeFile.value;
theme = theme.replace(/xs:\s*4/, "xs: 4")
  .replace(/sm:\s*8/, "sm: 6")
  .replace(/md:\s*16/, "md: 12")
  .replace(/lg:\s*24/, "lg: 18")
  .replace(/xl:\s*32/, "xl: 24");
save("constants/theme.ts", theme);

// Make the vocabulary list more compact and reduce visual weight of each word.
let words = read("app/(tabs)/words.tsx").value;
words = updateStyle(words, "word", {
  fontSize: "16",
  fontWeight: '"500"',
  lineHeight: "20",
  marginBottom: "1",
});
words = updateStyle(words, "meaning", {
  fontSize: "13",
  lineHeight: "18",
  fontWeight: '"400"',
});
words = updateStyle(words, "wordCard", {
  padding: "10",
  marginBottom: "6",
});
words = updateStyle(words, "tagsRow", {
  height: "44",
  marginBottom: "10",
});
words = updateStyle(words, "tagsScroll", { height: "44" });
words = updateStyle(words, "tagsContent", { height: "44" });
words = updateStyle(words, "searchContainer", { marginBottom: "8", minHeight: "44" });
save("app/(tabs)/words.tsx", words);

// Word detail: word title is still clear, but no longer oversized/bold.
let detail = read("app/word-detail.tsx").value;
detail = updateStyle(detail, "word", {
  fontSize: "24",
  fontWeight: '"600"',
  lineHeight: "29",
});
detail = updateStyle(detail, "meaning", {
  fontSize: "14",
  fontWeight: '"400"',
  lineHeight: "20",
});
detail = updateStyle(detail, "mainCard", { padding: "16", marginBottom: "10" });
detail = updateStyle(detail, "section", { marginBottom: "6" });
save("app/word-detail.tsx", detail);

// Home: tighten vertical rhythm and make reviewed vocabulary quieter.
let home = read("app/(tabs)/index.tsx").value;
const homeChanges = {
  weekRow: { marginBottom: "14" },
  lessonCard: { minHeight: "142", marginBottom: "14" },
  lessonContent: { paddingHorizontal: "15", paddingVertical: "9" },
  lessonBottom: { marginTop: "8" },
  focusList: { marginBottom: "8" },
  focusRow: { minHeight: "35", gap: "8" },
  quickHeading: { marginBottom: "6" },
  lowerSection: { marginTop: "18" },
  pathProgressRow: { marginTop: "8", gap: "10" },
  reviewHeading: { marginBottom: "6" },
  reviewWordRow: { minHeight: "43", gap: "9" },
  soundButton: { width: "30", height: "30" },
  reviewWord: { fontSize: "14", fontWeight: '"500"' },
  wordType: { fontSize: "11" },
  wordMeaning: { fontSize: "11", fontWeight: '"400"' },
  challengeCard: { marginTop: "16", minHeight: "150", padding: "14" },
  challengeTop: { gap: "10" },
  challengeButton: { marginTop: "9", height: "40" },
  progressHeading: { marginBottom: "12" },
  quoteBlock: { marginTop: "18" },
};
for (const [name, props] of Object.entries(homeChanges)) home = updateStyle(home, name, props);
save("app/(tabs)/index.tsx", home);

// Grammar list: tighter tag-to-list and card spacing.
let grammar = read("app/(tabs)/grammar.tsx").value;
grammar = updateStyle(grammar, "tagsRow", { height: "44", marginBottom: "10" });
grammar = updateStyle(grammar, "tagsScroll", { height: "44" });
grammar = updateStyle(grammar, "tagsContent", { height: "44" });
grammar = updateStyle(grammar, "grammarCard", { padding: "10", marginBottom: "6" });
grammar = updateStyle(grammar, "grammarPoint", { lineHeight: "24" });
save("app/(tabs)/grammar.tsx", grammar);

// Strictly verify explicit fontSize declarations touched by this patch remain on scale.
const checkFiles = [
  "app/(tabs)/index.tsx",
  "app/(tabs)/words.tsx",
  "app/word-detail.tsx",
  "app/(tabs)/grammar.tsx",
  "constants/theme.ts",
];
const invalid = [];
for (const rel of checkFiles) {
  const source = fs.readFileSync(path.join(root, rel), "utf8");
  for (const m of source.matchAll(/fontSize:\s*(\d+)/g)) {
    const n = Number(m[1]);
    if (!allowed.includes(n)) invalid.push(rel + ": " + n);
  }
}
if (invalid.length) {
  console.error("Out-of-scale font sizes found:\n" + invalid.join("\n"));
  process.exit(1);
}
console.log("Compact spacing and lighter vocabulary typography applied.");
console.log("Vocabulary list words: 16sp / medium; meanings: 13sp / regular.");
console.log("Home review words: 14sp / medium; meanings: 11sp / regular.");
console.log("Spacing tokens tightened globally; screen-specific gaps reduced.");
