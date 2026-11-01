const fs = require("fs");
const file = "app/(tabs)/index.tsx";
let source = fs.readFileSync(file, "utf8");

const replacements = [
  // Bring the lower-section headings back in line with Today's focus.
  ['serifSectionTitle: { color: C.text, fontFamily: "serif", fontSize: 21, lineHeight: 27, fontWeight: "700" },',
   'serifSectionTitle: { color: C.text, fontFamily: "serif", fontSize: 18, lineHeight: 24, fontWeight: "700" },'],

  // Compact the vocabulary preview: café / viajar / casa should not dominate.
  ['reviewWordRow: { minHeight: 56, flexDirection: "row", alignItems: "center", gap: 13, position: "relative" },',
   'reviewWordRow: { minHeight: 49, flexDirection: "row", alignItems: "center", gap: 12, position: "relative" },'],
  ['reviewWord: { color: C.text, fontFamily: "serif", fontSize: 18, lineHeight: 24, fontWeight: "700", minWidth: 68 },',
   'reviewWord: { color: C.text, fontFamily: "serif", fontSize: 16, lineHeight: 21, fontWeight: "700", minWidth: 62 },'],
  ['wordType: { color: "#918C85", fontSize: 13, lineHeight: 18, flex: 1 },',
   'wordType: { color: "#918C85", fontSize: 12, lineHeight: 16, flex: 1 },'],
  ['wordMeaning: { color: "#D1CCC4", fontSize: 13, lineHeight: 18, textAlign: "right", maxWidth: "32%" },',
   'wordMeaning: { color: "#D1CCC4", fontSize: 12, lineHeight: 16, textAlign: "right", maxWidth: "32%" },'],

  // Reduce the visual gap between lower sections.
  ['lowerSection: { marginTop: 30 },',
   'lowerSection: { marginTop: 24 },'],
  ['reviewHeading: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 9 },',
   'reviewHeading: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 7 },'],
  ['reviewCountText: { color: "#C8C3BC", fontSize: 13, lineHeight: 18 },',
   'reviewCountText: { color: "#C8C3BC", fontSize: 12, lineHeight: 16 },'],
  ['challengeCard: {\n    marginTop: 28, minHeight: 176, borderRadius: 22, borderWidth: 1,',
   'challengeCard: {\n    marginTop: 22, minHeight: 168, borderRadius: 22, borderWidth: 1,'],
];

const missing = [];
for (const [before, after] of replacements) {
  if (!source.includes(before)) missing.push(before.slice(0, 90));
  else source = source.replace(before, after);
}
if (missing.length) {
  console.error("Patch stopped; these expected styles were not found:", missing);
  process.exit(1);
}
fs.writeFileSync(file, source);
console.log("Lower Home typography and spacing refined.");
