// 1. View
// 2. Text
// 3. StyleSheet
// 18. ScrollView : to make screen scrollable
import { ScrollView, StyleSheet, View } from "react-native";

import { Button, Surface, Text } from "react-native-paper";

import { useEffect, useRef, useState } from "react";

// 11 Context and hook
import { useAuth } from "@/lib/auth-context";

import {
  client,
  DATABASE_ID,
  databases,
  RealtimeResponse,
  TASKS_COLLECTION_ID,
  TASKS_COMPLETIONS_COLLECTION_ID,
} from "@/lib/appwrite";
import { ID, Query } from "react-native-appwrite";

import { HabitCompletion, TasksType } from "@/types/database.type";

import { useRouter } from "expo-router";

import { MaterialCommunityIcons } from "@expo/vector-icons";

import { Swipeable } from "react-native-gesture-handler";

export default function Index() {
  const router = useRouter();

  //11.1 signOut
  const { signOut, user } = useAuth();

  const [tasks, setTasks] = useState<TasksType[]>();

  const [completedTasks, setCompletedTasks] = useState<string[]>();

  // 20.1 to store all swipeable value
  const swipeableRefs = useRef<{ [key: string]: Swipeable | null }>({});

  //left swipe
  const renderLeftActions = () => (
    <View style={styles.LeftActions}>
      <MaterialCommunityIcons
        name={"trash-can-outline"}
        size={32}
        color={"#fff"}
      />
    </View>
  );

  // deleting task on left swipe
  const handleDeleteTask = async (id: string) => {
    try {
      await databases.deleteDocument(DATABASE_ID, TASKS_COLLECTION_ID, id);
    } catch (error) {
      console.error(error);
    }
  };

  // right swipe
  const renderRightActions = (id: string ) => (
    <View style={styles.RightActions}>
      <MaterialCommunityIcons
        name={"check-circle-outline"}
        size={32}
        color={"#fff"}
      />
    </View>
  );

  // complete tasks on right swipe
  const handleCompleteTask = async (id: string) => {
    // console.log(id);
    if (!user || completedTasks?.includes(id)) return;
    try {
      const date = new Date().toISOString();
      await databases.createDocument(
        DATABASE_ID,
        TASKS_COMPLETIONS_COLLECTION_ID,
        ID.unique(),
        {
          tasks_id: id,
          user_id: user.$id,
          completed_at: date,
        }
      );
      const task = tasks?.find((t) => t.$id === id);
      if (!tasks || task === undefined) return;

      await databases.updateDocument(DATABASE_ID, TASKS_COLLECTION_ID, id, {
        streak_count: task.streak_count + 1,
        last_completed: date,
      });
    } catch (error) {
      console.error(error);
    }
  };

  // return t/f if the task is completed today
  const isTasksCompleted = (id: string) => {
    return completedTasks?.includes(id);
  };

  // all the task of the user
  const fetchTasks = async () => {
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        TASKS_COLLECTION_ID,
        [Query.equal("user_id", user?.$id ?? "")] //condition for fectching the current user tasks
      );
      // console.log(response.documents);
      //@ts-ignore
      setTasks(response.documents as TasksType);
    } catch (error) {
      console.error(error);
    }
  };

  // get all the completed tasks
  const fetchTodayCompletions = async () => {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const response = await databases.listDocuments(
        DATABASE_ID,
        TASKS_COMPLETIONS_COLLECTION_ID,
        [
          Query.equal("user_id", user?.$id ?? ""),
          Query.greaterThanEqual("completed_at", today.toISOString()), //condition for fectching the current user tasks and that are completed today in completed_at field in the table
        ]
      );
      // console.log(response.documents);
      const completions = response.documents as HabitCompletion[];
      setCompletedTasks(completions.map((c) => c.tasks_id as string));
      // console.log(completedTasks?.toString());
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (user) {
      // realtime for all the tasks
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
      //realtime for todays tasks
      const completionsChannel = `databases.${DATABASE_ID}.collections.${TASKS_COMPLETIONS_COLLECTION_ID}.documents`;
      const completionsSubscription = client.subscribe(
        completionsChannel,
        (response: RealtimeResponse) => {
          if (
            response.events.includes(
              "databases.*.collections.*.documents.*.create"
            )
          ) {
            fetchTodayCompletions();
          }
        }
      );

      fetchTasks();
      fetchTodayCompletions();
      return () => {
        tasksSubscription();
        completionsSubscription();
      };
    }
  }, [user]);

  //     useEffect(() => {
  //   if (user) {
  //     const channel = `database.${DATABASE_ID}.collections.${TASKS_COLLECTION_ID}.documents`;
  //     const unsubscribe = client.subscribe(channel,
  //       //@ts-ignore
  //       (response: RealtimeResponse) => {
  //       if (
  //         response.event.includes("create") ||
  //         response.event.includes("update") ||
  //         response.event.includes("delete")
  //       ) {
  //         fetchTasks();
  //       }
  //     });

  //     return () => {
  //       unsubscribe();
  //     };
  //   }
  // }, [user]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text variant="headlineSmall" style={styles.title}>
          Today's Tasks
        </Text>
        <Button onPress={signOut} mode="text" icon={"logout"}>
          Sign Out
        </Button>
      </View>
      {/* 18 ScrollView */}
      <ScrollView showsHorizontalScrollIndicator={false}>
        {tasks?.length === 0 ? (
          <View style={styles.emptyState}>
            {" "}
            <Text style={styles.emptyStateText}>
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
          tasks?.map((task, key) => (
            <Swipeable
              ref={(ref) => {
                swipeableRefs.current[task.$id] = ref;
              }}
              key={key}
              // left right swipe
              overshootLeft={false}
              overshootRight={false}
              // render the view on swipes
              renderLeftActions={renderLeftActions}
              renderRightActions={()=>renderRightActions(task.$id)}
              // which function to call on left right swipe
              onSwipeableOpen={(direction) => {
                if (direction === "left") handleDeleteTask(task.$id);
                else if (direction === "right") handleCompleteTask(task.$id);
                // bring back / close the swipe in order to not to delete next element
                swipeableRefs.current[task.$id]?.close();
              }}
            >
              <Surface style={[styles.card, isTasksCompleted(task.$id) && styles.cardCompleted]} elevation={0}>
                <View style={styles.cardContent}>
                  <Text style={styles.cardTitle}>{task.title}</Text>
                  <Text style={styles.cardDescription}>{task.description}</Text>
                  <View style={styles.cardFooter}>
                    <View style={styles.streakBadge}>
                      <MaterialCommunityIcons
                        name="fire"
                        size={18}
                        color={"#ff9800"}
                      />
                      <Text style={styles.streakText}>
                        {task.streak_count} days
                      </Text>
                    </View>
                    <View style={styles.frequencyBadge}>
                      <Text style={styles.frequencyText}>
                        {task.frequency.charAt(0).toUpperCase() +
                          task.frequency.slice(1)}
                      </Text>
                    </View>
                  </View>
                </View>
              </Surface>
            </Swipeable>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#f5f5f5",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  title: {
    fontWeight: "bold",
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyStateText: {
    color: "#666666",
  },
  card: {
    marginBottom: 18,
    borderRadius: 18,
    backgroundColor: "#f7f2fa",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  cardCompleted:{
    opacity: 0.6
  },
  cardContent: {
    padding: 20,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 4,
    color: "#22223b",
  },
  cardDescription: {
    fontSize: 15,
    marginBottom: 16,
    color: "#6c6c80",
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  streakBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff3e0",
    borderRadius: 12,
    paddingVertical: 4,
    paddingHorizontal: 10,
  },
  streakText: {
    marginLeft: 6,
    color: "#ff9800",
    fontWeight: "bold",
    fontSize: 14,
  },
  frequencyBadge: {
    backgroundColor: "#ede7f6",
    borderRadius: 12,
    paddingVertical: 4,
    paddingHorizontal: 12,
  },
  frequencyText: {
    color: "#7c4dff",
    fontWeight: "bold",
    fontSize: 14,
  },
  LeftActions: {
    justifyContent: "center",
    alignItems: "flex-start",
    flex: 1,
    backgroundColor: "#e53935",
    borderRadius: 18,
    marginBottom: 18,
    marginTop: 2,
    paddingLeft: 16,
  },
  RightActions: {
    justifyContent: "center",
    alignItems: "flex-end",
    flex: 1,
    backgroundColor: "#4caf50",
    borderRadius: 18,
    marginBottom: 18,
    marginTop: 2,
    paddingRight: 16,
  },
  
});
