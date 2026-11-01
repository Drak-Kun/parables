const fs = require("fs");
const file = "app/(tabs)/index.tsx";
if (!fs.existsSync(file)) {
  console.error("Run this from the Parables project root; index.tsx was not found.");
  process.exit(1);
}
let src = fs.readFileSync(file, "utf8");
const marker = "const s = StyleSheet.create({";
const at = src.indexOf(marker);
if (at < 0) throw new Error("Could not find Home StyleSheet.");
const before = src.slice(0, at);
let css = src.slice(at);

function setStyle(name, changes) {
  const lines = css.split("\n");
  const index = lines.findIndex(line => new RegExp("^\\s*" + name + ":\\s*\\{").test(line));
  if (index < 0) {
    console.warn("Style not found (skipped): " + name);
    return;
  }
  const line = lines[index];
  const open = line.indexOf("{");
  const close = line.lastIndexOf("}");
  if (close < open) {
    console.warn("Could not parse style (skipped): " + name);
    return;
  }
  let body = line.slice(open + 1, close).trim();
  for (const [key, value] of Object.entries(changes)) {
    const re = new RegExp("(^|,\\s*)" + key + "\\s*:\\s*([^,]+)");
    if (re.test(body)) body = body.replace(re, (_, prefix) => prefix + key + ": " + value);
    else body += (body && !body.endsWith(",") ? ", " : " ") + key + ": " + value;
  }
  lines[index] = line.slice(0, open + 1) + " " + body + " " + line.slice(close);
  css = lines.join("\n");
}

const changes = {
  logo: { fontSize: "24", fontWeight: '"800"', lineHeight: "29" },
  slash: { fontSize: "24" },
  greeting: { fontSize: "32", lineHeight: "38" },
  subGreeting: { color: "C.muted", fontSize: "14", lineHeight: "20" },
  streakNumber: { fontSize: "32", lineHeight: "38", fontWeight: '"700"' },
  streakLabel: { color: "C.muted", fontSize: "12" },
  weekLabel: { fontSize: "12", fontWeight: '"500"' },

  lessonEyebrow: { color: "C.muted", fontSize: "13" },
  lessonTitle: { fontSize: "24", lineHeight: "29" },
  lessonDescription: { color: "C.muted", fontSize: "14", lineHeight: "20" },
  lessonMeta: { color: "C.muted", fontSize: "12" },
  continueText: { fontSize: "14", fontWeight: '"600"' },

  sectionTitle: { fontSize: "20", lineHeight: "24", fontWeight: '"700"' },
  serifSectionTitle: { fontSize: "20", lineHeight: "24", fontWeight: '"700"' },
  sectionMeta: { color: "C.muted", fontSize: "13" },
  pathLevel: { fontSize: "14", fontWeight: '"600"' },
  pathLevelName: { color: "C.muted", fontSize: "14" },
  pathPercent: { color: "C.muted", fontSize: "13" },
  quickHeading: { color: "C.muted", fontSize: "13" },

  focusText: { fontSize: "16", lineHeight: "22" },
  quickLabel: { fontSize: "12" },
  reviewCountText: { color: "C.muted", fontSize: "13" },
  reviewWord: { fontSize: "20", lineHeight: "24" },
  wordType: { color: "C.muted", fontSize: "13" },
  wordMeaning: { color: "C.muted", fontSize: "14" },

  challengeTitle: { fontSize: "20", lineHeight: "24" },
  challengeDescription: { color: "C.muted", fontSize: "14", lineHeight: "20" },
  challengeButtonText: { fontSize: "14", fontWeight: '"600"' },

  progressPeriod: { color: "C.muted", fontSize: "13" },
  statValue: { fontSize: "24", lineHeight: "29" },
  statTotal: { color: "C.muted", fontSize: "16" },
  statLabel: { color: "C.muted", fontSize: "12" },
  quoteText: { fontSize: "20", lineHeight: "28" },
};
for (const [name, props] of Object.entries(changes)) setStyle(name, props);

// Normalize every font size in this Home stylesheet to the exact allowed scale.
const allowed = [11, 12, 13, 14, 16, 20, 24, 32];
const nearest = n => allowed.reduce((best, value) =>
  Math.abs(value - n) < Math.abs(best - n) ? value : best, allowed[0]);
css = css.replace(/fontSize:\s*(\d+)/g, (_, raw) =>
  "fontSize: " + nearest(Number(raw))
);

// Unify secondary text to the shared muted token.
css = css.replace(/color:\s*"(?:#D0CBC3|#D4D0CA|#D1CCC4|#C8C3BC|#C8C1B8|#B6B0A8|#B9B4AD|#918C85|#85817B|#D8D1C7|#D9D2C8)"/g, "color: C.muted");

// All section headings use one sans-serif treatment.
for (const name of ["sectionTitle", "serifSectionTitle"]) {
  const lines = css.split("\n");
  const index = lines.findIndex(line => new RegExp("^\\s*" + name + ":\\s*\\{").test(line));
  if (index >= 0) {
    lines[index] = lines[index].replace(/,?\s*fontFamily:\s*[^,}]+/g, "");
    css = lines.join("\n");
  }
}

src = before + css;
fs.writeFileSync(file, src);

const sizes = [...css.matchAll(/fontSize:\s*(\d+)/g)].map(m => Number(m[1]));
const invalid = [...new Set(sizes.filter(n => !allowed.includes(n)))];
if (invalid.length) {
  console.error("Invalid sizes remain:", invalid.join(", "));
  process.exitCode = 1;
} else {
  console.log("Applied strict typography scale. Sizes used: " + [...new Set(sizes)].sort((a,b)=>a-b).join(", "));
}
