import { Tabs } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  BookOpen,
  House,
  NotebookText,
  Brain,
  UserRound,
  type LucideIcon,
} from "lucide-react-native";

const ORANGE = "#FF9D20";
const MUTED = "#8F8A82";
const BG = "#090909";

function TabIcon({
  focused,
  icon: Icon,
}: {
  focused: boolean;
  icon: LucideIcon;
}) {
  return (
    <Icon
      size={21}
      strokeWidth={focused ? 2.2 : 1.8}
      color={focused ? ORANGE : MUTED}
    />
  );
}

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const bottomInset = Math.max(insets.bottom, 0);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        sceneStyle: { backgroundColor: BG },
        tabBarHideOnKeyboard: true,
        tabBarStyle: {
          position: "absolute",
          left: 14,
          right: 14,
          bottom: 0,
          height: 68 + bottomInset,
          paddingTop: 9,
          paddingBottom: bottomInset + 7,
          backgroundColor: "#151515",
          borderTopWidth: 1,
          borderTopColor: "#34302A",
          borderLeftWidth: 1,
          borderRightWidth: 1,
          borderBottomWidth: 0,
          borderColor: "#34302A",
          borderTopLeftRadius: 22,
          borderTopRightRadius: 22,
          borderBottomLeftRadius: 0,
          borderBottomRightRadius: 0,
          elevation: 12,
          shadowColor: "#000000",
          shadowOffset: { width: 0, height: 5 },
          shadowOpacity: 0.28,
          shadowRadius: 12,
        },
        tabBarActiveTintColor: ORANGE,
        tabBarInactiveTintColor: MUTED,
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: "600",
          marginTop: 2,
        },
        tabBarItemStyle: {
          paddingVertical: 0,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ focused }) => <TabIcon focused={focused} icon={House} />,
        }}
      />
      <Tabs.Screen
        name="words"
        options={{
          title: "Vocabulary",
          tabBarIcon: ({ focused }) => <TabIcon focused={focused} icon={BookOpen} />,
        }}
      />
      <Tabs.Screen
        name="quiz-tab"
        options={{
          title: "Quiz",
          tabBarIcon: ({ focused }) => <TabIcon focused={focused} icon={Brain} />,
        }}
      />
      <Tabs.Screen
        name="grammar"
        options={{
          title: "Grammar",
          tabBarIcon: ({ focused }) => <TabIcon focused={focused} icon={NotebookText} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ focused }) => <TabIcon focused={focused} icon={UserRound} />,
        }}
      />
      <Tabs.Screen name="my-words" options={{ href: null }} />
    </Tabs>
  );
}
