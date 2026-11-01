import React, { useMemo } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import {
  ArrowRight, Bell, BookOpen, Check, ChevronRight, Flame, Gamepad2,
  Layers, Target, UserRound, BarChart3, Zap, Volume2,
} from "lucide-react-native";
import Svg, {
  Path, Defs, LinearGradient as SvgLinearGradient, Stop, Rect, Ellipse,
} from "react-native-svg";
import * as Speech from "expo-speech";
import { useApp } from "../../context/AppContext";

const C = {
  bg: "#050505",
  panel: "#111111",
  border: "#34302A",
  text: "#F4F0E8",
  muted: "#AAA49B",
  orange: "#FF9D20",
};

const dateKey = (date: Date) =>
  `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;

function QuickAccess({
  icon: Icon,
  label,
  onPress,
}: {
  icon: typeof BookOpen;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [s.quickCard, pressed && s.pressed]}
    >
      <View pointerEvents="none" style={s.quickGloss} />
      <Icon size={27} color={C.text} strokeWidth={1.7} />
      <Text style={s.quickLabel}>{label}</Text>
    </Pressable>
  );
}

function FadeDivider() {
  return (
    <Svg width="100%" height={1} viewBox="0 0 300 1" preserveAspectRatio="none">
      <Defs>
        <SvgLinearGradient id="focusDividerFade" x1="0" y1="0" x2="1" y2="0">
          <Stop offset="0" stopColor="#37332E" stopOpacity="0.82" />
          <Stop offset="0.62" stopColor="#37332E" stopOpacity="0.48" />
          <Stop offset="1" stopColor="#37332E" stopOpacity="0" />
        </SvgLinearGradient>
      </Defs>
      <Path d="M0 0.5 H300" stroke="url(#focusDividerFade)" strokeWidth={1} />
    </Svg>
  );
}

function ChallengeBackdrop() {
  return (
    <Svg pointerEvents="none" style={StyleSheet.absoluteFill} viewBox="0 0 340 170" preserveAspectRatio="none">
      <Defs>
        <SvgLinearGradient id="challengeWarmFade" x1="0" y1="0" x2="1" y2="0">
          <Stop offset="0" stopColor="#4B2B16" stopOpacity="0.72" />
          <Stop offset="0.48" stopColor="#21170F" stopOpacity="0.55" />
          <Stop offset="1" stopColor="#111111" stopOpacity="0.98" />
        </SvgLinearGradient>
      </Defs>
      <Rect x="0" y="0" width="340" height="170" rx="22" fill="url(#challengeWarmFade)" />
      <Ellipse cx="286" cy="86" rx="67" ry="37" transform="rotate(-34 286 86)" fill="none" stroke="#A96B2B" strokeOpacity="0.10" strokeWidth="1.2" />
      <Ellipse cx="286" cy="86" rx="52" ry="27" transform="rotate(-34 286 86)" fill="none" stroke="#B77732" strokeOpacity="0.16" strokeWidth="1.5" />
      <Ellipse cx="286" cy="86" rx="35" ry="17" transform="rotate(-34 286 86)" fill="none" stroke="#D28A3D" strokeOpacity="0.19" strokeWidth="2" />
      <Ellipse cx="286" cy="86" rx="15" ry="7" transform="rotate(-34 286 86)" fill="#E18D34" fillOpacity="0.20" />
    </Svg>
  );
}

function ReviewFadeDivider() {
  return (
    <Svg width="100%" height={1} viewBox="0 0 300 1" preserveAspectRatio="none">
      <Defs>
        <SvgLinearGradient id="reviewWordDividerFade" x1="0" y1="0" x2="1" y2="0">
          <Stop offset="0" stopColor="#37332E" stopOpacity="0.82" />
          <Stop offset="0.62" stopColor="#37332E" stopOpacity="0.48" />
          <Stop offset="1" stopColor="#37332E" stopOpacity="0" />
        </SvgLinearGradient>
      </Defs>
      <Path d="M0 0.5 H300" stroke="url(#reviewWordDividerFade)" strokeWidth={1} />
    </Svg>
  );
}

function StreakOutline() {
  return (
    <View pointerEvents="none" style={s.streakOutline}>
      <Svg width="100%" height="100%" viewBox="0 0 150 130" preserveAspectRatio="none">
        <Defs>
          <SvgLinearGradient id="streakOutlineFade" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor="#E8A35A" stopOpacity="0.92" />
            <Stop offset="0.48" stopColor="#7A4A1E" stopOpacity="0.82" />
            <Stop offset="1" stopColor="#C98340" stopOpacity="0.96" />
          </SvgLinearGradient>
        </Defs>
        <Path
          d="M75 3.9 C89 3.9 108.25 3.25 120 9.1 C131.75 14.95 141.5 27.08 145.5 39 C149.5 50.92 148.25 67.17 144 80.6 C139.75 94.03 132 111.8 120 119.6 C108 127.4 88 127.83 72 127.4 C56 126.97 35.25 124.8 24 117 C12.75 109.2 7 94.03 4.5 80.6 C2 67.17 3.75 48.32 9 36.4 C14.25 24.48 25 14.52 36 9.1 C47 3.68 61 3.9 75 3.9 Z"
          stroke="#E8A35A"
          strokeWidth="6"
          strokeOpacity="0.16"
          fill="none"
        />
        <Path
          d="M75 3.9 C89 3.9 108.25 3.25 120 9.1 C131.75 14.95 141.5 27.08 145.5 39 C149.5 50.92 148.25 67.17 144 80.6 C139.75 94.03 132 111.8 120 119.6 C108 127.4 88 127.83 72 127.4 C56 126.97 35.25 124.8 24 117 C12.75 109.2 7 94.03 4.5 80.6 C2 67.17 3.75 48.32 9 36.4 C14.25 24.48 25 14.52 36 9.1 C47 3.68 61 3.9 75 3.9 Z"
          stroke="url(#streakOutlineFade)"
          strokeWidth="1.8"
          strokeLinejoin="round"
          fill="none"
        />
      </Svg>
    </View>
  );
}export default function HomeScreen() {
  const router = useRouter();
  const { words, grammar } = useApp();
  const now = new Date();
  const today = dateKey(now);


  const activeDays = useMemo(() => {
    const days = new Set<string>();
    [...words, ...grammar].forEach((item) => {
      if (!item.lastReviewedAt) return;
      const date = new Date(item.lastReviewedAt);
      if (!Number.isNaN(date.getTime())) days.add(dateKey(date));
    });
    return days;
  }, [words, grammar]);

  const streak = useMemo(() => {
    const cursor = new Date(now);
    if (!activeDays.has(dateKey(cursor))) cursor.setDate(cursor.getDate() - 1);
    let count = 0;
    while (activeDays.has(dateKey(cursor)) && count < 365) {
      count += 1;
      cursor.setDate(cursor.getDate() - 1);
    }
    return count;
  }, [activeDays, today]);

  const reviewedToday = useMemo(
    () => words.filter((word) => {
      if (!word.lastReviewedAt) return false;
      const date = new Date(word.lastReviewedAt);
      return !Number.isNaN(date.getTime()) && dateKey(date) === today;
    }).length,
    [words, today],
  );

  const week = useMemo(() => {
    const monday = new Date(now);
    monday.setHours(0, 0, 0, 0);
    monday.setDate(monday.getDate() - ((monday.getDay() + 6) % 7));
    return Array.from({ length: 7 }, (_, index) => {
      const date = new Date(monday);
      date.setDate(monday.getDate() + index);
      const key = dateKey(date);
      return {
        label: ["M", "T", "W", "T", "F", "S", "S"][index],
        done: activeDays.has(key),
        today: key === today,
      };
    });
  }, [activeDays, today]);

  const lesson = grammar.find((item) => item.status !== "mastered");
  const goQuiz = () => router.push("/quiz-setup");
  const reviewWords = words.slice(0, 3);

  const speakWord = (value: string) => {
    Speech.stop();
    Speech.speak(value, { language: "es-ES", rate: 0.88 });
  };

  return (
    <View style={s.screen}>
      <SafeAreaView edges={["top"]} style={s.safe}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={s.content}
        >
          <View style={s.topBar}>
            <Text style={s.logo}>Parables<Text style={s.slash}>/</Text></Text>
            <View style={s.topActions}>
              <Pressable style={s.bell} accessibilityLabel="Notifications">
                <Bell size={22} color={C.text} />
                <View style={s.dot} />
              </Pressable>
              <Pressable style={s.avatar} onPress={() => router.push("/(tabs)/profile")}>
                <UserRound size={21} color={C.text} />
              </Pressable>
            </View>
          </View>

          <View style={s.greetingRow}>
            <View style={s.greetingCopy}>
              <Text style={s.greeting}>Hola, Yash</Text>
              <Svg width={76} height={14} viewBox="0 0 76 14" style={s.curve}>
                <Defs>
                  <SvgLinearGradient id="signatureFade" x1="0" y1="0" x2="1" y2="0">
                    <Stop offset="0" stopColor={C.orange} stopOpacity="1" />
                    <Stop offset="0.42" stopColor={C.orange} stopOpacity="0.92" />
                    <Stop offset="0.78" stopColor={C.orange} stopOpacity="0.48" />
                    <Stop offset="1" stopColor={C.orange} stopOpacity="0" />
                  </SvgLinearGradient>
                </Defs>
                <Path
                  d="M1 10.8 C 17 4.0, 35 1.8, 53 3.0 C 62 3.7, 69 4.7, 74 5.3 C 68 5.0, 61 4.5, 53 4.1 C 35 3.0, 17 6.8, 1 12.5 Z"
                  fill="#FF9D20"
                />
              </Svg>
              <Text style={s.subGreeting}>Let's learn some Spanish today.</Text>
            </View>
            <View style={s.streak}>
              <StreakOutline />
              <View style={s.streakFlameCutout}><Flame size={32} color={C.orange} fill={C.orange} /></View>
              <Text style={s.streakNumber}>{streak}</Text>
              <Text style={s.streakLabel}>day streak</Text>
            </View>
          </View>

          <View style={s.weekRow}>
            {week.map((day, index) => (
              <View key={`${day.label}-${index}`} style={s.weekDay}>
                <Text style={[s.weekLabel, day.today && s.weekLabelToday]}>{day.label}</Text>
                <View style={[
                  s.weekCircle,
                  day.done && s.weekDone,
                  day.today && !day.done && s.weekToday,
                ]}>
                  {day.done ? <Check size={16} color="#170F04" strokeWidth={3} /> : null}
                </View>
              </View>
            ))}
          </View>

          <Pressable
            onPress={() => lesson ? router.push(`/grammar-detail?id=${lesson.id}`) : router.push("/(tabs)/grammar")}
            style={({ pressed }) => [s.lessonCard, pressed && s.pressed]}
          >
            <View style={s.lessonContent}>
              <Text style={s.lessonEyebrow}>Continue learning</Text>
              <Text numberOfLines={1} adjustsFontSizeToFit style={s.lessonTitle}>
                {lesson?.grammarPoint ?? "Present tense"}
              </Text>
              <Text numberOfLines={2} style={s.lessonDescription}>
                {lesson?.meaning ?? "Talk about habits and facts"}
              </Text>
              <View style={s.lessonBottom}>
                <View style={s.lessonProgress}>
                  <Text style={s.lessonMeta}>Lesson 3 of 6  ·  8 min</Text>
                  <View style={s.track}><View style={s.fill} /></View>
                </View>
                <View style={s.continueButton}>
                  <Text style={s.continueText}>Continue</Text>
                  <ArrowRight size={17} color="#170F04" />
                </View>
              </View>
            </View>
          </Pressable>

          <View style={s.sectionHead}>
            <View style={s.sectionTitleWrap}>
              <Target size={19} color={C.orange} strokeWidth={2.1} />
              <Text style={s.sectionTitle}>Today's focus</Text>
            </View>
            <Text style={s.sectionMeta}>0 of 3</Text>
          </View>

          <View style={s.focusList}>
            <Pressable onPress={goQuiz} style={s.focusRow}>
              <View style={s.focusDone}><Check size={17} color="#170F04" strokeWidth={3} /></View>
              <Text style={[s.focusText, s.completed]}>Review 20 words</Text>
              <ChevronRight size={19} color={C.text} />
              <View pointerEvents="none" style={s.focusDivider}><FadeDivider /></View>
            </Pressable>
            <Pressable onPress={() => router.push("/add-word")} style={s.focusRow}>
              <View style={s.focusEmpty} />
              <Text style={s.focusText}>Learn 10 new words</Text>
              <ChevronRight size={19} color={C.text} />
              <View pointerEvents="none" style={s.focusDivider}><FadeDivider /></View>
            </Pressable>
            <Pressable onPress={() => router.push("/(tabs)/grammar")} style={s.focusRow}>
              <View style={s.focusEmpty} />
              <Text style={s.focusText}>Practice grammar (5 min)</Text>
              <ChevronRight size={19} color={C.text} />
              <View pointerEvents="none" style={s.focusDivider}><FadeDivider /></View>
            </Pressable>
          </View>

          <Text style={s.quickHeading}>Quick access</Text>
          <View style={s.quickRow}>
            <QuickAccess icon={BookOpen} label="Vocabulary" onPress={() => router.push("/(tabs)/words")} />
            <QuickAccess icon={Gamepad2} label="Quiz" onPress={goQuiz} />
            <QuickAccess icon={Layers} label="Grammar" onPress={() => router.push("/(tabs)/grammar")} />
            <QuickAccess icon={BarChart3} label="Progress" onPress={() => router.push("/(tabs)/profile")} />
          </View>

          {/* Scroll continuation based on the supplied second reference screen. */}
          <View style={s.lowerSection}>
            <View style={s.pathHead}>
              <Text style={s.serifSectionTitle}>Your path</Text>
              <Pressable onPress={() => router.push("/(tabs)/grammar")} style={s.pathLink}>
                <Text style={s.pathLevel}>A1</Text>
                <Text style={s.pathLevelName}>Beginner</Text>
                <ChevronRight size={18} color={C.text} />
              </Pressable>
            </View>
            <View style={s.pathProgressRow}>
              <View style={s.pathTrack}><View style={s.pathFill} /></View>
              <Text style={s.pathPercent}>28% complete</Text>
            </View>
          </View>

          <View style={s.lowerSection}>
            <Pressable onPress={goQuiz} style={s.reviewHeading}>
              <View style={s.reviewTitleWrap}>
                <Zap size={19} color="#EFB45C" strokeWidth={1.8} />
                <Text style={s.serifSectionTitle}>Due for review</Text>
              </View>
              <View style={s.reviewCount}>
                <Text style={s.reviewCountText}>28 words</Text>
                <ChevronRight size={18} color={C.muted} />
              </View>
            </Pressable>
            <View style={s.reviewList}>
              {(reviewWords.length ? reviewWords : [
                { id: "sample-cafe", word: "café", meaning: "coffee", tags: ["noun"] },
                { id: "sample-viajar", word: "viajar", meaning: "to travel", tags: ["verb"] },
                { id: "sample-casa", word: "casa", meaning: "house", tags: ["noun"] },
              ]).map((word: any, index: number) => (
                <Pressable
                  key={word.id}
                  onPress={() => word.id.startsWith("sample-") ? goQuiz() : router.push(`/word-detail?id=${word.id}`)}
                  style={s.reviewWordRow}
                >
                  <Pressable
                    onPress={(event) => {
                      event.stopPropagation?.();
                      speakWord(word.word);
                    }}
                    style={s.soundButton}
                  >
                    <Volume2 size={17} color="#D5D0C8" strokeWidth={1.8} />
                  </Pressable>
                  <Text numberOfLines={1} style={s.reviewWord}>{word.word}</Text>
                  <Text numberOfLines={1} style={s.wordType}>
                    {word.tags?.[0] ?? (index === 1 ? "verb" : "noun")}
                  </Text>
                  <Text numberOfLines={1} style={s.wordMeaning}>{word.meaning}</Text>
                  {index < 2 ? <View pointerEvents="none" style={s.reviewDivider}><ReviewFadeDivider /></View> : null}
                </Pressable>
              ))}
            </View>
          </View>

          <View style={s.challengeCard}>
            <ChallengeBackdrop />
            <View style={s.challengeTop}>
              <View style={s.challengeIcon}>
                <Target size={42} color={C.orange} strokeWidth={1.8} />
              </View>
              <View style={s.challengeCopy}>
                <Text style={s.challengeTitle}>Daily challenge</Text>
                <Text style={s.challengeDescription}>A 5-minute mix: words, grammar and usage.</Text>
              </View>
            </View>
            <Pressable onPress={goQuiz} style={({ pressed }) => [s.challengeButton, pressed && s.pressed]}>
              <Text style={s.challengeButtonText}>Start Challenge</Text>
              <ChevronRight size={20} color="#170F04" strokeWidth={2.4} />
            </Pressable>
          </View>

          <View style={s.lowerSection}>
            <View style={s.progressHeading}>
              <View style={s.reviewTitleWrap}>
                <BarChart3 size={21} color={C.orange} strokeWidth={2.4} />
                <Text style={s.sectionTitle}>Your progress</Text>
              </View>
              <Text style={s.progressPeriod}>This week</Text>
            </View>
            <View style={s.statsRow}>
              <View style={s.stat}>
                <Text style={s.statValue}>238</Text>
                <Text style={s.statLabel}>words learned</Text>
              </View>
              <View style={s.statDivider} />
              <View style={s.stat}>
                <View style={s.accuracyLine}>
                  <Text style={s.statValue}>87%</Text>
                  <Text style={s.upArrow}>▲</Text>
                </View>
                <Text style={s.statLabel}>accuracy</Text>
              </View>
              <View style={s.statDivider} />
              <View style={s.stat}>
                <Text style={s.statValue}>14 <Text style={s.statTotal}>/ 50</Text></Text>
                <Text style={s.statLabel}>grammar lessons</Text>
              </View>
            </View>
          </View>

          <View style={s.quoteBlock}>
            <Text style={s.quoteMark}>“</Text>
            <Text style={s.quoteText}>Un pequeño progreso cada día{"\n"}hace una gran diferencia.</Text>
            <Svg width={96} height={16} viewBox="0 0 96 16">
              <Defs>
                <SvgLinearGradient id="quoteSignatureFade" x1="0" y1="0" x2="1" y2="0">
                  <Stop offset="0" stopColor={C.orange} stopOpacity="0.98" />
                  <Stop offset="0.48" stopColor={C.orange} stopOpacity="0.82" />
                  <Stop offset="0.82" stopColor={C.orange} stopOpacity="0.38" />
                  <Stop offset="1" stopColor={C.orange} stopOpacity="0" />
                </SvgLinearGradient>
              </Defs>
              <Path
                d="M2 11.8 C 23 3.2, 49 2.1, 69 5 C 79 6.4, 87 7.2, 94 7.4
                   C 86 8.2, 78 7.8, 68 6.4 C 48 4, 23 6.3, 2 13.4 Z"
                fill="#FF9D20"
              />
            </Svg>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.bg },
  safe: { flex: 1 },
  content: { paddingHorizontal: 24, paddingTop: 2, paddingBottom: 88, flexGrow: 1 },
  topBar: { height: 42, flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 0 },
  logo: { color: C.text, fontSize: 24, fontWeight: "800", letterSpacing: -0.8, lineHeight: 29 },
  slash: { color: C.orange, fontSize: 24, fontWeight: "500" },
  topActions: { flexDirection: "row", alignItems: "center", gap: 17 },
  bell: { width: 32, height: 36, alignItems: "center", justifyContent: "center" },
  dot: { position: "absolute", right: 3, top: 3, width: 8, height: 8, borderRadius: 4, backgroundColor: C.orange },
  avatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: "#201B15", borderWidth: 1, borderColor: "#59432A", alignItems: "center", justifyContent: "center" },
  greetingRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 5 },
  greetingCopy: { flex: 1, paddingRight: 5 },
  greeting: { color: C.text, fontFamily: "serif", fontSize: 32, lineHeight: 38 },
  curve: { marginTop: -1, marginBottom: 0, marginLeft: -1 },
  subGreeting: { color: C.muted, fontSize: 14, lineHeight: 20 },
  streak: { width: 112, height: 98, alignItems: "center", justifyContent: "center", backgroundColor: "transparent", marginRight: 0, position: "relative" },
  streakFlameCutout: { position: "absolute", top: -12, zIndex: 3, width: 42, height: 42, borderRadius: 21, backgroundColor: C.bg, alignItems: "center", justifyContent: "center" },
  streakOutline: { position: "absolute", width: 112, height: 98, left: 0, top: 0 },
  streakNumber: { color: C.text, fontSize: 32, fontWeight: "700", marginTop: -3, lineHeight: 38 },
  streakLabel: { color: C.muted, fontSize: 12 },
  weekRow: { flexDirection: "row", justifyContent: "space-between", paddingHorizontal: 10, marginBottom: 24 },
  weekDay: { alignItems: "center", gap: 5 },
  weekLabel: { color: C.muted, fontSize: 12, lineHeight: 18, fontWeight: "500" },
  weekLabelToday: { color: C.text },
  weekCircle: { width: 25, height: 25, borderRadius: 13, borderWidth: 1.8, borderColor: "#343434", alignItems: "center", justifyContent: "center" },
  weekDone: { backgroundColor: C.orange, borderColor: C.orange },
  weekToday: { borderColor: C.orange, borderWidth: 2.5 },
  lessonCard: { minHeight: 154, borderRadius: 20, overflow: "hidden", borderWidth: 1, borderColor: "#76552F", backgroundColor: "#111111", marginBottom: 20, justifyContent: "center" },
  lessonContent: { paddingHorizontal: 18, paddingVertical: 16 },
  lessonEyebrow: { color: C.muted, fontSize: 13, lineHeight: 18, marginBottom: 6 },
  lessonTitle: { color: "#FFF8ED", fontFamily: "serif", fontSize: 24, fontWeight: "700", lineHeight: 29 },
  lessonDescription: { color: C.muted, fontSize: 14, lineHeight: 20, marginTop: 5 },
  lessonBottom: { flexDirection: "row", alignItems: "flex-end", justifyContent: "space-between", gap: 10, marginTop: 16 },
  lessonProgress: { flex: 1 },
  lessonMeta: { color: C.muted, fontSize: 12, lineHeight: 15, marginBottom: 8 },
  track: { height: 5, borderRadius: 5, backgroundColor: "#39342D", overflow: "hidden" },
  fill: { width: "56%", height: "100%", backgroundColor: C.orange, borderRadius: 5 },
  continueButton: { minWidth: 108, height: 40, borderRadius: 21, backgroundColor: C.orange, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 7 },
  continueText: { color: "#170F04", fontSize: 14, fontWeight: "600" },
  sectionHead: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 3 },
  sectionTitleWrap: { flexDirection: "row", alignItems: "center", gap: 9 },
  sectionTitle: { color: C.text, fontSize: 20, lineHeight: 24, fontWeight: "700" },
  sectionMeta: { color: C.muted, fontSize: 13, lineHeight: 18 },
  focusList: { marginBottom: 18 },
  focusRow: { minHeight: 44, flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 6, position: "relative" },
  focusDone: { width: 23, height: 23, borderRadius: 12, backgroundColor: C.orange, alignItems: "center", justifyContent: "center" },
  focusEmpty: { width: 23, height: 23, borderRadius: 12, borderWidth: 1.8, borderColor: "#555555" },
  focusText: { flex: 1, color: C.text, fontSize: 16, lineHeight: 22 },
  completed: { color: C.muted, textDecorationLine: "line-through" },
  focusDivider: { position: "absolute", bottom: 0, left: 39, right: 0, height: 1 },
  quickHeading: { color: C.muted, fontSize: 13, lineHeight: 21, marginBottom: 10 },
  quickRow: { flexDirection: "row", gap: 9, marginBottom: 0 },
  quickCard: {
    flex: 1, aspectRatio: 1, maxHeight: 104, borderRadius: 17, borderWidth: 1,
    borderColor: "#484848", borderTopColor: "#69635B", backgroundColor: "#101010",
    alignItems: "center", justifyContent: "center", gap: 6, paddingHorizontal: 2,
    shadowColor: "#FFFFFF", shadowOffset: { width: 0, height: -1 }, shadowOpacity: 0.08,
    shadowRadius: 5, elevation: 2, overflow: "hidden",
  },
  quickGloss: { position: "absolute", top: 1, left: 9, right: 9, height: 1, backgroundColor: "rgba(255,255,255,0.20)" },
  quickLabel: { color: C.text, fontSize: 12, lineHeight: 15, textAlign: "center" },
  lowerSection: { marginTop: 24 },
  pathHead: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  serifSectionTitle: { color: C.text, fontSize: 20, lineHeight: 24, fontWeight: "700" },
  pathLink: { flexDirection: "row", alignItems: "center", gap: 5 },
  pathLevel: { color: C.orange, fontSize: 14, lineHeight: 20, fontWeight: "600" },
  pathLevelName: { color: C.muted, fontSize: 14, lineHeight: 20 },
  pathProgressRow: { flexDirection: "row", alignItems: "center", gap: 14, marginTop: 12 },
  pathTrack: { flex: 1, height: 11, borderRadius: 8, backgroundColor: "#292A2D", overflow: "hidden" },
  pathFill: { width: "28%", height: "100%", borderRadius: 8, backgroundColor: C.orange },
  pathPercent: { color: C.muted, fontSize: 13, lineHeight: 18 },
  reviewHeading: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 7 },
  reviewTitleWrap: { flexDirection: "row", alignItems: "center", gap: 9 },
  reviewCount: { flexDirection: "row", alignItems: "center", gap: 4 },
  reviewCountText: { color: C.muted, fontSize: 13, lineHeight: 16 },
  reviewList: { paddingHorizontal: 5 },
  reviewWordRow: { minHeight: 49, flexDirection: "row", alignItems: "center", gap: 12, position: "relative" },
  soundButton: { width: 34, height: 34, borderRadius: 17, backgroundColor: "#252525", alignItems: "center", justifyContent: "center" },
  reviewWord: { color: C.text, fontFamily: "serif", fontSize: 20, lineHeight: 24, fontWeight: "700", minWidth: 62 },
  wordType: { color: C.muted, fontSize: 13, lineHeight: 16, flex: 1 },
  wordMeaning: { color: C.muted, fontSize: 14, lineHeight: 16, textAlign: "right", maxWidth: "32%" },
  reviewDivider: { position: "absolute", left: 46, right: 0, bottom: 0, height: 1 },
  challengeCard: {
    marginTop: 22, minHeight: 168, borderRadius: 22, borderWidth: 1,
    borderColor: "#3E342B", backgroundColor: "#17120E", padding: 17,
    overflow: "hidden", justifyContent: "space-between",
  },
  challengeDecor: { position: "absolute", right: 8, top: 15, opacity: 0.12, transform: [{ rotate: "-24deg" }] },
  challengeTop: { flexDirection: "row", alignItems: "center", gap: 13 },
  challengeIcon: { width: 64, height: 64, alignItems: "center", justifyContent: "center" },
  challengeCopy: { flex: 1, paddingRight: 6 },
  challengeTitle: { color: C.text, fontSize: 20, lineHeight: 24, fontWeight: "700", marginBottom: 5 },
  challengeDescription: { color: C.muted, fontSize: 14, lineHeight: 20, maxWidth: 215 },
  challengeButton: { alignSelf: "center", minWidth: 184, height: 46, borderRadius: 24, backgroundColor: C.orange, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 9, marginTop: 15, paddingHorizontal: 20 },
  challengeButtonText: { color: "#170F04", fontSize: 14, fontWeight: "600" },
  progressHeading: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 18 },
  progressPeriod: { color: C.muted, fontSize: 13, lineHeight: 18 },
  statsRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  stat: { flex: 1, alignItems: "center", gap: 3 },
  statValue: { color: C.text, fontSize: 24, lineHeight: 29, fontWeight: "700" },
  statTotal: { color: C.muted, fontSize: 16, fontWeight: "400" },
  statLabel: { color: C.muted, fontSize: 12, lineHeight: 17, textAlign: "center" },
  statDivider: { width: 1, height: 47, backgroundColor: "#5A5148" },
  accuracyLine: { flexDirection: "row", alignItems: "center", gap: 5 },
  upArrow: { color: "#55B96B", fontSize: 11 },
  quoteBlock: { alignItems: "center", marginTop: 28, marginBottom: 8 },
  quoteMark: { alignSelf: "flex-start", marginLeft: 45, color: C.orange, fontFamily: "serif", fontSize: 32, lineHeight: 34 },
  quoteText: { color: "#EEE8DF", fontFamily: "serif", fontStyle: "italic", fontSize: 20, lineHeight: 28, textAlign: "center", marginTop: -1, marginBottom: 10 },
  pressed: { opacity: 0.76 },
});
