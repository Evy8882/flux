import { Tabs } from "expo-router";
import { LayoutDashboard, Receipt, Repeat, Target } from "lucide-react-native";

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#3b82f6",
        tabBarInactiveTintColor: "#64748b",
        tabBarStyle: {
          backgroundColor: "#111827",
          borderTopColor: "#1f2937",
          height: 70,          // Altura ideal para escapar da barra nativa
          paddingBottom: 16,   // Afasta dos botões do Android
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "600",
        },
      }}
    >
      <Tabs.Screen
        name="Dashboard"
        options={{
          title: "Visão Geral",
          tabBarIcon: ({ color, size }) => <LayoutDashboard size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="Statement"
        options={{
          title: "Extrato",
          tabBarIcon: ({ color, size }) => <Receipt size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="Recurrences"
        options={{
          title: "Recorrências",
          tabBarIcon: ({ color, size }) => <Repeat size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="Goals"
        options={{
          title: "Metas",
          tabBarIcon: ({ color, size }) => <Target size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}