import { useAuth } from "@/lib/auth-context";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { Button, Card, Text } from "react-native-paper";

import {
  client,
  DATABASE_ID,
  databases,
  RealtimeResponse,
  TASKS_COLLECTION_ID,
  TASKS_COMPLETIONS_COLLECTION_ID,
} from "@/lib/appwrite";

import { TaskCompletion, TasksType } from "@/types/database.type";

import { Query } from "react-native-appwrite";

export default function StreaksScreen() {
  const router = useRouter();

  const { user } = useAuth();

  const [tasks, setTasks] = useState<TasksType[]>([]);

  const [completedTasks, setCompletedTasks] = useState<TaskCompletion[]>([]);

  const fetchTasks = async () => {
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        TASKS_COLLECTION_ID,
        [Query.equal("user_id", user?.$id ?? "")]
      );
      //@ts-ignore
      setTasks(response.documents as TasksType);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchCompletions = async () => {
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        TASKS_COMPLETIONS_COLLECTION_ID,
        [Query.equal("user_id", user?.$id ?? "")]
      );

      const completions = response.documents as TaskCompletion[];
      //@ts-ignore
      setCompletedTasks(completions);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (user) {
      const tasksChannel = `databases.${DATABASE_ID}.collections.${TASKS_COLLECTION_ID}.documents`;
            const tasksSubscription = client.subscribe(
              tasksChannel,
              (response: RealtimeResponse) => {
                if (
                  response.events.includes(
                    "databases.*.collections.*.documents.*.create"
                  )
                ) {
                  fetchTasks();
                } else if (
                  response.events.includes(
                    "databases.*.collections.*.documents.*.update"
                  )
                ) {
                  fetchTasks();
                } else if (
                  response.events.includes(
                    "databases.*.collections.*.documents.*.delete"
                  )
                ) {
                  fetchTasks();
                }
              }
            );
            const completionsChannel = `databases.${DATABASE_ID}.collections.${TASKS_COMPLETIONS_COLLECTION_ID}.documents`;
            const completionsSubscription = client.subscribe(
              completionsChannel,
              (response: RealtimeResponse) => {
                if (
                  response.events.includes(
                    "databases.*.collections.*.documents.*.create"
                  )
                ) {
                  fetchCompletions();
                }
              }
            );
    
      fetchTasks();
      fetchCompletions();
      
      return ()=>{
        tasksSubscription();
        completionsSubscription()
      }
    }
  }, [user]);


  interface StreakData {
    streak: number;
    bestStreak: number;
    total: number;
  }

  const getStreakData = (taskId: string) => {
    const taskCompletions = completedTasks
      ?.filter((t) => t.tasks_id === taskId)
      .sort(
        (a, b) =>
          new Date(a.completed_at).getTime() -
          new Date(b.completed_at).getTime()
      );
    if (taskCompletions.length === 0) {
      return {
        streak: 0,
        bestStreak: 0,
        total: 0,
      };
    }

    let streak = 0;
    let bestStreak = 0;
    let total = taskCompletions.length;

    let lastDate: Date | null = null;
    let currentStreak = 0;

    taskCompletions?.forEach((t) => {
      const date = new Date(t.completed_at);
      if (lastDate) {
        const diff =
          (date.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24);

        if (diff <= 1.5) {
          currentStreak += 1;
        } else {
          currentStreak = 1;
        }
      } else {
        currentStreak = 1;
      }
        
      if (currentStreak > bestStreak) bestStreak = currentStreak;
      streak = currentStreak;
      lastDate = date;
    });

    return { streak, bestStreak, total };
  };

  const taskStreak = tasks.map((task) => {
    const { streak, bestStreak, total } = getStreakData(task.$id);
    return { task, bestStreak, streak, total };
  });

  const rankedTasks = taskStreak.sort((a, b) => b.bestStreak - a.bestStreak);

  const bageStyles = [styles.badge1,styles.badge2,styles.badge3];

  return (
    <View style={styles.container}>
      <Text style={styles.title} variant="headlineSmall">Task Streaks</Text>
      {rankedTasks.length >0 && (
        <View style={styles.rankingContainer}>
          <Text style={styles.rankingTitle}> 🏅 Top Streaks</Text>
          {rankedTasks.slice(0,3).map((item,key)=>(
            <View key={key} style={styles.rankingRow}>
              <View style={[styles.rankingBadge, bageStyles[key]]}>
                <Text style={styles.rankingBadgeText}>{key+1}</Text>
              </View>
              <Text style={styles.rankingTask} >{item.task.title}</Text>
              <Text style={styles.rankingStreak} >{item.bestStreak}</Text>
            </View>
          ))}
        </View>
      )}
      {tasks.length === 0 ? (
        <View>
          <Text>
            No Tasks Present. Add Your Tasks
          </Text>
          <Button
            onPress={() => router.push("/(tabs)/add-tasks")}
            mode="text"
            icon={"arrow-right-bottom"}
          >
           add Tasks  
          </Button>
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false}  style={styles.container} >
        {rankedTasks.map(({ task, streak, bestStreak, total }, key) => (
          <Card key={key} style={[styles.card, key === 0 && styles.firstCard]}>
            <Card.Content>
              <Text variant="titleMedium" style={styles.taskTitle}>
                {task.title}
              </Text>
              <Text style={styles.taskDescription}>{task.description}</Text>
              <View style={styles.statsRow}>
                <View style={styles.statBageOrgange}>
                  <Text style={styles.statBageText}> 🔥 {streak}</Text>
                  <Text style={styles.statLabel}>Current</Text>
                </View>
                <View style={styles.statBageGold}>
                  <Text style={styles.statBageText}> 🏆 {bestStreak}</Text>
                  <Text style={styles.statLabel}>Best </Text>
                </View>
                <View style={styles.statBageGreen}>
                  <Text style={styles.statBageText}>✅ {total}</Text>
                  <Text style={styles.statLabel}>Total</Text>
                </View>
              </View>
            </Card.Content>
          </Card>
        ))}
      </ScrollView>
      )
      }
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    padding: 16,
  },
  title: {
    fontWeight: "bold",
    marginBottom: 16,
  },
  taskTitle: {
    fontWeight: "bold",
    fontSize: 18,
    marginBottom: 2,
  },
  taskDescription: {
    color: "#6c6c80",
    marginBottom: 8,
  },
  statsRow:{
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
    marginTop:8
  },
  card: {
    marginBottom: 18,
    borderRadius: 18,
    backgroundColor: "#fff",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    borderWidth: 1,
    borderColor: "#f0f0f0",
  },
  firstCard: {
    borderWidth: 2,
    borderColor: "#7c4dff",
  },
  statBageOrgange:{
    backgroundColor: '#fff3e0',
    borderRadius: 10,
    paddingHorizontal:12,
    paddingVertical: 6,
    alignItems: "center",
    minWidth: 60
  },
  statBageGold:{
    backgroundColor: '#fffde7',
    borderRadius: 10,
    paddingHorizontal:12,
    paddingVertical: 6,
    alignItems: "center",
    minWidth: 60
  },
  statBageGreen:{
    backgroundColor: '#e8f5e9',
    borderRadius: 10,
    paddingHorizontal:12,
    paddingVertical: 6,
    alignItems: "center",
    minWidth: 60
  },
  statBageText:{
    fontWeight:"bold",
    fontSize: 15,
    color: "#22223b"
  },
  statLabel: {
    fontSize: 11,
    color: "#888",
    marginTop: 2,
    fontWeight: "800"
  },
  rankingContainer: {
    marginBottom: 24,
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  rankingTitle: {
    fontWeight: "bold",
    fontSize: 18,
    marginBottom: 12,
    color: "#7c4dff",
    letterSpacing: 0.5,
  },
  rankingRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    paddingBottom: 8,
  },
  rankingBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
    backgroundColor: "#e0e0e0",
  },
  badge1: { backgroundColor: "#ffd700" }, // gold
  badge2: { backgroundColor: "#c0c0c0" }, // silver
  badge3: { backgroundColor: "#cd7f32" }, // bronze

  rankingBadgeText: {
    fontWeight: "bold",
    color: "#fff",
    fontSize: 15,
  },

  rankingTask: {
    flex: 1,
    fontSize: 15,
    color: "#333",
    fontWeight: "800",
  },
  rankingStreak: {
    fontSize: 14,
    color: "#7c4dff",
    fontWeight: "bold",
  }
});
