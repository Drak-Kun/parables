import React, { useMemo } from "react";
import { View, Text, StyleSheet, ScrollView, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import {
  ChartNoAxesColumnIncreasing, Target, Layers, ArrowLeftRight, Volume2,
  Pencil, ChevronRight, Zap, SlidersHorizontal,
} from "lucide-react-native";
import Svg, { Path, Circle, Rect } from "react-native-svg";
import { useApp } from "../../context/AppContext";

const C = {
  bg: "#050505", text: "#F4F0E8", muted: "#AAA49B",
  orange: "#FF9D20", darkText: "#241506",
};

function ReviewArtwork() {
  return (
    <Svg width={150} height={128} viewBox="0 0 176 150" style={styles.artwork}>
      <Circle cx="137" cy="38" r="22" fill="#FF9D20" opacity="0.88" />
      <Path d="M0 116 L32 82 L57 101 L89 62 L119 94 L151 70 L176 93 V150 H0Z" fill="#30231A" />
      <Path d="M0 130 L37 103 L65 118 L101 86 L130 111 L160 91 L176 103 V150 H0Z" fill="#1C1916" />
      <Path d="M78 118 V62 L91 48 L104 62 V118Z" fill="#B86F31" />
      <Path d="M75 63 L91 43 L107 63Z" fill="#D18A43" />
      <Rect x="86" y="29" width="10" height="17" rx="1" fill="#C47A39" />
      <Path d="M84 30 L91 20 L98 30Z" fill="#E6A04E" />
      <Rect x="87" y="73" width="8" height="15" rx="4" fill="#3B2518" />
      <Rect x="81" y="93" width="7" height="13" rx="3" fill="#3B2518" />
      <Rect x="96" y="93" width="6" height="13" rx="3" fill="#3B2518" />
      <Path d="M107 112 L126 87 L148 99 L164 83 L176 91 V150 H107Z" fill="#9B5929" />
      <Path d="M118 110 L137 91 L155 102 L176 86 V150 H118Z" fill="#D18A43" opacity="0.55" />
      <Path d="M0 137 C45 124 81 132 118 119 C140 111 157 115 176 108 V150 H0Z" fill="#0E0D0C" opacity="0.7" />
    </Svg>
  );
}

function SkillRow({ icon: Icon, title, description, onPress }: {
  icon: typeof Layers; title: string; description: string; onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.skillRow, pressed && styles.pressed]}>
      <View style={styles.skillIcon}><Icon size={27} color={C.orange} strokeWidth={1.9} /></View>
      <View style={styles.skillCopy}>
        <Text style={styles.skillTitle}>{title}</Text>
        <Text style={styles.skillDescription}>{description}</Text>
      </View>
      <ChevronRight size={21} color="#D8D4CE" strokeWidth={1.8} />
    </Pressable>
  );
}

export default function QuizTabScreen() {
  const router = useRouter();
  const { words } = useApp();
  const reviewWords = useMemo(
    () => words.filter((word) => word.status === "learning" || word.status === "familiar"),
    [words],
  );
  const openSetup = () => router.push("/quiz-setup");

  return (
    <View style={styles.screen}>
      <SafeAreaView edges={["top"]} style={styles.safe}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
          <View style={styles.topBar}>
            <Text style={styles.logo}>Parables<Text style={styles.slash}>/</Text></Text>
            <Pressable onPress={() => router.push("/(tabs)/profile")} style={({ pressed }) => [styles.statsButton, pressed && styles.pressed]} accessibilityLabel="View progress">
              <ChartNoAxesColumnIncreasing size={27} color={C.text} strokeWidth={1.8} />
            </Pressable>
          </View>

          <View style={styles.headingBlock}>
            <Text style={styles.heading}>Quiz</Text>
            <Svg width={76} height={14} viewBox="0 0 76 14" style={styles.headingCurve}>
              <Path
                d="M1 10.8 C 17 4.0, 35 1.8, 53 3.0 C 62 3.7, 69 4.7, 74 5.3 C 68 5.0, 61 4.5, 53 4.1 C 35 3.0, 17 6.8, 1 12.5 Z"
                fill="#FF9D20"
              />
            </Svg>
            <Text style={styles.subtitle}>Practice, recall and strengthen{"\n"}your Spanish.</Text>
          </View>

          <Pressable onPress={openSetup} style={({ pressed }) => [styles.reviewCard, pressed && styles.pressed]}>
            <View style={styles.reviewText}>
              <Target size={43} color={C.orange} strokeWidth={1.8} />
              <View style={styles.reviewCopy}>
                <Text style={styles.eyebrow}>REVIEW DUE</Text>
                <Text style={styles.reviewCount}>{reviewWords.length} words</Text>
                <Text style={styles.reviewCaption}>From your learning list</Text>
              </View>
            </View>
            <ReviewArtwork />
            <View style={styles.reviewButton}>
              <Text style={styles.reviewButtonText}>{reviewWords.length > 0 ? "Start Review" : "Start Practice"}</Text>
              <ChevronRight size={20} color={C.darkText} strokeWidth={2.6} />
            </View>
          </Pressable>

          <Text style={styles.sectionTitle}>Practice by skill</Text>
          <View style={styles.skills}>
            <SkillRow icon={Layers} title="Flashcards" description="Recall the meaning" onPress={openSetup} />
            <SkillRow icon={ArrowLeftRight} title="Translation" description="Spanish → English or English → Spanish" onPress={openSetup} />
            <SkillRow icon={Volume2} title="Listening" description="Hear and identify words" onPress={openSetup} />
            <SkillRow icon={Pencil} title="Writing" description="Type the Spanish word" onPress={openSetup} />
          </View>

          <Text style={[styles.sectionTitle, styles.drillsTitle]}>Quick drills</Text>
          <View style={styles.drills}>
            <Pressable onPress={openSetup} style={({ pressed }) => [styles.drillChip, styles.drillActive, pressed && styles.pressed]}>
              <Zap size={18} color={C.darkText} fill={C.darkText} /><Text style={styles.drillActiveText}>10 words</Text>
            </Pressable>
            <Pressable onPress={openSetup} style={({ pressed }) => [styles.drillChip, pressed && styles.pressed]}>
              <Text style={styles.drillSymbol}>÷</Text><Text style={styles.drillText}>20 words</Text>
            </Pressable>
            <Pressable onPress={openSetup} style={({ pressed }) => [styles.drillChip, pressed && styles.pressed]}>
              <SlidersHorizontal size={19} color={C.text} /><Text style={styles.drillText}>Custom</Text>
            </Pressable>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.bg },
  safe: { flex: 1 },
  content: { paddingHorizontal: 22, paddingTop: 0, paddingBottom: 96 },
  topBar: { height: 42, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  logo: { color: C.text, fontSize: 24, fontWeight: "800", letterSpacing: -0.8, lineHeight: 29 },
  slash: { color: C.orange, fontSize: 24, fontWeight: "500" },
  statsButton: { width: 36, height: 36, alignItems: "center", justifyContent: "center" },
  headingBlock: { marginTop: 12, marginBottom: 15 },
  heading: { color: C.text, fontFamily: "serif", fontSize: 28, lineHeight: 34, fontWeight: "700" },
  headingCurve: { marginTop: -1, marginBottom: 0, marginLeft: -1 },
  subtitle: { color: C.muted, fontSize: 14, lineHeight: 20, fontWeight: "400", marginTop: 1 },
  reviewCard: { minHeight: 178, borderRadius: 20, borderWidth: 1, borderColor: "#6B5037", backgroundColor: "#171411", padding: 16, marginBottom: 18, overflow: "hidden", justifyContent: "space-between" },
  reviewText: { flexDirection: "row", alignItems: "flex-start", gap: 16, zIndex: 2 },
  reviewCopy: { paddingTop: 1 },
  eyebrow: { color: "#C7BDB1", fontSize: 12, lineHeight: 16, fontWeight: "700", letterSpacing: 1.1 },
  reviewCount: { color: C.text, fontFamily: "serif", fontSize: 28, lineHeight: 34, fontWeight: "700", marginTop: 2 },
  reviewCaption: { color: "#D0C9C0", fontSize: 14, lineHeight: 20, marginTop: 3 },
  artwork: { position: "absolute", right: 0, bottom: 0, opacity: 0.92 },
  reviewButton: { height: 48, minWidth: 190, alignSelf: "flex-start", borderRadius: 26, backgroundColor: C.orange, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, paddingHorizontal: 20, zIndex: 2 },
  reviewButtonText: { color: C.darkText, fontSize: 16, fontWeight: "700" },
  sectionTitle: { color: C.text, fontSize: 19, lineHeight: 24, fontWeight: "700", marginBottom: 9 },
  skills: { gap: 6 },
  skillRow: { minHeight: 58, borderRadius: 17, borderWidth: 1, borderColor: "#383838", backgroundColor: "#111111", flexDirection: "row", alignItems: "center", paddingHorizontal: 11, paddingVertical: 6, gap: 11 },
  skillIcon: { width: 46, height: 46, borderRadius: 14, backgroundColor: "#211B14", alignItems: "center", justifyContent: "center" },
  skillCopy: { flex: 1, minWidth: 0 },
  skillTitle: { color: C.text, fontSize: 15, lineHeight: 19, fontWeight: "600" },
  skillDescription: { color: C.muted, fontSize: 12, lineHeight: 16, marginTop: 1, flexShrink: 1 },
  drillsTitle: { marginTop: 22, marginBottom: 10 },
  drills: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8 },
  drillChip: { minHeight: 44, flex: 1, borderRadius: 24, borderWidth: 1, borderColor: "#343434", backgroundColor: "#111111", flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, paddingHorizontal: 8 },
  drillActive: { backgroundColor: C.orange, borderColor: C.orange },
  drillActiveText: { color: C.darkText, fontSize: 14, fontWeight: "700" },
  drillText: { color: C.text, fontSize: 14, fontWeight: "500" },
  drillSymbol: { color: C.muted, fontSize: 18, lineHeight: 20 },
  pressed: { opacity: 0.78 },
});
