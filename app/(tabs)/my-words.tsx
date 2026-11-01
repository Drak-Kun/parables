import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { ArrowLeft, Check, ChevronDown, Plus, Search, Volume2, X } from "lucide-react-native";
import Svg, { Defs, LinearGradient, Path, Stop } from "react-native-svg";
import * as Speech from "expo-speech";
import { useApp } from "../../context/AppContext";
import type { Word } from "../../types";

const C = {
  bg: "#050505",
  text: "#F4F0E8",
  muted: "#AAA49B",
  orange: "#FF9D20",
  border: "#34302A",
};

type FilterKey = "All" | "Due" | "Learning" | "Mastered";

function isDue(word: Word) {
  if (word.status === "new") return true;
  if (!word.lastReviewedAt) return word.status !== "mastered";
  const reviewed = new Date(word.lastReviewedAt).getTime();
  return word.status !== "mastered" && Date.now() - reviewed >= 24 * 60 * 60 * 1000;
}

function HomeFadeDivider() {
  return (
    <Svg width="100%" height={1} viewBox="0 0 300 1" preserveAspectRatio="none">
      <Defs>
        <LinearGradient id="myWordsHomeDividerFade" x1="0" y1="0" x2="1" y2="0">
          <Stop offset="0" stopColor="#37332E" stopOpacity="0.82" />
          <Stop offset="0.62" stopColor="#37332E" stopOpacity="0.48" />
          <Stop offset="1" stopColor="#37332E" stopOpacity="0" />
        </LinearGradient>
      </Defs>
      <Path d="M0 0.5 H300" stroke="url(#myWordsHomeDividerFade)" strokeWidth={1} />
    </Svg>
  );
}

export default function MyWordsScreen() {
  const router = useRouter();
  const { words, activeLanguage, isLoading } = useApp();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<FilterKey>("All");
  const [sortAscending, setSortAscending] = useState(true);

  const languageWords = useMemo(
    () => activeLanguage ? words.filter((word) => word.languageId === activeLanguage.id) : [],
    [words, activeLanguage],
  );

  const counts = useMemo(() => ({
    All: languageWords.length,
    Due: languageWords.filter(isDue).length,
    Learning: languageWords.filter((word) => word.status === "learning" || word.status === "familiar").length,
    Mastered: languageWords.filter((word) => word.status === "mastered").length,
  }), [languageWords]);

  const filteredWords = useMemo(() => {
    const q = query.trim().toLocaleLowerCase();
    return languageWords
      .filter((word) => {
        if (filter === "Due") return isDue(word);
        if (filter === "Learning") return word.status === "learning" || word.status === "familiar";
        if (filter === "Mastered") return word.status === "mastered";
        return true;
      })
      .filter((word) => !q || word.word.toLocaleLowerCase().includes(q) ||
        word.meaning.toLocaleLowerCase().includes(q) ||
        word.tags.some((tag) => tag.toLocaleLowerCase().includes(q)))
      .sort((a, b) => sortAscending
        ? a.word.localeCompare(b.word)
        : b.word.localeCompare(a.word));
  }, [languageWords, filter, query, sortAscending]);

  const speak = (word: string) => {
    Speech.stop();
    Speech.speak(word, { language: activeLanguage?.code || "es-ES", rate: 0.88 });
  };

  if (isLoading) {
    return (
      <SafeAreaView edges={["top"]} style={s.safe}>
        <ActivityIndicator color={C.orange} />
      </SafeAreaView>
    );
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
              <ArrowLeft size={22} color={C.text} strokeWidth={1.8} />
            </Pressable>
            <Text style={s.logo}>Parables<Text style={s.slash}>/</Text></Text>
            <View style={s.actions}>
              <Pressable onPress={() => router.push("/add-word")} style={s.addButton} accessibilityLabel="Add a word">
                <Plus size={22} color="#211507" strokeWidth={2.5} />
              </Pressable>
            </View>
          </View>

          <View style={s.headingBlock}>
            <Text style={s.heading}>My Words</Text>
            <Svg width={76} height={14} viewBox="0 0 76 14" style={s.curve}>
              <Defs>
                <LinearGradient id="signatureFade" x1="0" y1="0" x2="1" y2="0">
                  <Stop offset="0" stopColor={C.orange} stopOpacity="1" />
                  <Stop offset="0.42" stopColor={C.orange} stopOpacity="0.92" />
                  <Stop offset="0.78" stopColor={C.orange} stopOpacity="0.48" />
                  <Stop offset="1" stopColor={C.orange} stopOpacity="0" />
                </LinearGradient>
              </Defs>
              <Path
                d="M1 10.8 C 17 4.0, 35 1.8, 53 3.0 C 62 3.7, 69 4.7, 74 5.3 C 68 5.0, 61 4.5, 53 4.1 C 35 3.0, 17 6.8, 1 12.5 Z"
                fill="#FF9D20"
              />
            </Svg>
            <Text style={s.subtitle}>Your saved vocabulary for learning{"\n"}and review.</Text>
          </View>

          <View style={s.searchBox}>
            <Search size={19} color={C.text} strokeWidth={1.8} />
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder="Search your words..."
              placeholderTextColor="#B7B2AA"
              style={s.searchInput}
              autoCapitalize="none"
              returnKeyType="search"
            />
            {query.length > 0 ? (
              <Pressable onPress={() => setQuery("")} hitSlop={8}>
                <X size={18} color={C.muted} />
              </Pressable>
            ) : null}
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.filters}>
            {(["All", "Due", "Learning", "Mastered"] as FilterKey[]).map((item) => {
              const active = filter === item;
              return (
                <Pressable key={item} onPress={() => setFilter(item)} style={[s.filterChip, active && s.filterChipActive]}>
                  <Text style={[s.filterText, active && s.filterTextActive]}>{item}</Text>
                  {item !== "All" ? (
                    <Text style={[s.filterCount, active && s.filterCountActive]}>{counts[item]}</Text>
                  ) : null}
                </Pressable>
              );
            })}
          </ScrollView>

          <View style={s.countRow}>
            <Text style={s.countText}>{filteredWords.length} words</Text>
            <Pressable onPress={() => setSortAscending((value) => !value)} style={s.sortButton}>
              <Text style={s.sortText}>{sortAscending ? "A - Z" : "Z - A"}</Text>
              <ChevronDown size={16} color={C.orange} style={{ transform: [{ rotate: sortAscending ? "0deg" : "180deg" }] }} />
            </Pressable>
          </View>

          <View style={s.list}>
            {filteredWords.map((word, index) => {
              const mastered = word.status === "mastered";
              const type = word.tags?.find((tag) => ["noun", "verb", "adjective", "adverb", "phrase"].includes(tag.toLowerCase())) || "Word";
              return (
                <View key={word.id} style={s.wordRow}>
                  <Pressable onPress={() => speak(word.word)} style={s.soundButton} accessibilityLabel={`Pronounce ${word.word}`}>
                    <Volume2 size={18} color="#E5E0D8" strokeWidth={1.8} />
                  </Pressable>
                  <Pressable style={s.wordMain} onPress={() => router.push(`/word-detail?id=${word.id}`)}>
                    <Text style={s.wordText} numberOfLines={1}>{word.word}</Text>
                  </Pressable>
                  <View style={[s.typePill, type.toLowerCase().includes("verb") ? s.verbPill : type.toLowerCase().includes("adjective") ? s.adjectivePill : s.nounPill]}>
                    <Text style={[s.typeText, type.toLowerCase().includes("adjective") ? s.adjectiveText : type.toLowerCase().includes("verb") ? s.verbText : s.nounText]} numberOfLines={1}>
                      {type}
                    </Text>
                  </View>
                  <View style={s.meaningWrap}>
                    <Text style={s.meaningText}>{word.meaning}</Text>
                  </View>
                  <View style={s.statusSlot}>
                    {mastered ? (
                      <View style={s.masteredCircle}><Check size={15} color="#102012" strokeWidth={3} /></View>
                    ) : isDue(word) ? (
                      <View style={s.dueCircle} />
                    ) : (
                      <View style={s.learningCircle} />
                    )}
                  </View>
                  {index < filteredWords.length - 1 ? <View pointerEvents="none" style={s.rowDivider}><HomeFadeDivider /></View> : null}
                </View>
              );
            })}
            {filteredWords.length === 0 ? (
              <View style={s.emptyState}>
                <Text style={s.emptyTitle}>{query ? "No matching words" : "Nothing here yet"}</Text>
                <Text style={s.emptyText}>{query ? "Try another search." : "Add words to build your vocabulary."}</Text>
              </View>
            ) : null}
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.bg },
  safe: { flex: 1, backgroundColor: C.bg },
  content: { paddingHorizontal: 24, paddingTop: 2, paddingBottom: 88 },
  topBar: { height: 42, flexDirection: "row", alignItems: "center", marginBottom: 5 },
  backButton: { width: 36, height: 36, justifyContent: "center", alignItems: "flex-start" },
  logo: { color: C.text, fontSize: 24, fontWeight: "800", letterSpacing: -0.8, lineHeight: 29, flex: 1 },
  slash: { color: C.orange, fontSize: 24, fontWeight: "500" },
  actions: { flexDirection: "row", alignItems: "center", gap: 12 },
  addButton: { width: 38, height: 38, borderRadius: 11, backgroundColor: C.orange, alignItems: "center", justifyContent: "center" },
  headingBlock: { paddingLeft: 7, marginBottom: 14 },
  heading: { color: C.text, fontFamily: "serif", fontSize: 34, lineHeight: 40, letterSpacing: -0.7 },
  curve: { marginTop: -1, marginBottom: 0, marginLeft: -1 },
  subtitle: { color: C.muted, fontSize: 14, lineHeight: 20, marginTop: 1 },
  searchBox: { height: 50, borderRadius: 28, borderWidth: 1, borderColor: "#514D47", backgroundColor: "#171717", flexDirection: "row", alignItems: "center", paddingHorizontal: 17, gap: 13, marginBottom: 15 },
  searchInput: { flex: 1, color: C.text, fontSize: 16, paddingVertical: 0 },
  filters: { gap: 9, paddingBottom: 13, paddingRight: 4 },
  filterChip: { height: 34, borderRadius: 18, borderWidth: 1, borderColor: "#45413B", backgroundColor: "#111111", flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, paddingHorizontal: 13 },
  filterChipActive: { backgroundColor: C.orange, borderColor: C.orange },
  filterText: { color: C.text, fontSize: 12, fontWeight: "500" },
  filterTextActive: { color: "#211507", fontWeight: "700" },
  filterCount: { color: "#D8D1C8", fontSize: 11, fontWeight: "600", backgroundColor: "#292929", overflow: "hidden", paddingHorizontal: 6, paddingVertical: 2, borderRadius: 10 },
  filterCountActive: { color: "#211507", backgroundColor: "#FFC15C" },
  countRow: { height: 40, flexDirection: "row", alignItems: "center", justifyContent: "space-between", borderBottomWidth: 1, borderBottomColor: C.border, paddingHorizontal: 5 },
  countText: { color: C.text, fontSize: 13 },
  sortButton: { flexDirection: "row", alignItems: "center", gap: 4, paddingVertical: 7 },
  sortText: { color: C.text, fontSize: 13 },
  list: { borderBottomWidth: 0 },
  wordRow: { minHeight: 58, flexDirection: "row", alignItems: "center", gap: 9, paddingLeft: 5, paddingRight: 0, position: "relative" },
  rowDivider: { position: "absolute", left: 46, right: 0, bottom: 0, height: 1 },
  soundButton: { width: 34, height: 34, borderRadius: 17, backgroundColor: "#242424", alignItems: "center", justifyContent: "center", flexShrink: 0 },
  wordMain: { width: "23%", justifyContent: "center", minWidth: 0, flexShrink: 0 },
  wordText: { color: C.text, fontFamily: "serif", fontSize: 14, lineHeight: 18, fontWeight: "700", letterSpacing: -0.2 },
  typePill: { width: 66, minHeight: 24, borderRadius: 14, alignItems: "center", justifyContent: "center", paddingHorizontal: 2, flexShrink: 0 },
  verbPill: { backgroundColor: "#38260F" },
  adjectivePill: { backgroundColor: "#172A36" },
  nounPill: { backgroundColor: "#2A2038" },
  typeText: { fontSize: 10, lineHeight: 13, fontWeight: "500" },
  verbText: { color: "#FFC15C" },
  adjectiveText: { color: "#B9DDF2" },
  nounText: { color: "#D7C2F5" },
  meaningWrap: { flex: 1, minWidth: 0, borderLeftWidth: 1, borderLeftColor: "#4B4741", paddingLeft: 9, justifyContent: "center" },
  meaningText: { color: "#D8D2C9", fontSize: 12, lineHeight: 17 },
  statusSlot: { width: 25, alignItems: "center", justifyContent: "center", flexShrink: 0 },
  dueCircle: { width: 21, height: 21, borderRadius: 11, borderWidth: 2, borderColor: C.orange },
  learningCircle: { width: 21, height: 21, borderRadius: 11, borderWidth: 2, borderColor: "#5B5B5B" },
  masteredCircle: { width: 22, height: 22, borderRadius: 11, backgroundColor: "#65D17B", alignItems: "center", justifyContent: "center" },
  emptyState: { alignItems: "center", paddingVertical: 38 },
  emptyTitle: { color: C.text, fontFamily: "serif", fontSize: 22, marginBottom: 6 },
  emptyText: { color: C.muted, fontSize: 13 },
});
