import React, { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import Svg, { Defs, LinearGradient, Stop, Path, Rect, Circle } from "react-native-svg";
import { BookOpen, Check, ChevronRight, Search, X, UserRound } from "lucide-react-native";
import { useApp } from "../../context/AppContext";
import type { Grammar } from "../../types";

const C = {
  bg: "#050505", panel: "#111111", border: "#34302A", text: "#F4F0E8",
  muted: "#AAA49B", orange: "#FF9D20", green: "#65D486", track: "#292929",
};
const LEVELS = ["A1", "A2", "B1", "B2", "C1", "C2"];
const LEVEL_HINTS: Record<string, string> = {
  A1: "Start with the foundations", A2: "Build everyday confidence",
  B1: "Express yourself with ease", B2: "Add nuance and precision",
  C1: "Handle complex ideas", C2: "Master the finer details",
};
const ICONS = [BookOpen, UserRound, LayersIcon, TagIcon];
function LayersIcon({ size, color }: { size?: number; color?: string }) {
  return <Svg width={size ?? 24} height={size ?? 24} viewBox="0 0 24 24"><Path d="m12 3 9 5-9 5-9-5 9-5Zm-9 9 9 5 9-5M3 16l9 5 9-5" fill="none" stroke={color ?? C.orange} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></Svg>;
}
function TagIcon({ size, color }: { size?: number; color?: string }) {
  return <Svg width={size ?? 24} height={size ?? 24} viewBox="0 0 24 24"><Path d="M20 13 11 22 2 13V4h9l9 9Z" fill="none" stroke={color ?? C.orange} strokeWidth="1.8" strokeLinejoin="round"/><Circle cx="7" cy="8" r="1.2" fill={color ?? C.orange}/></Svg>;
}
function Curve() {
  return <Svg width={76} height={14} viewBox="0 0 76 14"><Defs><LinearGradient id="grammarSignatureFade" x1="0" y1="0" x2="1" y2="0"><Stop offset="0" stopColor={C.orange} stopOpacity="1"/><Stop offset="0.42" stopColor={C.orange} stopOpacity="0.92"/><Stop offset="0.78" stopColor={C.orange} stopOpacity="0.48"/><Stop offset="1" stopColor={C.orange} stopOpacity="0"/></LinearGradient></Defs><Path d="M1 10.8 C 17 4.0, 35 1.8, 53 3.0 C 62 3.7, 69 4.7, 74 5.3 C 68 5.0, 61 4.5, 53 4.1 C 35 3.0, 17 6.8, 1 12.5 Z" fill={C.orange}/></Svg>;
}
function ContinueArtwork() {
  return (
    <Svg pointerEvents="none" width="100%" height="100%" viewBox="0 0 340 150" preserveAspectRatio="xMidYMid slice" style={StyleSheet.absoluteFill}>
      <Defs>
        <LinearGradient id="grammarCardFade" x1="0" y1="0" x2="1" y2="0">
          <Stop offset="0" stopColor="#382719" stopOpacity="0.98" />
          <Stop offset="0.48" stopColor="#382719" stopOpacity="0.92" />
          <Stop offset="1" stopColor="#382719" stopOpacity="0.08" />
        </LinearGradient>
        <LinearGradient id="courtyardWall" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor="#F1B46C" />
          <Stop offset="1" stopColor="#A95C2D" />
        </LinearGradient>
      </Defs>
      <Rect width="340" height="150" fill="#24170F" />
      <Rect x="186" y="0" width="154" height="150" fill="url(#courtyardWall)" />
      <Path d="M184 58 220 15 340 15 340 34 229 34 200 67Z" fill="#6C351F" />
      <Path d="M204 150V74Q204 48 230 48H299Q326 48 326 74V150Z" fill="#6D351F" />
      <Path d="M218 150V80Q218 61 237 61H291Q312 61 312 81V150Z" fill="#24150F" />
      <Path d="M229 150V85Q229 71 244 71H284Q300 71 300 86V150Z" fill="#100D0A" />
      <Path d="M218 80Q218 61 237 61H291Q312 61 312 81" fill="none" stroke="#E6A45D" strokeWidth="4" />
      <Path d="M188 150V67L211 43 230 67V150Z" fill="#C77A43" opacity=".58" />
      <Path d="M305 50h17v26h-17z" fill="#26170E" />
      <Path d="M313.5 50v-7m-7 7h14m-14 26h14" stroke="#F7C36F" strokeWidth="2" />
      <Path d="M0 0H340V150H0Z" fill="url(#grammarCardFade)" />
      {Array.from({ length: 9 }, (_, i) => (
        <Circle key={i} cx={242 + (i % 3) * 19} cy={12 + Math.floor(i / 3) * 15} r={5 + (i % 2)} fill={i % 2 ? "#E74D46" : "#F3A04A"} opacity=".94" />
      ))}
      <Path d="M240 0c-8 16-4 23 8 31m10-31c-6 17 0 23 14 30m9-30c-4 15 3 22 17 26" fill="none" stroke="#386B3E" strokeWidth="3" />
      <Path d="M0 0H340V150H0Z" fill="url(#grammarCardFade)" />
    </Svg>
  );
}

export default function GrammarScreen() {
  const { grammar, isLoading } = useApp();
  const router = useRouter();
  const [level, setLevel] = useState("A1");
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [showAll, setShowAll] = useState(false);

  const levelItems = useMemo(() => {
    const tagged = grammar.filter((item: Grammar) => item.tags.some((tag: string) => LEVELS.includes(tag.toUpperCase())));
    const hasLevelTags = tagged.length > 0;
    return grammar.filter((item: Grammar) => {
      const itemLevels = item.tags.map((tag: string) => tag.toUpperCase());
      return !hasLevelTags || itemLevels.includes(level) || (level === "A1" && !itemLevels.some(tag => LEVELS.includes(tag)));
    });
  }, [grammar, level]);
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const base = levelItems.filter((item: Grammar) => !q || [item.grammarPoint, item.meaning, item.formation, item.exampleSentence, ...item.tags].some((value: string | undefined) => value?.toLowerCase().includes(q)));
    return showAll ? base : base.slice(0, 8);
  }, [levelItems, query, showAll]);
  const current = levelItems.find((item: Grammar) => item.status !== "mastered") ?? levelItems[0];
  const completed = levelItems.filter((item: Grammar) => item.status === "mastered").length;
  const topicProgress: Record<string, number> = { new: 0, learning: 38, familiar: 72, mastered: 100 };

  const openTopic = (id?: string) => {
    if (id) router.push(`/grammar-detail?id=${id}`);
    else router.push("/add-grammar");
  };

  return <View style={s.screen}>
    <SafeAreaView edges={["top"]} style={s.safe}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.content}>
        <View style={s.topBar}>
          <Text style={s.logo}>Parables<Text style={s.slash}>/</Text></Text>
          <Pressable style={s.searchButton} onPress={() => { setSearchOpen(v => !v); setQuery(""); }} accessibilityLabel="Search grammar">
            {searchOpen ? <X size={23} color={C.text}/> : <Search size={23} color={C.text}/>}
          </Pressable>
        </View>
        {searchOpen && <View style={s.searchBox}><Search size={17} color={C.muted}/><TextInput value={query} onChangeText={setQuery} placeholder="Search grammar topics..." placeholderTextColor="#77716A" autoFocus style={s.searchInput}/></View>}

        <View style={s.headingBlock}>
          <Text style={s.heading}>Grammar</Text>
          <Curve />
          <Text style={s.subtitle}>Learn Spanish grammar, from basics{"\n"}to advanced.</Text>
        </View>

        <Pressable onPress={() => openTopic(current?.id)} style={({ pressed }) => [s.continueCard, pressed && s.pressed]}>
          <ContinueArtwork/>
          <View style={s.cardShade}/>
          <View style={s.continueCopy}>
            <Text style={s.eyebrow}>CONTINUE LEARNING</Text>
            <Text numberOfLines={1} style={s.continueTitle}>{current?.grammarPoint ?? "The Present Tense"}</Text>
            <Text numberOfLines={1} style={s.continueMeta}>{level}  ·  {current?.status === "mastered" ? "Completed" : current?.status === "familiar" ? "Almost there" : current?.status === "learning" ? "In progress" : "Start learning"}</Text>
            <View style={s.progressLine}>
              <View style={s.progressTrack}><View style={[s.progressFill, { width: `${current ? topicProgress[current.status] : 0}%` }]}/></View>
              <Text style={s.progressCount}>{current ? `${topicProgress[current.status]}%` : "0%"}</Text>
            </View>
          </View>
          <View style={s.continueArrow}><ChevronRight size={26} color="#160F06" strokeWidth={2.8}/></View>
        </Pressable>

        <Text style={s.sectionTitle}>Browse by level</Text>
        <View style={s.levelRow}>
          {LEVELS.map(item => <Pressable key={item} onPress={() => { setLevel(item); setShowAll(false); }} style={[s.levelChip, level === item && s.levelChipActive]}><Text style={[s.levelText, level === item && s.levelTextActive]}>{item}</Text></Pressable>)}
        </View>

        <View style={s.topicHeader}>
          <View><Text style={s.sectionTitle}>Topics in {level}</Text><Text style={s.levelHint}>{LEVEL_HINTS[level]}</Text></View>
          <Pressable onPress={() => setShowAll(v => !v)}><Text style={s.seeAll}>{showAll ? "Show less" : "See all"} <Text style={s.seeArrow}>›</Text></Text></Pressable>
        </View>

        {isLoading ? <Text style={s.emptyText}>Loading grammar...</Text> : filtered.length ? filtered.map((item, index) => {
          const Icon = ICONS[index % ICONS.length];
          const done = item.status === "mastered";
          const active = item.status === "learning" || item.status === "familiar";
          return <Pressable key={item.id} onPress={() => openTopic(item.id)} style={({ pressed }) => [s.topicRow, pressed && s.rowPressed]}>
            <View style={s.topicIcon}><Icon size={25} color={C.orange} strokeWidth={1.8}/></View>
            <View style={s.topicCopy}><Text style={s.topicName}>{item.grammarPoint}</Text><Text numberOfLines={2} style={s.topicDescription}>{item.meaning}</Text></View>
            <View style={[s.statusCircle, done && s.statusDone, active && s.statusActive]}>{done ? <Check size={15} color="#102416" strokeWidth={3}/> : active ? <View style={s.statusDot}/> : null}</View>
            <ChevronRight size={19} color="#D9D5CE" strokeWidth={1.8}/>
          </Pressable>;
        }) : <View style={s.emptyState}><Text style={s.emptyTitle}>No topics here yet</Text><Text style={s.emptyText}>{grammar.length ? "Try another level or add a grammar point for this level." : "Your grammar topics will appear here as you add them."}</Text><Pressable onPress={() => router.push("/add-grammar")} style={s.addButton}><Text style={s.addButtonText}>Add a grammar topic</Text><ChevronRight size={17} color="#170F04"/></Pressable></View>}
      </ScrollView>
    </SafeAreaView>
  </View>;
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.bg }, safe: { flex: 1 },
  content: { paddingHorizontal: 24, paddingTop: 2, paddingBottom: 112 },
  topBar: { height: 42, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  logo: { color: C.text, fontSize: 23, fontWeight: "800", letterSpacing: -0.8 }, slash: { color: C.orange, fontSize: 25 },
  searchButton: { width: 40, height: 40, alignItems: "flex-end", justifyContent: "center" },
  searchBox: { height: 44, borderRadius: 22, borderWidth: 1, borderColor: C.border, backgroundColor: C.panel, marginTop: 8, paddingHorizontal: 14, flexDirection: "row", alignItems: "center", gap: 9 },
  searchInput: { flex: 1, color: C.text, fontSize: 14, paddingVertical: 0 },
  headingBlock: { marginTop: 7, marginBottom: 17 },
  heading: { color: C.text, fontSize: 38, lineHeight: 45, fontFamily: "serif", fontWeight: "600", letterSpacing: -0.8 },
  subtitle: { color: C.text, fontSize: 15, lineHeight: 20, marginTop: -2 },
  continueCard: { height: 122, borderRadius: 21, borderWidth: 1, borderColor: "#80501F", overflow: "hidden", marginHorizontal: 1, marginBottom: 18, justifyContent: "center" },
  cardShade: { position: "absolute", top: 0, right: 0, bottom: 0, left: 0, backgroundColor: "rgba(12,9,6,0.18)" },
  continueCopy: { paddingLeft: 18, paddingRight: 76, paddingVertical: 12 },
  eyebrow: { color: "#E6D7C6", fontSize: 10, fontWeight: "700", letterSpacing: 1.0, marginBottom: 6 },
  continueTitle: { color: C.text, fontSize: 22, lineHeight: 27, fontFamily: "serif", fontWeight: "700", letterSpacing: -0.4 },
  continueMeta: { color: "#E5DED4", fontSize: 13, marginTop: 5 },
  progressLine: { flexDirection: "row", alignItems: "center", gap: 9, marginTop: 9 },
  progressTrack: { flex: 1, height: 7, borderRadius: 5, backgroundColor: "rgba(255,255,255,0.19)", overflow: "hidden" },
  progressFill: { height: "100%", borderRadius: 5, backgroundColor: C.orange }, progressCount: { color: C.text, fontSize: 12, fontWeight: "600" },
  continueArrow: { position: "absolute", right: 17, bottom: 13, width: 43, height: 43, borderRadius: 24, backgroundColor: C.orange, borderWidth: 1.5, borderColor: "#1A1208", alignItems: "center", justifyContent: "center" },
  sectionTitle: { color: C.text, fontSize: 20, fontWeight: "700", letterSpacing: -0.35 },
  levelRow: { flexDirection: "row", justifyContent: "space-between", gap: 7, paddingVertical: 13 },
  levelChip: { flex: 1, minWidth: 0, height: 40, borderRadius: 23, borderWidth: 1, borderColor: "#45413D", backgroundColor: "#101010", alignItems: "center", justifyContent: "center" },
  levelChipActive: { backgroundColor: C.orange, borderColor: C.orange },
  levelText: { color: C.text, fontSize: 14, fontWeight: "500" }, levelTextActive: { color: "#171008", fontWeight: "700" },
  topicHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 13, marginBottom: 8 },
  levelHint: { color: C.muted, fontSize: 11, marginTop: 3 }, seeAll: { color: C.orange, fontSize: 14, fontWeight: "600" }, seeArrow: { fontSize: 21 },
  topicRow: { minHeight: 70, flexDirection: "row", alignItems: "center", gap: 12, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: "#38332E", paddingVertical: 8 },
  rowPressed: { opacity: 0.68 }, topicIcon: { width: 48, height: 48, borderRadius: 15, backgroundColor: "#211A12", alignItems: "center", justifyContent: "center" },
  topicCopy: { flex: 1, minWidth: 0 }, topicName: { color: C.text, fontSize: 16, lineHeight: 20, fontFamily: "serif", fontWeight: "700" },
  topicDescription: { color: C.muted, fontSize: 12, lineHeight: 16, marginTop: 2, flexWrap: "wrap" },
  statusCircle: { width: 29, height: 29, borderRadius: 15, borderWidth: 2, borderColor: "#565656", alignItems: "center", justifyContent: "center" },
  statusDone: { backgroundColor: C.green, borderColor: C.green }, statusActive: { borderColor: C.orange }, statusDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: C.orange },
  emptyState: { alignItems: "center", paddingVertical: 28, paddingHorizontal: 12 }, emptyTitle: { color: C.text, fontSize: 17, fontWeight: "700" },
  emptyText: { color: C.muted, fontSize: 13, lineHeight: 19, textAlign: "center", marginTop: 7 },
  addButton: { height: 42, paddingHorizontal: 16, borderRadius: 22, backgroundColor: C.orange, flexDirection: "row", alignItems: "center", gap: 6, marginTop: 16 },
  addButtonText: { color: "#170F06", fontSize: 13, fontWeight: "700" }, pressed: { opacity: 0.82 },
});
