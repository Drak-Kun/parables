import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import {
  ArrowLeft,
  ChevronDown,
  Filter,
  Plus,
  Search,
  Volume2,
  X,
} from "lucide-react-native";
import * as Speech from "expo-speech";
import { useApp } from "../context/AppContext";
import Svg, { Defs, LinearGradient, Path, Stop } from "react-native-svg";
import { addWord } from "../storage";
import type { Word } from "../types";

const C = {
  bg: "#050505",
  panel: "#151515",
  border: "#393632",
  text: "#F4F0E8",
  muted: "#AAA49B",
  orange: "#FF9D20",
};

type Entry = {
  word: string;
  meaning: string;
  part: "Verb" | "Noun" | "Adjective" | "Adverb" | "Phrase";
  level: "A1" | "A2" | "B1" | "B2" | "C1" | "C2";
  example: string;
  translation: string;
};

const ENTRIES: Entry[] = [
  { word: "abandonar", meaning: "to abandon, to leave", part: "Verb", level: "B1", example: "No quiero abandonar mis sueños.", translation: "I don't want to abandon my dreams." },
  { word: "abierto", meaning: "open", part: "Adjective", level: "A1", example: "El museo está abierto.", translation: "The museum is open." },
  { word: "abogado", meaning: "lawyer", part: "Noun", level: "A2", example: "Mi hermano es abogado.", translation: "My brother is a lawyer." },
  { word: "abrazar", meaning: "to hug, to embrace", part: "Verb", level: "A2", example: "Quiero abrazar a mi familia.", translation: "I want to hug my family." },
  { word: "abrir", meaning: "to open", part: "Verb", level: "A1", example: "Puedes abrir la ventana.", translation: "You can open the window." },
  { word: "aburrido", meaning: "bored", part: "Adjective", level: "A1", example: "Estoy aburrido en casa.", translation: "I'm bored at home." },
  { word: "aburrir", meaning: "to bore", part: "Verb", level: "B1", example: "La película puede aburrir.", translation: "The movie can bore you." },
  { word: "acabar", meaning: "to finish, to end", part: "Verb", level: "A2", example: "Acabo de llegar.", translation: "I have just arrived." },
  { word: "acceso", meaning: "access", part: "Noun", level: "B1", example: "No tengo acceso a internet.", translation: "I don't have internet access." },
  { word: "aceptar", meaning: "to accept", part: "Verb", level: "A2", example: "Acepto tu invitación.", translation: "I accept your invitation." },
  { word: "acercar", meaning: "to bring closer", part: "Verb", level: "B1", example: "Acerca la silla, por favor.", translation: "Bring the chair closer, please." },
  { word: "acuerdo", meaning: "agreement", part: "Noun", level: "B1", example: "Llegamos a un acuerdo.", translation: "We reached an agreement." },
  { word: "además", meaning: "besides, moreover", part: "Adverb", level: "A2", example: "Además, tenemos tiempo.", translation: "Besides, we have time." },
  { word: "adiós", meaning: "goodbye", part: "Phrase", level: "A1", example: "Adiós, hasta mañana.", translation: "Goodbye, see you tomorrow." },
  { word: "adulto", meaning: "adult", part: "Noun", level: "A2", example: "Es un adulto responsable.", translation: "He is a responsible adult." },
  { word: "advertir", meaning: "to warn, to notice", part: "Verb", level: "B2", example: "Quiero advertirte del peligro.", translation: "I want to warn you about the danger." },
  { word: "afortunado", meaning: "lucky, fortunate", part: "Adjective", level: "B1", example: "Me siento afortunado.", translation: "I feel lucky." },
  { word: "agotar", meaning: "to exhaust, to run out", part: "Verb", level: "B2", example: "El viaje me suele agotar.", translation: "The trip usually exhausts me." },
  { word: "ahorrar", meaning: "to save (money)", part: "Verb", level: "A2", example: "Quiero ahorrar para viajar.", translation: "I want to save money to travel." },
  { word: "alegría", meaning: "happiness, joy", part: "Noun", level: "A2", example: "Su visita me da alegría.", translation: "Your visit brings me joy." },
  { word: "alrededor", meaning: "around, surrounding", part: "Adverb", level: "A2", example: "Mira a tu alrededor.", translation: "Look around you." },
  { word: "amable", meaning: "kind, friendly", part: "Adjective", level: "A1", example: "La gente aquí es amable.", translation: "People here are kind." },
  { word: "aprovechar", meaning: "to make the most of", part: "Verb", level: "B1", example: "Debemos aprovechar el tiempo.", translation: "We should make the most of our time." },
  { word: "aunque", meaning: "although, even though", part: "Phrase", level: "B1", example: "Aunque llueve, voy a salir.", translation: "Although it's raining, I'm going out." },
];

const LEVELS = ["All", "A1", "A2", "B1", "B2", "C1", "C2"] as const;

function partStyle(part: Entry["part"]) {
  if (part === "Verb") return s.verbPill;
  if (part === "Adjective") return s.adjectivePill;
  if (part === "Noun") return s.nounPill;
  return s.otherPill;
}

function HomeFadeDivider() {
  return (
    <Svg width="100%" height={1} viewBox="0 0 300 1" preserveAspectRatio="none">
      <Defs>
        <LinearGradient id="dictionaryHomeDividerFade" x1="0" y1="0" x2="1" y2="0">
          <Stop offset="0" stopColor="#37332E" stopOpacity="0.82" />
          <Stop offset="0.62" stopColor="#37332E" stopOpacity="0.48" />
          <Stop offset="1" stopColor="#37332E" stopOpacity="0" />
        </LinearGradient>
      </Defs>
      <Path d="M0 0.5 H300" stroke="url(#dictionaryHomeDividerFade)" strokeWidth={1} />
    </Svg>
  );
}

export default function DictionaryScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ level?: string; part?: string }>();
  const { activeLanguage, words, refreshData, isLoading } = useApp();
  const [query, setQuery] = useState("");
  const [level, setLevel] = useState<string>(
    LEVELS.includes(params.level as any) ? (params.level as string) : "All",
  );
  const [sortAscending, setSortAscending] = useState(true);
  const [selectedPart, setSelectedPart] = useState<string>(
    params.part ? String(params.part) : "All",
  );
  const [filterOpen, setFilterOpen] = useState(false);
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [savingWord, setSavingWord] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLocaleLowerCase();
    return ENTRIES
      .filter((entry) => level === "All" || entry.level === level)
      .filter((entry) => selectedPart === "All" || entry.part.toLowerCase() === selectedPart.toLowerCase())
      .filter((entry) => !q || entry.word.toLocaleLowerCase().includes(q) || entry.meaning.toLocaleLowerCase().includes(q))
      .sort((a, b) => sortAscending ? a.word.localeCompare(b.word) : b.word.localeCompare(a.word));
  }, [query, level, sortAscending, selectedPart]);

  const savedWords = useMemo(() => new Set(words.map((word) => word.word.toLocaleLowerCase())), [words]);

  const speak = (word: string) => {
    Speech.stop();
    Speech.speak(word, { language: activeLanguage?.code || "es-ES", rate: 0.88 });
  };

  const saveEntry = async (entry: Entry) => {
    if (!activeLanguage || savedWords.has(entry.word.toLocaleLowerCase()) || savedIds.includes(entry.word)) return;
    setSavingWord(entry.word);
    const now = new Date().toISOString();
    const word: Word = {
      id: `dict-${entry.word}-${Date.now()}`,
      languageId: activeLanguage.id,
      word: entry.word,
      meaning: entry.meaning,
      example: entry.example,
      notes: `Dictionary · ${entry.part} · ${entry.level}`,
      tags: [entry.part, entry.level, "Dictionary"],
      createdAt: now,
      updatedAt: now,
      status: "new",
      reviewCount: 0,
      correctCount: 0,
      incorrectCount: 0,
      streak: 0,
    };
    try {
      await addWord(word);
      setSavedIds((current) => [...current, entry.word]);
      await refreshData();
    } catch (error) {
      console.error("Unable to save dictionary word:", error);
    } finally {
      setSavingWord(null);
    }
  };

  if (isLoading) {
    return <SafeAreaView edges={["top"]} style={s.safe}><ActivityIndicator color={C.orange} /></SafeAreaView>;
  }

  return (
    <View style={s.screen}>
      <SafeAreaView edges={["top"]} style={s.safe}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={s.content}
        >
          <View style={s.topBar}>
            <Pressable onPress={() => router.back()} hitSlop={10} style={s.backButton}>
              <ArrowLeft size={23} color={C.text} strokeWidth={1.8} />
            </Pressable>
            <Text style={s.logo}>Parables<Text style={s.slash}>/</Text></Text>
            <Pressable
              onPress={() => setFilterOpen(true)}
              hitSlop={10}
              style={s.filterButton}
              accessibilityLabel="Filter by part of speech"
            >
              <Filter size={22} color={C.text} strokeWidth={1.8} />
              {selectedPart !== "All" ? <View style={s.filterDot} /> : null}
            </Pressable>
          </View>

          <View style={s.headingBlock}>
            <Text style={s.heading}>Dictionary</Text>
            <Svg width={76} height={14} viewBox="0 0 76 14" style={s.headingUnderline}>
              <Path
                d="M0 10.8 C 17 4.0, 35 1.8, 53 3.0 C 62 3.7, 69 4.7, 76 5.3 C 68 5.0, 61 4.5, 53 4.1 C 35 3.0, 17 6.8, 0 12.5 Z"
                fill="#FF9D20"
              />
            </Svg>
            <Text style={s.subtitle}>Browse Spanish vocabulary by level.</Text>
          </View>

          <View style={s.searchBox}>
            <Search size={21} color={C.text} strokeWidth={1.8} />
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder="Search Spanish words..."
              placeholderTextColor="#B7B2AA"
              style={s.searchInput}
              returnKeyType="search"
              autoCapitalize="none"
            />
            {query.length > 0 ? (
              <Pressable onPress={() => setQuery("")} hitSlop={8}>
                <X size={18} color={C.muted} />
              </Pressable>
            ) : null}
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.levelsRow}>
            {LEVELS.map((item) => {
              const active = level === item;
              return (
                <Pressable key={item} onPress={() => setLevel(item)} style={[s.levelChip, active && s.levelChipActive]}>
                  <Text style={[s.levelText, active && s.levelTextActive]}>{item}</Text>
                </Pressable>
              );
            })}
          </ScrollView>

          <View style={s.countRow}>
            <Text style={s.countText}>{filtered.length.toLocaleString()} words</Text>
            <Pressable onPress={() => setSortAscending((value) => !value)} style={s.sortButton}>
              <Text style={s.sortText}>{sortAscending ? "A - Z" : "Z - A"}</Text>
              <ChevronDown size={17} color={C.orange} style={{ transform: [{ rotate: sortAscending ? "0deg" : "180deg" }] }} />
            </Pressable>
          </View>

          <View style={s.wordList}>
            {filtered.map((entry, index) => {
              const isSaved = savedWords.has(entry.word.toLocaleLowerCase()) || savedIds.includes(entry.word);
              return (
                <View key={entry.word} style={s.wordRow}>
                  <Pressable style={s.wordTapArea} onPress={() => speak(entry.word)}>
                    <Text style={s.wordText} numberOfLines={1}>{entry.word}</Text>
                  </Pressable>
                  <View style={[s.partPill, partStyle(entry.part)]}>
                    <Text style={[s.partText, entry.part === "Adjective" ? s.adjectiveText : entry.part === "Noun" ? s.nounText : s.verbText]}>{entry.part}</Text>
                  </View>
                  <View style={s.meaningWrap}>
                    <Text style={s.meaningText}>{entry.meaning}</Text>
                  </View>
                  <Pressable
                    onPress={() => isSaved ? router.push("/(tabs)/words") : saveEntry(entry)}
                    style={s.addButton}
                    disabled={savingWord === entry.word}
                    accessibilityLabel={isSaved ? `Already saved ${entry.word}` : `Add ${entry.word} to My Words`}
                  >
                    {isSaved ? <Text style={s.savedCheck}>✓</Text> : <Plus size={21} color={C.text} strokeWidth={1.8} />}
                  </Pressable>
                  {index < filtered.length - 1 ? <View pointerEvents="none" style={s.rowDivider}><HomeFadeDivider /></View> : null}
                </View>
              );
            })}
            {filtered.length === 0 ? (
              <View style={s.emptyState}>
                <Text style={s.emptyTitle}>No words found</Text>
                <Text style={s.emptyCopy}>Try another spelling or a different level.</Text>
              </View>
            ) : null}
          </View>
        </ScrollView>
        <Modal
          visible={filterOpen}
          transparent
          animationType="fade"
          onRequestClose={() => setFilterOpen(false)}
        >
          <Pressable style={s.modalBackdrop} onPress={() => setFilterOpen(false)}>
            <Pressable style={s.filterPanel} onPress={() => {}}>
              <View style={s.modalHeader}>
                <View>
                  <Text style={s.modalEyebrow}>DICTIONARY FILTERS</Text>
                  <Text style={s.modalTitle}>Part of speech</Text>
                </View>
                <Pressable onPress={() => setFilterOpen(false)} hitSlop={10} style={s.modalClose}>
                  <X size={20} color={C.text} />
                </Pressable>
              </View>
              <View style={s.partOptions}>
                {["All", "Noun", "Verb", "Adjective", "Adverb", "Phrase"].map((part) => {
                  const active = selectedPart === part;
                  return (
                    <Pressable
                      key={part}
                      onPress={() => {
                        setSelectedPart(part);
                        setFilterOpen(false);
                      }}
                      style={[s.partOption, active && s.partOptionActive]}
                    >
                      <Text style={[s.partOptionText, active && s.partOptionTextActive]}>{part}</Text>
                      {active ? <Text style={s.optionCheck}>✓</Text> : null}
                    </Pressable>
                  );
                })}
              </View>
            </Pressable>
          </Pressable>
        </Modal>
      </SafeAreaView>
    </View>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.bg },
  safe: { flex: 1, backgroundColor: C.bg },
  content: { paddingHorizontal: 24, paddingTop: 2, paddingBottom: 16 },
  topBar: { height: 42, flexDirection: "row", alignItems: "center", marginBottom: 5 },
  backButton: { width: 36, height: 36, justifyContent: "center", alignItems: "flex-start" },
  logo: { color: C.text, fontSize: 24, fontWeight: "800", letterSpacing: -0.8, lineHeight: 29, flex: 1 },
  slash: { color: C.orange, fontSize: 24, fontWeight: "500" },
  filterButton: { width: 34, height: 36, alignItems: "center", justifyContent: "center", position: "relative" },
  filterDot: { position: "absolute", width: 9, height: 9, borderRadius: 5, right: 1, top: 2, backgroundColor: C.orange },
  headingBlock: { marginTop: 0, marginBottom: 14, paddingLeft: 7 },
  heading: { color: C.text, fontFamily: "serif", fontSize: 28, lineHeight: 34, letterSpacing: -0.55 },
  headingUnderline: { alignSelf: "flex-start", marginLeft: -7, marginTop: -1, marginBottom: 1 },
  subtitle: { color: "#AAA49B", fontSize: 14, lineHeight: 20, letterSpacing: 0 },
  searchBox: { height: 50, borderRadius: 28, borderWidth: 1, borderColor: "#514D47", backgroundColor: "#171717", flexDirection: "row", alignItems: "center", paddingHorizontal: 17, gap: 13, marginBottom: 15 },
  searchInput: { flex: 1, color: C.text, fontSize: 16, paddingVertical: 0 },
  levelsRow: { gap: 9, paddingBottom: 12, paddingRight: 4 },
  levelChip: { height: 35, minWidth: 48, paddingHorizontal: 14, borderRadius: 19, borderWidth: 1, borderColor: "#49453F", backgroundColor: "#101010", alignItems: "center", justifyContent: "center" },
  levelChipActive: { backgroundColor: C.orange, borderColor: C.orange },
  levelText: { color: "#E5E0D8", fontSize: 13, fontWeight: "500" },
  levelTextActive: { color: "#211507", fontWeight: "700" },
  countRow: { height: 40, flexDirection: "row", alignItems: "center", justifyContent: "space-between", borderBottomWidth: 1, borderBottomColor: "#34312D", paddingHorizontal: 7, marginBottom: 0 },
  countText: { color: C.text, fontSize: 14, fontWeight: "500" },
  sortButton: { flexDirection: "row", alignItems: "center", gap: 4, paddingVertical: 8 },
  sortText: { color: C.text, fontSize: 14 },
  wordList: { borderBottomWidth: 0 },
  wordRow: { minHeight: 51, flexDirection: "row", alignItems: "center", paddingLeft: 7, paddingRight: 0, gap: 5, position: "relative" },
  rowDivider: { position: "absolute", left: 7, right: 0, bottom: 0, height: 1 },
  wordTapArea: { width: "30%", justifyContent: "center", paddingVertical: 9, paddingRight: 1 },
  wordText: { color: C.text, fontFamily: "serif", fontSize: 14, fontWeight: "700", letterSpacing: -0.35 },
  partPill: { width: 66, flexShrink: 0, borderRadius: 15, paddingHorizontal: 2, paddingVertical: 5, alignItems: "center", justifyContent: "center" },
  verbPill: { backgroundColor: "#3A2810" },
  adjectivePill: { backgroundColor: "#172A36" },
  nounPill: { backgroundColor: "#2A2038" },
  otherPill: { backgroundColor: "#29251F" },
  partText: { fontSize: 10, lineHeight: 13, fontWeight: "500" },
  verbText: { color: "#FFC15C" },
  adjectiveText: { color: "#B9DDF2" },
  nounText: { color: "#D7C2F5" },
  meaningWrap: { flex: 1, minWidth: 0, minHeight: 35, borderLeftWidth: 1, borderLeftColor: "#4B4741", paddingLeft: 11, justifyContent: "center" },
  meaningText: { color: "#E1DDD6", fontSize: 12, lineHeight: 17 },
  addButton: { width: 26, height: 38, alignItems: "center", justifyContent: "center", marginLeft: 0 },
  savedCheck: { color: C.orange, fontSize: 23, fontWeight: "600" },
  emptyState: { alignItems: "center", paddingVertical: 42 },
  emptyTitle: { color: C.text, fontFamily: "serif", fontSize: 23, marginBottom: 7 },
  emptyCopy: { color: C.muted, fontSize: 14 },
  modalBackdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.68)", justifyContent: "center", paddingHorizontal: 28 },
  filterPanel: { backgroundColor: "#171513", borderRadius: 22, borderWidth: 1, borderColor: "#49433B", padding: 20 },
  modalHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 18 },
  modalEyebrow: { color: C.orange, fontSize: 10, letterSpacing: 1.4, fontWeight: "700", marginBottom: 5 },
  modalTitle: { color: C.text, fontSize: 21, fontWeight: "600" },
  modalClose: { width: 34, height: 34, borderRadius: 17, alignItems: "center", justifyContent: "center", backgroundColor: "#292622" },
  partOptions: { gap: 8 },
  partOption: { minHeight: 44, borderRadius: 12, borderWidth: 1, borderColor: "#393632", paddingHorizontal: 14, flexDirection: "row", alignItems: "center", justifyContent: "space-between", backgroundColor: "#101010" },
  partOptionActive: { borderColor: C.orange, backgroundColor: "#30200D" },
  partOptionText: { color: "#E8E2D9", fontSize: 15 },
  partOptionTextActive: { color: "#FFC15C", fontWeight: "600" },
  optionCheck: { color: C.orange, fontSize: 17, fontWeight: "700" },
});
