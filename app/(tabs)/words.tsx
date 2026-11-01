import React, { useMemo } from "react";
import { View, Text, StyleSheet, ScrollView, Pressable } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import Svg, { Path } from "react-native-svg";
import { BookOpen, Bookmark, ChevronRight, Compass, Layers, BarChart3, Tag, Zap } from "lucide-react-native";
import { useApp } from "../../context/AppContext";

const C = { bg:"#050505", text:"#F4F0E8", muted:"#AAA49B", orange:"#FF9D20" };
const TAB_BAR_HEIGHT = 68;
const TAB_BAR_GAP = 16;

function Header() {
  // Same logo markup and exact styling as Home's topBar; other Home actions omitted.
  return (
    <View style={s.topBar}>
      <Text style={s.logo}>Parables<Text style={s.slash}>/</Text></Text>
    </View>
  );
}

function SignatureUnderline() {
  return (
    <Svg width={76} height={14} viewBox="0 0 76 14" style={s.curve}>
      <Path
        d="M1 10.8 C 17 4.0, 35 1.8, 53 3.0 C 62 3.7, 69 4.7, 74 5.3 C 68 5.0, 61 4.5, 53 4.1 C 35 3.0, 17 6.8, 1 12.5 Z"
        fill="#FF9D20"
      />
    </Svg>
  );
}

function FeatureCard({ icon: Icon, value, title, copy, onPress }: any) {
  return <Pressable onPress={onPress} style={({pressed})=>[s.feature,pressed&&s.pressed]}>
    <Icon size={27} color={C.orange} strokeWidth={1.8}/>
    <Text style={s.featureValue}>{value}</Text>
    <Text style={s.featureTitle}>{title}</Text>
    <Text style={s.featureCopy}>{copy}</Text>
    <ChevronRight size={19} color={C.text} style={s.featureArrow}/>
  </Pressable>;
}

function ExploreRow({ icon: Icon, title, detail, onPress }: any) {
  return <Pressable onPress={onPress} style={({pressed})=>[s.exploreRow,pressed&&s.pressed]}>
    <View style={s.exploreIcon}><Icon size={20} color={C.orange} strokeWidth={1.8}/></View>
    <View style={{flex:1}}>
      <Text style={s.exploreTitle}>{title}</Text>
      <Text style={s.exploreDetail}>{detail}</Text>
    </View>
    <ChevronRight size={19} color={C.text}/>
  </Pressable>;
}

export default function WordsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { words, activeLanguage } = useApp();
  const saved = useMemo(
    () => words.filter(w => w.languageId === activeLanguage?.id),
    [words, activeLanguage?.id]
  );

  const bottomClearance = TAB_BAR_HEIGHT + Math.max(insets.bottom, 0) + TAB_BAR_GAP;

  return (
    <View style={s.screen}>
      <SafeAreaView edges={["top"]} style={s.safe}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentInsetAdjustmentBehavior="never"
          contentContainerStyle={[s.content, { paddingBottom: bottomClearance }]}
        >
          <Header/>
          <View style={s.intro}>
            <Text style={s.title}>Vocabulary</Text>
            <SignatureUnderline/>
            <Text style={s.subtitle}>Explore Spanish words or review{"\n"}your saved ones.</Text>
          </View>

          <View style={s.featureRow}>
            <FeatureCard icon={BookOpen} value="50,000+" title="Dictionary" copy="Explore the complete Spanish vocabulary" onPress={()=>router.push("/dictionary")}/>
            <FeatureCard icon={Bookmark} value={String(saved.length)} title="My Words" copy="Your saved words, with spaced review" onPress={()=>router.push("/my-words")}/>
          </View>

          <View style={s.sectionHead}>
            <Compass size={20} color={C.orange}/>
            <Text style={s.sectionTitle}>Quick Explore</Text>
          </View>
          <View style={s.exploreList}>
            <ExploreRow icon={Layers} title="By Category" detail="Food, travel, family, work…" onPress={()=>router.push({pathname:"/dictionary",params:{filter:"category"}})}/>
            <ExploreRow icon={BarChart3} title="By Level" detail="A1 · A2 · B1 · B2 · C1 · C2" onPress={()=>router.push({pathname:"/dictionary",params:{filter:"level"}})}/>
            <ExploreRow icon={Tag} title="By Part of Speech" detail="Nouns, verbs, adjectives…" onPress={()=>router.push({pathname:"/dictionary",params:{filter:"part"}})}/>
            <ExploreRow icon={Zap} title="Verb Conjugations" detail="Browse and practice common verbs" onPress={()=>router.push({pathname:"/dictionary",params:{filter:"verb"}})}/>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const s=StyleSheet.create({
  screen:{flex:1,backgroundColor:C.bg},
  safe:{flex:1},
  // Same scroll-content inset and top-bar geometry as Home.
  content:{paddingHorizontal:24,paddingTop:2,flexGrow:1},
  topBar:{
    height:42,
    flexDirection:"row",
    alignItems:"center",
    justifyContent:"space-between",
    marginBottom:0,
  },
  // Exact Home logo values.
  logo:{color:C.text,fontSize:24,fontWeight:"800",letterSpacing:-0.8,lineHeight:29},
  slash:{color:C.orange,fontSize:24,fontWeight:"500"},
  intro:{marginTop:0,marginBottom:19},
  title:{color:C.text,fontFamily:"serif",fontSize:32,lineHeight:38,fontWeight:"600"},
  curve:{marginTop:-1,marginBottom:0,marginLeft:-1},
  subtitle:{color:C.text,fontSize:16,lineHeight:23,marginTop:0},
  featureRow:{flexDirection:"row",gap:12},
  feature:{flex:1,minHeight:178,borderRadius:21,borderWidth:1,borderColor:"#59452F",backgroundColor:"#17130F",padding:15,overflow:"hidden",justifyContent:"flex-start",shadowColor:"#B66A18",shadowOpacity:.08,shadowRadius:12,shadowOffset:{width:0,height:3},elevation:2},
  featureValue:{fontSize:23,fontWeight:"700",color:C.orange,marginTop:10},
  featureTitle:{fontSize:17,fontWeight:"600",color:C.text,marginTop:2},
  featureCopy:{fontSize:12.5,lineHeight:18,color:"#C7C0B7",marginTop:6,paddingRight:4},
  featureArrow:{position:"absolute",right:12,bottom:13},
  sectionHead:{flexDirection:"row",alignItems:"center",gap:10,marginTop:23,marginBottom:10},
  sectionTitle:{fontSize:19,fontWeight:"700",color:C.text},
  exploreList:{gap:8},
  exploreRow:{minHeight:57,borderRadius:16,borderWidth:1,borderColor:"#35322D",backgroundColor:"#101010",paddingHorizontal:12,paddingVertical:7,flexDirection:"row",alignItems:"center",gap:11},
  exploreIcon:{width:36,height:36,borderRadius:12,backgroundColor:"#211A12",alignItems:"center",justifyContent:"center"},
  exploreTitle:{fontSize:14.5,fontWeight:"600",color:C.text},
  exploreDetail:{fontSize:11.5,color:C.muted,marginTop:2},
  pressed:{opacity:.76}
});
