import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useApp } from "../../context/AppContext";

const C = { bg:"#050505", panel:"#111111", border:"#34302A", text:"#F4F0E8", muted:"#AAA49B", orange:"#FF9D20" };
export default function ProfileScreen() {
  const { words, grammar } = useApp();
  return <View style={s.screen}><SafeAreaView edges={["top"]}><ScrollView contentContainerStyle={s.content}>
    <Text style={s.logo}>Lexo<Text style={{color:C.orange}}>/</Text></Text>
    <Text style={s.title}>Your progress</Text>
    <Text style={s.subtitle}>Every word brings you closer to fluency.</Text>
    <View style={s.stats}>
      <View style={s.stat}><Text style={s.number}>{words.length}</Text><Text style={s.label}>Words saved</Text></View>
      <View style={s.stat}><Text style={s.number}>{grammar.length}</Text><Text style={s.label}>Grammar notes</Text></View>
    </View>
    <View style={s.card}><Text style={s.cardTitle}>Keep showing up.</Text><Text style={s.label}>A little Spanish every day adds up to real progress.</Text></View>
  </ScrollView></SafeAreaView></View>;
}
const s=StyleSheet.create({
 screen:{flex:1,backgroundColor:C.bg},content:{padding:25,paddingBottom:110},
 logo:{color:C.text,fontSize:27,fontWeight:"800",marginBottom:34},title:{color:C.text,fontSize:30,fontWeight:"700",fontFamily:"serif"},subtitle:{color:C.muted,fontSize:13,marginTop:7,marginBottom:25},
 stats:{flexDirection:"row",gap:12},stat:{flex:1,backgroundColor:C.panel,borderWidth:1,borderColor:C.border,borderRadius:20,padding:18},number:{color:C.orange,fontSize:29,fontWeight:"800"},label:{color:C.muted,fontSize:11,marginTop:5},
 card:{backgroundColor:C.panel,borderWidth:1,borderColor:C.border,borderRadius:20,padding:18,marginTop:18},cardTitle:{color:C.text,fontSize:17,fontWeight:"700",marginBottom:7}
});
