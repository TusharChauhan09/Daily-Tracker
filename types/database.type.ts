import { Models } from "react-native-appwrite";

export interface TasksType extends Models.Document {
    user_id: string;
    title: string;
    description: string;
    frequency: string;
    streak_count: number;
    last_completed: string;
    created_at: string;
}

export interface TaskCompletion extends Models.Document{
    tasks_id: string,
    user_id: string,
    completed_at: string 
}