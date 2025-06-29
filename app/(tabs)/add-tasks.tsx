import { useState } from "react";
import { StyleSheet, View } from "react-native";
import { Button, SegmentedButtons, TextInput } from "react-native-paper";
import { useRouter } from "expo-router";

import { useAuth } from "@/lib/auth-context";

import { databases , DATABASE_ID , TASKS_COLLECTION_ID } from "@/lib/appwrite";

import { ID } from "react-native-appwrite";

const FREQUENCIES = ["daily", "weekly", "monthly"];

type Frequency = (typeof FREQUENCIES)[number];

export default function AddTasksScreen() {

  const router = useRouter();

  const [title, setTitle] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [frequency, setFrequency] = useState<Frequency>("daily");
  const [ error,setError ] = useState<string | null>(null)

  // @ts-ignore
  const { user } = useAuth; 

  const handleSubmit = async () =>{
    if(!user) return;
    try{
      await databases.createDocument(
        DATABASE_ID,
        TASKS_COLLECTION_ID,
        ID.unique(),
        {
          "user_id": user.$id,
          "title" : title,
          "description" : description,
          "streak_count" : 0,
          "last_completed": new Date().toISOString(),
          "created_at": new Date().toISOString()
        }
      )
      router.back();
    }
    catch(error){
      if(error instanceof Error){
        setError(error.message);
        return 
      }
      setError("There was an error creating the task ") 
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        label={"Title"}
        mode="outlined"
        style={styles.input}
        onChangeText={setTitle}
      />
      <TextInput
        label={"Description"}
        mode="outlined"
        style={styles.input}
        onChangeText={setDescription}
      />
      <View style={styles.frequencyContainer}>
        <SegmentedButtons
        value={frequency}
          onValueChange={(value) => setFrequency(value as Frequency)}
          buttons={FREQUENCIES.map((freq) => ({
            value: freq,
            label: freq[0].toUpperCase() + freq.slice(1),
          }))}
        />
      </View>
      <Button mode="contained" disabled={!title || !description } onPress={handleSubmit}>Add Tasks</Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#f5f5f5",
    justifyContent: "center",
  },
  input: {
    marginBottom: 16,
  },
  frequencyContainer: {
    marginBottom: 24,
  },
});
