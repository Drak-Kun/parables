const fs = require("fs");
const file = "app/(tabs)/index.tsx";
let source = fs.readFileSync(file, "utf8");

const replacements = [
  // Main header and greeting
  ['logo: { color: C.text, fontSize: 22, fontWeight: "800", letterSpacing: -0.7 },',
   'logo: { color: C.text, fontSize: 24, fontWeight: "800", letterSpacing: -0.8 },'],
  ['slash: { color: C.orange, fontSize: 25, fontWeight: "500" },',
   'slash: { color: C.orange, fontSize: 27, fontWeight: "500" },'],
  ['greeting: { color: C.text, fontFamily: "serif", fontSize: 27, lineHeight: 33 },',
   'greeting: { color: C.text, fontFamily: "serif", fontSize: 30, lineHeight: 36 },'],
  ['subGreeting: { color: "#D0CBC3", fontSize: 11, lineHeight: 15 },',
   'subGreeting: { color: "#D0CBC3", fontSize: 13, lineHeight: 19 },'],

  // Weekly activity
  ['weekRow: { flexDirection: "row", justifyContent: "space-between", paddingHorizontal: 10, marginBottom: 23 },',
   'weekRow: { flexDirection: "row", justifyContent: "space-between", paddingHorizontal: 10, marginBottom: 24 },'],
  ['weekLabel: { color: C.muted, fontSize: 12 },',
   'weekLabel: { color: C.muted, fontSize: 13, lineHeight: 18 },'],

  // Continue learning card
  ['lessonContent: { paddingHorizontal: 17, paddingVertical: 11 },',
   'lessonContent: { paddingHorizontal: 18, paddingVertical: 16 },'],
  ['lessonEyebrow: { color: "#D8D1C7", fontSize: 12, marginBottom: 4 },',
   'lessonEyebrow: { color: "#D8D1C7", fontSize: 13, lineHeight: 18, marginBottom: 6 },'],
  ['lessonTitle: { color: "#FFF8ED", fontFamily: "serif", fontSize: 23, fontWeight: "700", lineHeight: 28 },',
   'lessonTitle: { color: "#FFF8ED", fontFamily: "serif", fontSize: 24, fontWeight: "700", lineHeight: 30 },'],
  ['lessonDescription: { color: "#D9D2C8", fontSize: 11, marginTop: 4 },',
   'lessonDescription: { color: "#D9D2C8", fontSize: 13, lineHeight: 18, marginTop: 5 },'],
  ['lessonBottom: { flexDirection: "row", alignItems: "flex-end", justifyContent: "space-between", gap: 8, marginTop: 11 },',
   'lessonBottom: { flexDirection: "row", alignItems: "flex-end", justifyContent: "space-between", gap: 10, marginTop: 16 },'],
  ['lessonMeta: { color: C.text, fontSize: 9, marginBottom: 7 },',
   'lessonMeta: { color: C.text, fontSize: 11, lineHeight: 15, marginBottom: 8 },'],
  ['continueButton: { minWidth: 100, height: 35, borderRadius: 19, backgroundColor: C.orange, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6 },',
   'continueButton: { minWidth: 108, height: 40, borderRadius: 21, backgroundColor: C.orange, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 7 },'],
  ['continueText: { color: "#170F04", fontSize: 11, fontWeight: "800" },',
   'continueText: { color: "#170F04", fontSize: 13, fontWeight: "800" },'],

  // Section headings and focus list
  ['sectionTitle: { color: C.text, fontSize: 17, fontWeight: "700" },',
   'sectionTitle: { color: C.text, fontSize: 19, lineHeight: 25, fontWeight: "700" },'],
  ['sectionMeta: { color: "#D0CBC3", fontSize: 12 },',
   'sectionMeta: { color: "#D0CBC3", fontSize: 13, lineHeight: 18 },'],
  ['focusRow: { minHeight: 38, flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 6, position: "relative" },',
   'focusRow: { minHeight: 44, flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 6, position: "relative" },'],
  ['focusText: { flex: 1, color: C.text, fontSize: 12 },',
   'focusText: { flex: 1, color: C.text, fontSize: 14, lineHeight: 20 },'],
  ['focusList: { marginBottom: 12 },',
   'focusList: { marginBottom: 18 },'],

  // Quick access
  ['quickHeading: { color: "#B9B4AD", fontSize: 14, marginBottom: 8 },',
   'quickHeading: { color: "#B9B4AD", fontSize: 15, lineHeight: 21, marginBottom: 10 },'],
  ['quickRow: { flexDirection: "row", gap: 8, marginBottom: 0 },',
   'quickRow: { flexDirection: "row", gap: 9, marginBottom: 0 },'],
  ['quickCard: {\n    flex: 1, aspectRatio: 1, maxHeight: 96, borderRadius: 16, borderWidth: 1,',
   'quickCard: {\n    flex: 1, aspectRatio: 1, maxHeight: 104, borderRadius: 17, borderWidth: 1,'],
  ['quickLabel: { color: C.text, fontSize: 9, textAlign: "center" },',
   'quickLabel: { color: C.text, fontSize: 11, lineHeight: 15, textAlign: "center" },'],

  // Lower sections and review rows
  ['lowerSection: { marginTop: 27 },',
   'lowerSection: { marginTop: 30 },'],
  ['serifSectionTitle: { color: C.text, fontFamily: "serif", fontSize: 18, fontWeight: "700" },',
   'serifSectionTitle: { color: C.text, fontFamily: "serif", fontSize: 21, lineHeight: 27, fontWeight: "700" },'],
  ['pathLevel: { color: C.orange, fontSize: 14, fontWeight: "700" },',
   'pathLevel: { color: C.orange, fontSize: 15, lineHeight: 20, fontWeight: "700" },'],
  ['pathLevelName: { color: "#D4D0CA", fontSize: 13 },',
   'pathLevelName: { color: "#D4D0CA", fontSize: 14, lineHeight: 20 },'],
  ['pathPercent: { color: "#D4D0CA", fontSize: 12 },',
   'pathPercent: { color: "#D4D0CA", fontSize: 13, lineHeight: 18 },'],
  ['reviewWordRow: { minHeight: 49, flexDirection: "row", alignItems: "center", gap: 12, position: "relative" },',
   'reviewWordRow: { minHeight: 56, flexDirection: "row", alignItems: "center", gap: 13, position: "relative" },'],
  ['reviewWord: { color: C.text, fontFamily: "serif", fontSize: 16, fontWeight: "700", minWidth: 62 },',
   'reviewWord: { color: C.text, fontFamily: "serif", fontSize: 18, lineHeight: 24, fontWeight: "700", minWidth: 68 },'],
  ['wordType: { color: "#918C85", fontSize: 12, flex: 1 },',
   'wordType: { color: "#918C85", fontSize: 13, lineHeight: 18, flex: 1 },'],
  ['wordMeaning: { color: "#D1CCC4", fontSize: 12, textAlign: "right", maxWidth: "32%" },',
   'wordMeaning: { color: "#D1CCC4", fontSize: 13, lineHeight: 18, textAlign: "right", maxWidth: "32%" },'],
  ['reviewCountText: { color: "#C8C3BC", fontSize: 12 },',
   'reviewCountText: { color: "#C8C3BC", fontSize: 13, lineHeight: 18 },'],

  // Challenge and progress
  ['challengeCard: {\n    marginTop: 24, minHeight: 164, borderRadius: 22, borderWidth: 1,',
   'challengeCard: {\n    marginTop: 28, minHeight: 176, borderRadius: 22, borderWidth: 1,'],
  ['challengeTitle: { color: C.text, fontSize: 18, fontWeight: "700", marginBottom: 4 },',
   'challengeTitle: { color: C.text, fontSize: 19, lineHeight: 25, fontWeight: "700", marginBottom: 5 },'],
  ['challengeDescription: { color: "#C8C1B8", fontSize: 12, lineHeight: 17, maxWidth: 205 },',
   'challengeDescription: { color: "#C8C1B8", fontSize: 14, lineHeight: 20, maxWidth: 215 },'],
  ['challengeButton: { alignSelf: "center", minWidth: 175, height: 43, borderRadius: 24, backgroundColor: C.orange, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, marginTop: 13, paddingHorizontal: 18 },',
   'challengeButton: { alignSelf: "center", minWidth: 184, height: 46, borderRadius: 24, backgroundColor: C.orange, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 9, marginTop: 15, paddingHorizontal: 20 },'],
  ['challengeButtonText: { color: "#170F04", fontSize: 13, fontWeight: "800" },',
   'challengeButtonText: { color: "#170F04", fontSize: 14, fontWeight: "800" },'],
  ['progressPeriod: { color: "#C8C3BC", fontSize: 12 },',
   'progressPeriod: { color: "#C8C3BC", fontSize: 13, lineHeight: 18 },'],
  ['statValue: { color: C.text, fontSize: 20, fontWeight: "700" },',
   'statValue: { color: C.text, fontSize: 22, lineHeight: 28, fontWeight: "700" },'],
  ['statLabel: { color: "#B6B0A8", fontSize: 11, textAlign: "center" },',
   'statLabel: { color: "#B6B0A8", fontSize: 12, lineHeight: 17, textAlign: "center" },'],

  // Bottom quote
  ['quoteBlock: { alignItems: "center", marginTop: 24, marginBottom: 4 },',
   'quoteBlock: { alignItems: "center", marginTop: 28, marginBottom: 8 },'],
  ['quoteText: { color: "#EEE8DF", fontFamily: "serif", fontStyle: "italic", fontSize: 17, lineHeight: 23, textAlign: "center", marginTop: -1, marginBottom: 13 },',
   'quoteText: { color: "#EEE8DF", fontFamily: "serif", fontStyle: "italic", fontSize: 18, lineHeight: 26, textAlign: "center", marginTop: -1, marginBottom: 10 },'],
];

let missing = [];
for (const [before, after] of replacements) {
  if (!source.includes(before)) {
    missing.push(before.slice(0, 100));
  } else {
    source = source.replace(before, after);
  }
}
if (missing.length) {
  console.error("Some expected style declarations were not found:", missing);
  process.exit(1);
}
fs.writeFileSync(file, source);
console.log("Applied consistent typography and spacing updates to " + file);
