import { Client, Account, Databases } from 'react-native-appwrite';

// setting up client
export const client = new Client()
    .setEndpoint(process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT!) // Your Appwrite Endpoint
    .setProject(process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID!)
    .setPlatform(process.env.EXPO_PUBLIC_APPWRITE_PLATFORM!) // YOUR application ID

;

// Auth 
export const account = new Account(client);

// Database
export const databases = new Databases(client);

export const DATABASE_ID = process.env.EXPO_PUBLIC_DB_ID!;
export const TASKS_COLLECTION_ID = process.env.EXPO_PUBLIC_DB_TASKS_COLLECTION_ID!;
export const TASKS_COMPLETIONS_COLLECTION_ID=process.env.EXPO_PUBLIC_DB_TASKS_COMPLETIONS_COLLECTION_ID!;

export interface RealtimeResponse {
  events: string[];
  payload: any;
}