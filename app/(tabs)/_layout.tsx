// 5. Tabs
import { Tabs } from "expo-router";
// 6. Icons
import { MaterialCommunityIcons } from "@expo/vector-icons";

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        // 17.1 headerStyle : to change the properties of the top header
        headerStyle: { backgroundColor: "#f5f5f5" },
        headerShadowVisible: false,
        // 17.2 tabBarStyle : to change the properties of the bottom tab
        tabBarStyle: {
          backgroundColor: "#f5f5f5",
          borderTopWidth: 0,
          elevation: 0,
          shadowOpacity: 0,
        },
        tabBarActiveTintColor: "#6200ee",
        tabBarInactiveTintColor: "#666666",
      }}
    >
      {/* 5.1 Tabs.Screen  */}
      <Tabs.Screen
        name="index"
        options={{
          title: "Today's Tasks",
          // 6.1 Icon use
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons
              name="calendar-today"
              size={size}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="streaks"
        options={{
          title: "Streaks",
          // 6.1 Icon use
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons
              name="chart-line"
              size={size}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="add-tasks"
        options={{
          title: "Add tasks",
          // 6.1 Icon use
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons
              name="plus-circle"
              size={size}
              color={color}
            />
          ),
        }}
      />
    </Tabs>
  );
}
