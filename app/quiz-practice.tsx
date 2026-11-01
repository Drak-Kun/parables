import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  View, Text, StyleSheet, Pressable, TextInput, ScrollView, Modal,
  KeyboardAvoidingView, Platform, Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as Speech from "expo-speech";
import * as Haptics from "expo-haptics";
import { ArrowLeft, ArrowRight, Volume2, RotateCcw, X, Check, Waves, Star, Zap } from "lucide-react-native";
import { useApp } from "../context/AppContext";
import { Word } from "../types";
import { updateWord } from "../storage";

type Mode = "review" | "flashcards" | "translation" | "listening" | "writing" | "mixed" | "custom";
type Direction = "es-en" | "en-es";
const ORANGE = "#FF9D20";
const MUTED = "#AAA49B";

const shuffle = <T,>(items: T[]): T[] => {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
};

const normalize = (value: string) => value.trim().toLocaleLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

export default function QuizPracticeScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ mode?: string; count?: string }>();
  const { words, refreshData, isLoading } = useApp();
  const sessionInitialized = useRef(false);
  const mode = (params.mode || "mixed") as Mode;
  const [direction, setDirection] = useState<Direction>("es-en");
  const [index, setIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [revealed, setRevealed] = useState(false);
  const [ratingBusy, setRatingBusy] = useState(false);
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);
  const [known, setKnown] = useState(0);
  const [missed, setMissed] = useState(0);
  const [attempted, setAttempted] = useState(0);
  const [finished, setFinished] = useState(false);
  const [customOpen, setCustomOpen] = useState(mode === "custom");
  const [customCount, setCustomCount] = useState("10");
  const [sessionCount, setSessionCount] = useState(Number(params.count) || 10);
  const [sessionWords, setSessionWords] = useState<Word[]>([]);
  const [busy, setBusy] = useState(false);

  const reviewPool = useMemo(() => words
    .filter((word) => {
      const dueAt = (word as Word & { nextReviewAt?: string }).nextReviewAt;
      return !dueAt || new Date(dueAt).getTime() <= Date.now();
    })
    .sort((a, b) => {
      const aDue = (a as Word & { nextReviewAt?: string }).nextReviewAt;
      const bDue = (b as Word & { nextReviewAt?: string }).nextReviewAt;
      return (aDue ? new Date(aDue).getTime() : 0) - (bDue ? new Date(bDue).getTime() : 0);
    }), [words]);

  useEffect(() => {
    if (isLoading || sessionInitialized.current || mode === "custom") return;
    const pool = mode === "review" && reviewPool.length > 0 ? reviewPool : words;
    const desired = mode === "review" ? pool.length : sessionCount;
    setSessionWords(shuffle(pool).slice(0, Math.max(1, desired)));
    sessionInitialized.current = true;
  }, [isLoading, mode, reviewPool, words, sessionCount]);

  const current = sessionWords[index];
  const total = sessionWords.length;
  const isFlashcard = mode === "flashcards" || mode === "review";
  const isInfiniteSkill = mode === "flashcards" || mode === "translation" || mode === "listening" || mode === "writing";
  const isListening = mode === "listening";
  const isWriting = mode === "writing";
  const isTyping = isWriting || (mode === "translation" && direction === "en-es");
  const prompt = current
    ? (isWriting ? current.meaning : direction === "es-en" ? current.word : current.meaning)
    : "";
  const expected = current
    ? (isWriting || isListening || (mode === "translation" && direction === "en-es")
      ? current.word
      : current.meaning)
    : "";
  const choices = useMemo(() => {
    if (!current) return [];
    const alternatives = direction === "es-en"
      ? words.filter((word) => word.id !== current.id).map((word) => word.meaning)
      : words.filter((word) => word.id !== current.id).map((word) => word.word);
    return shuffle([expected, ...shuffle(alternatives).slice(0, 3)]);
  }, [current?.id, direction, words, expected]);

  useEffect(() => {
    if (mode === "listening" && current) {
      Speech.stop();
      Speech.speak(current.word, { language: "es-ES", rate: 0.86 });
    }
  }, [mode, current?.id]);

  const saveResult = async (word: Word, correct: boolean) => {
    const updated: Word = {
      ...word,
      reviewCount: (word.reviewCount || 0) + 1,
      correctCount: (word.correctCount || 0) + (correct ? 1 : 0),
      incorrectCount: (word.incorrectCount || 0) + (correct ? 0 : 1),
      streak: correct ? (word.streak || 0) + 1 : 0,
      lastReviewedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: correct && word.status === "new" ? "learning" : word.status,
    };
    await updateWord(updated);
  };

  const moveNext = () => {
    setAnswer("");
    setRevealed(false);
    setFeedback(null);
    if (index + 1 >= total) {
      if (isInfiniteSkill) {
        // Keep skill practice going by adding another shuffled pass through the vocabulary.
        // Previously missed words are placed first in the next pass when available.
        const missedIds = new Set(sessionWords.filter((word) => word.incorrectCount > 0).map((word) => word.id));
        const priority = words.filter((word) => missedIds.has(word.id));
        const remaining = words.filter((word) => !missedIds.has(word.id));
        setSessionWords((currentWords) => [...currentWords, ...shuffle([...priority, ...remaining])]);
        setIndex((value) => value + 1);
      } else {
        setFinished(true);
        void refreshData();
      }
    } else setIndex((value) => value + 1);
  };

  const finishSession = () => {
    Speech.stop();
    setFinished(true);
    void refreshData();
  };

  const mark = async (correct: boolean) => {
    if (!current || busy || feedback) return;
    setBusy(true);
    try {
      await saveResult(current, correct);
      setKnown((value) => value + (correct ? 1 : 0));
      setMissed((value) => value + (correct ? 0 : 1));
      setAttempted((value) => value + 1);
      setFeedback(correct ? "correct" : "wrong");
      if (correct) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      else Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } catch {
      Alert.alert("Couldn't save progress", "Please try again.");
    } finally {
      setBusy(false);
    }
  };

  const rateFlashcard = async (rating: "again" | "hard" | "good" | "easy") => {
    if (!current || ratingBusy || feedback || !revealed) return;
    setRatingBusy(true);
    try {
      const intervalDays = ({ again: 10 / 1440, hard: 1, good: 3, easy: 7 } as const)[rating];
      const now = new Date();
      const remembered = rating === "good" || rating === "easy";
      const nextReviewAt = new Date(now.getTime() + intervalDays * 86400000).toISOString();
      const updated = {
        ...current,
        reviewCount: (current.reviewCount || 0) + 1,
        correctCount: (current.correctCount || 0) + (remembered ? 1 : 0),
        incorrectCount: (current.incorrectCount || 0) + (remembered ? 0 : 1),
        streak: remembered ? (current.streak || 0) + 1 : 0,
        lastReviewedAt: now.toISOString(),
        updatedAt: now.toISOString(),
        status: remembered ? (current.status === "new" ? "learning" : current.status) : "learning",
        lastReviewRating: rating,
        reviewIntervalDays: intervalDays,
        nextReviewAt,
      } as Word;
      await updateWord(updated);
      setKnown((value) => value + (remembered ? 1 : 0));
      setMissed((value) => value + (remembered ? 0 : 1));
      setAttempted((value) => value + 1);
      moveNext();
      void refreshData();
    } catch {
      Alert.alert("Couldn't save progress", "Please try again.");
    } finally {
      setRatingBusy(false);
    }
  };

  const submitTyped = () => {
    if (!answer.trim() || !current || feedback) return;
    void mark(normalize(answer) === normalize(expected));
  };

  const startCustom = () => {
    const count = Number(customCount);
    if (!Number.isInteger(count) || count < 1 || count > 100) {
      Alert.alert("Invalid number", "Choose a number between 1 and 100.");
      return;
    }
    if (words.length === 0) {
      Alert.alert("No words yet", "Add Spanish vocabulary before starting a drill.");
      return;
    }
    setSessionCount(count);
    setSessionWords(shuffle(words).slice(0, Math.min(count, words.length)));
    sessionInitialized.current = true;
    setCustomOpen(false);
    setIndex(0);
    setKnown(0);
    setMissed(0);
    setAttempted(0);
    setFinished(false);
  };

  const restart = () => {
    setIndex(0); setAnswer(""); setRevealed(false); setFeedback(null);
    setKnown(0); setMissed(0); setAttempted(0); setFinished(false);
    setSessionWords(shuffle(mode === "review" && reviewPool.length ? reviewPool : words)
      .slice(0, mode === "review" ? (reviewPool.length || words.length) : sessionCount));
  };

  const title = ({
    review: reviewPool.length > 0 ? "Review" : "Practice", flashcards: "Flashcards", translation: "Translation",
    listening: "Listening", writing: "Writing", mixed: "Quick Drill", custom: "Custom Drill",
  } as Record<Mode, string>)[mode] || "Practice";

  if (customOpen) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.top}><Pressable onPress={() => router.back()}><ArrowLeft color={stylesColors.text} /></Pressable><Text style={styles.topTitle}>Custom drill</Text><View style={{ width: 24 }} /></View>
        <View style={styles.customWrap}>
          <Text style={styles.customTitle}>How many words?</Text>
          <Text style={styles.muted}>Choose between 1 and 100 words for this session.</Text>
          <TextInput value={customCount} onChangeText={setCustomCount} keyboardType="number-pad" style={styles.input} placeholder="10" placeholderTextColor={MUTED} />
          <Pressable onPress={startCustom} style={styles.primary}><Text style={styles.primaryText}>Start drill</Text><ArrowRight color="#241506" size={19} /></Pressable>
        </View>
      </SafeAreaView>
    );
  }

  if (finished) {
    const accuracy = attempted ? Math.round((known / attempted) * 100) : 0;
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.resultWrap}>
          <Text style={styles.resultEyebrow}>SESSION COMPLETE</Text>
          <Text style={styles.resultTitle}>Nice work.</Text>
          <Text style={styles.resultScore}>{known} / {attempted}</Text>
          <Text style={styles.muted}>Correct answers · {accuracy}% accuracy</Text>
          <View style={styles.resultStats}>
            <View style={styles.stat}><Text style={styles.statNumber}>{known}</Text><Text style={styles.muted}>Got it</Text></View>
            <View style={styles.stat}><Text style={styles.statNumber}>{missed}</Text><Text style={styles.muted}>Need practice</Text></View>
          </View>
          <Pressable onPress={restart} style={styles.primary}><RotateCcw color="#241506" size={18} /><Text style={styles.primaryText}>Practice again</Text></Pressable>
          <Pressable onPress={() => router.replace("/(tabs)/quiz-tab")} style={styles.secondary}><Text style={styles.secondaryText}>Back to Quiz</Text></Pressable>
        </View>
      </SafeAreaView>
    );
  }

  if (words.length === 0 || total === 0) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.emptyWrap}>
          <Text style={styles.resultTitle}>No words yet</Text>
          <Text style={styles.muted}>Add some Spanish vocabulary first. Your words will appear here for practice.</Text>
          <Pressable onPress={() => router.push("/add-word")} style={styles.primary}><Text style={styles.primaryText}>Add a word</Text><ArrowRight color="#241506" size={18} /></Pressable>
          <Pressable onPress={() => router.back()} style={styles.secondary}><Text style={styles.secondaryText}>Go back</Text></Pressable>
        </View>
      </SafeAreaView>
    );
  }

  if (!current) return <SafeAreaView style={styles.safe}><Text style={styles.muted}>Preparing your session…</Text></SafeAreaView>;

  const changeDirection = (value: Direction) => {
    setDirection(value); setAnswer(""); setFeedback(null); setRevealed(false);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.top}>
        <Pressable onPress={() => { Speech.stop(); router.back(); }} style={styles.iconButton}><X color={stylesColors.text} size={22} /></Pressable>
        <View style={styles.progressMeta}><Text style={styles.topTitle}>{title}</Text><Text style={styles.muted}>{isInfiniteSkill ? `${attempted} practiced` : `${index + 1} / ${total}`}</Text></View>
        {isInfiniteSkill ? (
          <Pressable onPress={finishSession} style={styles.finishButton}><Text style={styles.finishButtonText}>Finish</Text></Pressable>
        ) : <View style={{ width: 38 }} />}
      </View>
      {!isInfiniteSkill ? <View style={styles.progressTrack}><View style={[styles.progressFill, { width: `${((index + 1) / total) * 100}%` }]} /></View> : null}
      <ScrollView style={styles.exerciseViewport} contentContainerStyle={[styles.exerciseContent, isFlashcard && styles.flashExerciseContent]} keyboardShouldPersistTaps="handled" scrollEnabled={!isFlashcard} showsVerticalScrollIndicator={!isFlashcard}>
        {mode === "translation" && (
          <View style={styles.directionRow}>
            <Pressable onPress={() => changeDirection("es-en")} style={[styles.directionChip, direction === "es-en" && styles.directionActive]}><Text style={[styles.directionText, direction === "es-en" && styles.directionTextActive]}>Spanish → English</Text></Pressable>
            <Pressable onPress={() => changeDirection("en-es")} style={[styles.directionChip, direction === "en-es" && styles.directionActive]}><Text style={[styles.directionText, direction === "en-es" && styles.directionTextActive]}>English → Spanish</Text></Pressable>
          </View>
        )}
        <Text style={styles.promptLabel}>
          {isFlashcard ? "REMEMBER THE MEANING" : isListening ? "LISTEN AND IDENTIFY" : isWriting ? "WRITE IN SPANISH" : "TRANSLATE"}
        </Text>
        {isListening && (
          <Pressable onPress={() => Speech.speak(current.word, { language: "es-ES", rate: 0.86 })} style={styles.listenButton}>
            <Volume2 size={34} color={ORANGE} /><Text style={styles.listenText}>Tap to hear again</Text>
          </Pressable>
        )}
        {isFlashcard ? (
          <Pressable onPress={() => setRevealed((value) => !value)} style={styles.flashCard}>
            <Text style={styles.flashWord}>{current.word}</Text>
            {revealed ? <Text style={styles.flashMeaning}>{current.meaning}</Text> : <Text style={styles.tapHint}>Tap to reveal meaning</Text>}
            {current.example ? <Text style={styles.example}>{revealed ? current.example : ""}</Text> : null}
          </Pressable>
        ) : (
          <>
            <Text style={styles.prompt}>{isListening ? "What word did you hear?" : prompt}</Text>
            {isTyping ? (
              <View>
                <TextInput value={answer} onChangeText={setAnswer} onSubmitEditing={submitTyped} editable={!feedback} autoCapitalize="none" autoCorrect={false} placeholder="Type your answer…" placeholderTextColor="#77716A" style={styles.input} />
                {!feedback ? <Pressable onPress={submitTyped} style={[styles.primary, !answer.trim() && styles.disabled]} disabled={!answer.trim()}><Text style={styles.primaryText}>Check answer</Text><ArrowRight color="#241506" size={18} /></Pressable> : null}
              </View>
            ) : (
              <View style={styles.choiceList}>
                {choices.map((choice, i) => {
                  const selected = answer === choice;
                  const isCorrectChoice = choice === expected;
                  return (
                    <Pressable key={`${choice}-${i}`} onPress={() => { if (!feedback) { setAnswer(choice); void mark(choice === expected); } }} style={[styles.choice, selected && styles.choiceSelected, feedback && isCorrectChoice && styles.choiceCorrect, feedback && selected && !isCorrectChoice && styles.choiceWrong]}>
                      <Text style={styles.choiceText}>{choice}</Text>
                      {feedback && isCorrectChoice ? <Check color="#72C58A" /> : null}
                    </Pressable>
                  );
                })}
              </View>
            )}
          </>
        )}

        {isFlashcard && revealed && (
          <View style={styles.ratingSection}>
            <Text style={styles.ratingTitle}>How well did you remember?</Text>
            <View style={styles.ratingGrid}>
              <Pressable disabled={ratingBusy} onPress={() => void rateFlashcard("again")} style={[styles.ratingCard, styles.ratingAgain, ratingBusy && styles.disabled]}>
                <RotateCcw color="#F07862" size={27} /><View><Text style={styles.ratingAgainTitle}>Again</Text><Text style={styles.ratingSub}>Forgot it</Text></View>
              </Pressable>
              <Pressable disabled={ratingBusy} onPress={() => void rateFlashcard("hard")} style={[styles.ratingCard, styles.ratingHard, ratingBusy && styles.disabled]}>
                <Waves color="#E8C17C" size={27} /><View><Text style={styles.ratingHardTitle}>Hard</Text><Text style={styles.ratingSub}>Struggled</Text></View>
              </Pressable>
              <Pressable disabled={ratingBusy} onPress={() => void rateFlashcard("good")} style={[styles.ratingCard, styles.ratingGood, ratingBusy && styles.disabled]}>
                <Star color="#F2B84B" size={27} /><View><Text style={styles.ratingGoodTitle}>Good</Text><Text style={styles.ratingSub}>Remembered</Text></View>
              </Pressable>
              <Pressable disabled={ratingBusy} onPress={() => void rateFlashcard("easy")} style={[styles.ratingCard, styles.ratingEasy, ratingBusy && styles.disabled]}>
                <Zap color="#70C98B" size={27} /><View><Text style={styles.ratingEasyTitle}>Easy</Text><Text style={styles.ratingSub}>Knew it well</Text></View>
              </Pressable>
            </View>
          </View>
        )}

        {!isFlashcard && feedback && (
          <View style={[styles.feedback, feedback === "correct" ? styles.feedbackGood : styles.feedbackBad]}>
            <Text style={styles.feedbackTitle}>{feedback === "correct" ? "Correct" : "Not quite"}</Text>
            <Text style={styles.feedbackBody}> {current.word} — {current.meaning}</Text>
            {!isFlashcard ? <Pressable onPress={moveNext} style={styles.nextButton}><Text style={styles.nextText}>{isInfiniteSkill ? "Next word" : index + 1 === total ? "Finish" : "Next word"}</Text><ArrowRight color="#241506" size={18} /></Pressable> : null}
          </View>
        )}
        <Text style={styles.sessionFoot}>{mode === "review" && reviewPool.length > 0 ? "Review words from your learning list" : "Your progress is saved as you practice."}</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const stylesColors = { text: "#F4F0E8" };
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#050505" },
  top: { minHeight: 58, paddingHorizontal: 20, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  iconButton: { width: 38, height: 38, alignItems: "center", justifyContent: "center" },
  topTitle: { color: "#F4F0E8", fontSize: 17, fontWeight: "700", textAlign: "center" },
  progressMeta: { alignItems: "center", gap: 3 },
  finishButton: { minWidth: 62, height: 36, paddingHorizontal: 10, borderRadius: 18, borderWidth: 1, borderColor: "#6B5037", alignItems: "center", justifyContent: "center" },
  finishButtonText: { color: ORANGE, fontSize: 13, fontWeight: "700" },
  muted: { color: MUTED, fontSize: 13, lineHeight: 19, textAlign: "center" },
  progressTrack: { height: 4, marginHorizontal: 20, borderRadius: 9, backgroundColor: "#292929", overflow: "hidden" },
  progressFill: { height: "100%", borderRadius: 9, backgroundColor: ORANGE },
  exerciseViewport: { flex: 1 },
  exerciseContent: { padding: 22, paddingBottom: 24, flexGrow: 1 },
  flashExerciseContent: { flexGrow: 1, minHeight: "100%", justifyContent: "space-between", gap: 14 },
  promptLabel: { color: ORANGE, fontSize: 11, fontWeight: "700", letterSpacing: 1.4, marginTop: 10, marginBottom: 8 },
  prompt: { color: "#F4F0E8", fontSize: 27, lineHeight: 35, fontFamily: "serif", fontWeight: "700", marginBottom: 24 },
  flashCard: { flex: 1, minHeight: 300, borderRadius: 24, borderWidth: 1, borderColor: "#51402D", backgroundColor: "#15120F", alignItems: "center", justifyContent: "center", padding: 24, gap: 18 },
  flashWord: { color: "#F4F0E8", fontSize: 36, lineHeight: 44, fontFamily: "serif", fontWeight: "700", textAlign: "center" },
  flashMeaning: { color: ORANGE, fontSize: 22, lineHeight: 30, fontWeight: "600", textAlign: "center" },
  tapHint: { color: MUTED, fontSize: 13 },
  example: { color: MUTED, fontSize: 14, textAlign: "center" },
  flashActions: { flexDirection: "row", justifyContent: "flex-end", width: "100%", paddingHorizontal: 6, marginTop: 8 },
  revealButton: { width: 82, height: 82, borderRadius: 41, backgroundColor: ORANGE, alignItems: "center", justifyContent: "center" },
  againButton: { flex: 1, minHeight: 52, borderRadius: 28, borderWidth: 1, borderColor: "#7A443A", alignItems: "center", justifyContent: "center", backgroundColor: "#241512" },
  againText: { color: "#F08A75", fontWeight: "700", fontSize: 15 },
  knowButton: { flex: 1, minHeight: 52, borderRadius: 28, backgroundColor: ORANGE, alignItems: "center", justifyContent: "center" },
  knowText: { color: "#241506", fontWeight: "700", fontSize: 15 },
  ratingSection: { width: "100%", marginTop: 8, gap: 14, flexShrink: 0 },
  ratingTitle: { color: "#F4F0E8", fontSize: 17, fontFamily: "serif", fontWeight: "700" },
  ratingGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10, justifyContent: "space-between" },
  ratingCard: { width: "48%", minHeight: 78, borderRadius: 18, borderWidth: 1, paddingHorizontal: 10, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10 },
  ratingAgain: { backgroundColor: "#281916", borderColor: "#704137" },
  ratingHard: { backgroundColor: "#241D12", borderColor: "#66502E" },
  ratingGood: { backgroundColor: "#282112", borderColor: "#80602D" },
  ratingEasy: { backgroundColor: "#14251A", borderColor: "#39794A" },
  ratingAgainTitle: { color: "#F07862", fontSize: 15, fontWeight: "700" },
  ratingHardTitle: { color: "#E8C17C", fontSize: 15, fontWeight: "700" },
  ratingGoodTitle: { color: "#F2B84B", fontSize: 15, fontWeight: "700" },
  ratingEasyTitle: { color: "#70C98B", fontSize: 15, fontWeight: "700" },
  ratingSub: { color: "#C8BDB5", fontSize: 11, marginTop: 3 },
  input: { minHeight: 56, borderRadius: 16, borderWidth: 1, borderColor: "#48413A", backgroundColor: "#141414", color: "#F4F0E8", paddingHorizontal: 16, fontSize: 17, marginBottom: 14 },
  primary: { minHeight: 52, borderRadius: 28, backgroundColor: ORANGE, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, paddingHorizontal: 22, marginTop: 12 },
  primaryText: { color: "#241506", fontSize: 16, fontWeight: "700" },
  disabled: { opacity: 0.45 },
  choiceList: { gap: 10 },
  choice: { minHeight: 58, paddingHorizontal: 16, borderRadius: 16, borderWidth: 1, borderColor: "#383838", backgroundColor: "#111111", flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  choiceSelected: { borderColor: ORANGE },
  choiceCorrect: { borderColor: "#72C58A", backgroundColor: "#14251A" },
  choiceWrong: { borderColor: "#D36B5F", backgroundColor: "#2A1715" },
  choiceText: { color: "#F4F0E8", fontSize: 16, flex: 1 },
  feedback: { marginTop: 18, borderRadius: 16, padding: 16, borderWidth: 1 },
  feedbackGood: { backgroundColor: "#14251A", borderColor: "#39794A" },
  feedbackBad: { backgroundColor: "#2A1715", borderColor: "#804239" },
  feedbackTitle: { color: "#F4F0E8", fontSize: 16, fontWeight: "700", marginBottom: 5 },
  feedbackBody: { color: "#DDD5CA", fontSize: 14, lineHeight: 20 },
  nextButton: { minHeight: 50, marginTop: 14, borderRadius: 26, backgroundColor: ORANGE, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10 },
  nextText: { color: "#241506", fontSize: 15, fontWeight: "700" },
  sessionFoot: { color: "#77716A", fontSize: 12, textAlign: "center", marginTop: 8, paddingBottom: 4 },
  listenButton: { alignSelf: "flex-start", padding: 16, borderRadius: 18, borderWidth: 1, borderColor: "#51402D", backgroundColor: "#17130F", alignItems: "center", gap: 8, marginBottom: 18 },
  listenText: { color: MUTED, fontSize: 12 },
  directionRow: { flexDirection: "row", gap: 8, marginTop: 20 },
  directionChip: { flex: 1, minHeight: 40, borderRadius: 20, borderWidth: 1, borderColor: "#383838", alignItems: "center", justifyContent: "center", paddingHorizontal: 6 },
  directionActive: { backgroundColor: ORANGE, borderColor: ORANGE },
  directionText: { color: MUTED, fontSize: 11, fontWeight: "600" },
  directionTextActive: { color: "#241506" },
  resultWrap: { flex: 1, padding: 26, justifyContent: "center", alignItems: "center" },
  resultEyebrow: { color: ORANGE, fontSize: 11, fontWeight: "700", letterSpacing: 1.6 },
  resultTitle: { color: "#F4F0E8", fontSize: 34, fontFamily: "serif", fontWeight: "700", marginTop: 10, textAlign: "center" },
  resultScore: { color: ORANGE, fontSize: 52, fontWeight: "800", marginTop: 22 },
  resultStats: { flexDirection: "row", gap: 14, marginVertical: 28, width: "100%" },
  stat: { flex: 1, padding: 18, borderRadius: 18, borderWidth: 1, borderColor: "#333", backgroundColor: "#111", alignItems: "center", gap: 6 },
  statNumber: { color: "#F4F0E8", fontSize: 25, fontWeight: "700" },
  secondary: { minHeight: 48, alignItems: "center", justifyContent: "center", marginTop: 10, paddingHorizontal: 20 },
  secondaryText: { color: MUTED, fontSize: 15, fontWeight: "600" },
  emptyWrap: { flex: 1, padding: 28, justifyContent: "center", alignItems: "center", gap: 12 },
  customWrap: { flex: 1, padding: 26, justifyContent: "center" },
  customTitle: { color: "#F4F0E8", fontSize: 28, fontFamily: "serif", fontWeight: "700", marginBottom: 8 },
});
