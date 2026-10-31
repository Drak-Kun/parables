import React, { useMemo } from "react";
import {
  ActivityIndicator,
  ImageBackground,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  ArrowRight,
  BookOpen,
  Brain,
  Flame,
  Headphones,
  NotebookText,
  Plus,
  RotateCcw,
  Sparkles,
  Target,
  Volume2,
} from "lucide-react-native";
import * as Speech from "expo-speech";
import { useApp } from "../../context/AppContext";
import { DEFAULT_DAILY_GOAL_TARGET, getDailyGoalTarget } from "../../storage";
import { useEffect, useState } from "react";

const theme = {
  background: "#090909",
  surface: "#141414",
  surfaceRaised: "#1B1A18",
  border: "#2C2923",
  text: "#F5F1E8",
  muted: "#A9A296",
  gold: "#E8B65A",
  goldSoft: "#3B2D18",
  green: "#8CC69A",
};

const dateKey = (date: Date) =>
  `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;

function SectionHeading({
  title,
  action,
  onAction,
}: {
  title: string;
  action?: string;
  onAction?: () => void;
}) {
  return (
    <View style={styles.sectionHeading}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {action && onAction ? (
        <Pressable onPress={onAction} hitSlop={8} style={styles.sectionAction}>
          <Text style={styles.sectionActionText}>{action}</Text>
          <ArrowRight size={14} color={theme.gold} />
        </Pressable>
      ) : null}
    </View>
  );
}

function QuickAction({
  icon: Icon,
  label,
  detail,
  onPress,
}: {
  icon: typeof BookOpen;
  label: string;
  detail: string;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.quickAction, pressed && styles.pressed]}>
      <View style={styles.quickIcon}>
        <Icon size={20} color={theme.gold} strokeWidth={1.9} />
      </View>
      <Text style={styles.quickLabel}>{label}</Text>
      <Text style={styles.quickDetail}>{detail}</Text>
    </Pressable>
  );
}

export default function HomeScreen() {
  const router = useRouter();
  const { words, grammar, isLoading } = useApp();
  const [goalTarget, setGoalTarget] = useState(DEFAULT_DAILY_GOAL_TARGET);

  useEffect(() => {
    let active = true;
    getDailyGoalTarget()
      .then((value) => {
        if (active) setGoalTarget(value);
      })
      .catch(() => {
        if (active) setGoalTarget(DEFAULT_DAILY_GOAL_TARGET);
      });
    return () => {
      active = false;
    };
  }, []);

  const today = new Date();
  const todayKey = dateKey(today);
  const reviewedToday = useMemo(
    () =>
      words.filter((word) => {
        if (!word.lastReviewedAt) return false;
        const reviewed = new Date(word.lastReviewedAt);
        return !Number.isNaN(reviewed.getTime()) && dateKey(reviewed) === todayKey;
      }).length,
    [words, todayKey]
  );

  const streak = useMemo(() => {
    const activeDays = new Set<string>();
    [...words, ...grammar].forEach((item) => {
      if (!item.lastReviewedAt) return;
      const date = new Date(item.lastReviewedAt);
      if (!Number.isNaN(date.getTime())) activeDays.add(dateKey(date));
    });

    const cursor = new Date(today);
    if (!activeDays.has(dateKey(cursor))) cursor.setDate(cursor.getDate() - 1);
    let count = 0;
    while (activeDays.has(dateKey(cursor)) && count < 365) {
      count += 1;
      cursor.setDate(cursor.getDate() - 1);
    }
    return count;
  }, [words, grammar, todayKey]);

  const progress = Math.min(reviewedToday / Math.max(goalTarget, 1), 1);
  const greeting =
    today.getHours() < 12 ? "Good morning" : today.getHours() < 18 ? "Good afternoon" : "Good evening";
  const nextLesson = grammar.find((item) => item.status !== "mastered");
  const recentWords = [...words].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 3);

  const openQuiz = () => router.push("/quiz-setup");
  const speak = (word: string) =>
    Speech.speak(word, { language: "es-ES", rate: 0.88 });

  if (isLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color={theme.gold} size="large" />
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <SafeAreaView edges={["top"]} style={styles.safeArea}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.topBar}>
            <View>
              <Text style={styles.eyebrow}>LEXO · ESPAÑOL</Text>
              <Text style={styles.greeting}>{greeting} <Text style={styles.wave}>¡Hola!</Text></Text>
              <Text style={styles.subGreeting}>A little Spanish, every day.</Text>
            </View>
            <View style={styles.streakPill}>
              <Flame size={16} color={theme.gold} fill={theme.gold} />
              <Text style={styles.streakNumber}>{streak}</Text>
              <Text style={styles.streakLabel}>day streak</Text>
            </View>
          </View>

          <ImageBackground
            source={require("../../assets/spanish-home-hero.jpg")}
            resizeMode="cover"
            imageStyle={styles.heroImage}
            style={styles.hero}
          >
            <View style={styles.heroShade} />
            <View style={styles.heroContent}>
              <View style={styles.heroTag}>
                <Sparkles size={12} color={theme.gold} />
                <Text style={styles.heroTagText}>YOUR SPANISH JOURNEY</Text>
              </View>
              <Text style={styles.heroTitle}>Make Spanish{'\n'}part of your day.</Text>
              <Text style={styles.heroCopy}>Build vocabulary. Understand grammar. Remember what you learn.</Text>
              <Pressable onPress={() => router.push("/grammar")} style={styles.heroButton}>
                <Text style={styles.heroButtonText}>Continue learning</Text>
                <ArrowRight size={16} color="#17120A" />
              </Pressable>
            </View>
          </ImageBackground>

          <View style={styles.goalCard}>
            <View style={styles.goalTop}>
              <View>
                <Text style={styles.cardEyebrow}>DAILY WORD GOAL</Text>
                <Text style={styles.goalTitle}>A steady rhythm wins.</Text>
              </View>
              <View style={styles.goalIcon}>
                <Target size={19} color={theme.gold} />
              </View>
            </View>
            <View style={styles.goalStats}>
              <Text style={styles.goalCount}>{reviewedToday}<Text style={styles.goalTotal}> / {goalTarget}</Text></Text>
              <Text style={styles.goalPercent}>{Math.round(progress * 100)}% complete</Text>
            </View>
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
            </View>
            <Text style={styles.goalFootnote}>
              {reviewedToday >= goalTarget
                ? "Daily target reached. ¡Buen trabajo!"
                : `${Math.max(goalTarget - reviewedToday, 0)} more reviewed ${goalTarget - reviewedToday === 1 ? "word" : "words"} to reach your target.`}
            </Text>
          </View>

          <SectionHeading title="Pick up where you left off" action="Grammar" onAction={() => router.push("/grammar")} />
          <Pressable
            onPress={() => nextLesson ? router.push(`/grammar-detail?id=${nextLesson.id}`) : router.push("/grammar")}
            style={({ pressed }) => [styles.continueCard, pressed && styles.pressed]}
          >
            <View style={styles.lessonBadge}><NotebookText size={18} color={theme.gold} /></View>
            <View style={styles.lessonCopy}>
              <Text style={styles.cardEyebrow}>GRAMMAR · SPANISH FOUNDATIONS</Text>
              <Text style={styles.lessonTitle}>{nextLesson?.grammarPoint ?? "Start with the foundations"}</Text>
              <Text style={styles.lessonSubtitle}>
                {nextLesson?.meaning ?? "Explore essential Spanish grammar and build your base."}
              </Text>
            </View>
            <ArrowRight size={19} color={theme.gold} />
          </Pressable>

          <SectionHeading title="Your shortcuts" />
          <View style={styles.quickGrid}>
            <QuickAction icon={Plus} label="New words" detail="Grow your list" onPress={() => router.push("/add-word")} />
            <QuickAction icon={RotateCcw} label="Review" detail="Revisit words" onPress={openQuiz} />
            <QuickAction icon={NotebookText} label="Grammar" detail="Learn the rules" onPress={() => router.push("/grammar")} />
            <QuickAction icon={Brain} label="Practice" detail="Test yourself" onPress={openQuiz} />
          </View>

          <SectionHeading title="Your vocabulary" action="See all" onAction={() => router.push("/words")} />
          {recentWords.length > 0 ? (
            <View style={styles.wordsCard}>
              {recentWords.map((word, index) => (
                <Pressable
                  key={word.id}
                  onPress={() => router.push(`/word-detail?id=${word.id}`)}
                  style={[styles.wordRow, index > 0 && styles.wordDivider]}
                >
                  <View style={styles.wordText}>
                    <Text style={styles.spanishWord}>{word.word}</Text>
                    <Text style={styles.wordMeaning}>{word.meaning}</Text>
                  </View>
                  <Pressable onPress={() => speak(word.word)} hitSlop={10} style={styles.soundButton}>
                    <Volume2 size={17} color={theme.gold} />
                  </Pressable>
                </Pressable>
              ))}
            </View>
          ) : (
            <View style={styles.emptyCard}>
              <BookOpen size={21} color={theme.gold} />
              <View style={styles.emptyCopy}>
                <Text style={styles.emptyTitle}>Your word collection starts here</Text>
                <Text style={styles.emptySubtitle}>Add a word you want to remember, then practice it whenever you like.</Text>
              </View>
              <Pressable onPress={() => router.push("/add-word")} hitSlop={8}>
                <Plus size={20} color={theme.gold} />
              </Pressable>
            </View>
          )}

          <SectionHeading title="Learning path" action="Explore" onAction={() => router.push("/grammar")} />
          <Pressable onPress={() => router.push("/grammar")} style={({ pressed }) => [styles.pathCard, pressed && styles.pressed]}>
            <View style={styles.pathTop}>
              <View style={styles.levelPill}><Text style={styles.levelText}>A1 · BEGINNER</Text></View>
              <Text style={styles.pathStatus}>FOUNDATIONS</Text>
            </View>
            <Text style={styles.pathTitle}>Start speaking with confidence.</Text>
            <Text style={styles.pathDescription}>Build the essentials: pronunciation, simple sentences, articles, and everyday verbs.</Text>
            <View style={styles.pathBottom}>
              <Text style={styles.pathLink}>Explore beginner grammar</Text>
              <ArrowRight size={15} color={theme.gold} />
            </View>
          </Pressable>

          <View style={styles.bottomNote}>
            <Headphones size={15} color={theme.muted} />
            <Text style={styles.bottomNoteText}>Small steps. Lasting progress.</Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: theme.background },
  safeArea: { flex: 1 },
  loading: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: theme.background },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 34 },
  topBar: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingTop: 10, paddingBottom: 18 },
  eyebrow: { color: theme.gold, fontSize: 10, fontWeight: "800", letterSpacing: 2 },
  greeting: { color: theme.text, fontSize: 25, fontWeight: "800", marginTop: 7, letterSpacing: -0.6 },
  wave: { color: theme.gold },
  subGreeting: { color: theme.muted, fontSize: 13, marginTop: 4 },
  streakPill: { flexDirection: "row", alignItems: "center", backgroundColor: theme.surfaceRaised, borderColor: theme.border, borderWidth: 1, borderRadius: 30, paddingHorizontal: 11, paddingVertical: 9, gap: 5 },
  streakNumber: { color: theme.text, fontSize: 14, fontWeight: "800" },
  streakLabel: { color: theme.muted, fontSize: 10, fontWeight: "600" },
  hero: { height: 235, borderRadius: 22, overflow: "hidden", justifyContent: "flex-end", marginBottom: 18, backgroundColor: "#282117" },
  heroImage: { borderRadius: 22 },
  heroShade: { ...StyleSheet.absoluteFill, backgroundColor: "rgba(0,0,0,0.43)" },
  heroContent: { padding: 19 },
  heroTag: { flexDirection: "row", alignItems: "center", gap: 6, alignSelf: "flex-start", backgroundColor: "rgba(10,10,10,0.68)", paddingHorizontal: 9, paddingVertical: 6, borderRadius: 20, marginBottom: 10 },
  heroTagText: { color: theme.gold, fontSize: 9, fontWeight: "800", letterSpacing: 1.1 },
  heroTitle: { color: "#FFFFFF", fontSize: 28, fontWeight: "800", lineHeight: 31, letterSpacing: -0.7 },
  heroCopy: { color: "#E8E2D7", fontSize: 12, lineHeight: 17, maxWidth: 280, marginTop: 7 },
  heroButton: { flexDirection: "row", alignItems: "center", alignSelf: "flex-start", gap: 10, backgroundColor: theme.gold, borderRadius: 24, paddingHorizontal: 15, paddingVertical: 10, marginTop: 13 },
  heroButtonText: { color: "#17120A", fontSize: 12, fontWeight: "800" },
  goalCard: { backgroundColor: theme.surface, borderColor: theme.border, borderWidth: 1, borderRadius: 18, padding: 16, marginBottom: 25 },
  goalTop: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  cardEyebrow: { color: theme.gold, fontSize: 9, fontWeight: "800", letterSpacing: 1.15 },
  goalTitle: { color: theme.text, fontSize: 16, fontWeight: "700", marginTop: 5 },
  goalIcon: { width: 36, height: 36, borderRadius: 12, backgroundColor: theme.goldSoft, alignItems: "center", justifyContent: "center" },
  goalStats: { flexDirection: "row", alignItems: "baseline", justifyContent: "space-between", marginTop: 15 },
  goalCount: { color: theme.text, fontSize: 27, fontWeight: "800" },
  goalTotal: { color: theme.muted, fontSize: 15, fontWeight: "600" },
  goalPercent: { color: theme.gold, fontSize: 11, fontWeight: "700" },
  progressTrack: { height: 7, borderRadius: 8, backgroundColor: "#302B22", overflow: "hidden", marginTop: 9 },
  progressFill: { height: "100%", borderRadius: 8, backgroundColor: theme.gold },
  goalFootnote: { color: theme.muted, fontSize: 11, marginTop: 9 },
  sectionHeading: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 7, marginBottom: 12 },
  sectionTitle: { color: theme.text, fontSize: 17, fontWeight: "800", letterSpacing: -0.25 },
  sectionAction: { flexDirection: "row", alignItems: "center", gap: 4 },
  sectionActionText: { color: theme.gold, fontSize: 11, fontWeight: "700" },
  continueCard: { flexDirection: "row", alignItems: "center", backgroundColor: theme.surface, borderColor: theme.border, borderWidth: 1, borderRadius: 17, padding: 14, gap: 12, marginBottom: 24 },
  lessonBadge: { width: 42, height: 42, borderRadius: 14, backgroundColor: theme.goldSoft, alignItems: "center", justifyContent: "center" },
  lessonCopy: { flex: 1 },
  lessonTitle: { color: theme.text, fontSize: 15, fontWeight: "700", marginTop: 5 },
  lessonSubtitle: { color: theme.muted, fontSize: 11, marginTop: 4, lineHeight: 15 },
  quickGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 25 },
  quickAction: { width: "48%", flexGrow: 1, backgroundColor: theme.surface, borderColor: theme.border, borderWidth: 1, borderRadius: 16, padding: 13, minHeight: 112 },
  pressed: { opacity: 0.78, transform: [{ scale: 0.99 }] },
  quickIcon: { width: 34, height: 34, borderRadius: 11, backgroundColor: theme.goldSoft, alignItems: "center", justifyContent: "center", marginBottom: 9 },
  quickLabel: { color: theme.text, fontSize: 13, fontWeight: "700" },
  quickDetail: { color: theme.muted, fontSize: 10, marginTop: 4 },
  wordsCard: { backgroundColor: theme.surface, borderColor: theme.border, borderWidth: 1, borderRadius: 17, paddingHorizontal: 14, marginBottom: 25 },
  wordRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: 13 },
  wordDivider: { borderTopWidth: 1, borderTopColor: theme.border },
  wordText: { flex: 1 },
  spanishWord: { color: theme.text, fontSize: 16, fontWeight: "800" },
  wordMeaning: { color: theme.muted, fontSize: 11, marginTop: 3 },
  soundButton: { width: 34, height: 34, borderRadius: 12, backgroundColor: theme.goldSoft, alignItems: "center", justifyContent: "center" },
  emptyCard: { flexDirection: "row", alignItems: "center", gap: 12, backgroundColor: theme.surface, borderColor: theme.border, borderWidth: 1, borderRadius: 17, padding: 15, marginBottom: 25 },
  emptyCopy: { flex: 1 },
  emptyTitle: { color: theme.text, fontSize: 13, fontWeight: "700" },
  emptySubtitle: { color: theme.muted, fontSize: 10, lineHeight: 15, marginTop: 4 },
  pathCard: { backgroundColor: theme.surface, borderColor: theme.border, borderWidth: 1, borderRadius: 18, padding: 16, marginBottom: 20 },
  pathTop: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  levelPill: { backgroundColor: theme.goldSoft, borderRadius: 20, paddingHorizontal: 10, paddingVertical: 6 },
  levelText: { color: theme.gold, fontSize: 9, fontWeight: "800", letterSpacing: 0.8 },
  pathStatus: { color: theme.muted, fontSize: 9, fontWeight: "700", letterSpacing: 1 },
  pathTitle: { color: theme.text, fontSize: 18, fontWeight: "800", marginTop: 14 },
  pathDescription: { color: theme.muted, fontSize: 11, lineHeight: 17, marginTop: 6 },
  pathBottom: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", borderTopWidth: 1, borderTopColor: theme.border, marginTop: 14, paddingTop: 12 },
  pathLink: { color: theme.gold, fontSize: 11, fontWeight: "700" },
  bottomNote: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 7, paddingVertical: 10 },
  bottomNoteText: { color: theme.muted, fontSize: 10, letterSpacing: 0.4 },
});
