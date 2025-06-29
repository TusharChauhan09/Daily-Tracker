// 11. Context and Hook 

import { createContext , useContext, useEffect, useState } from "react";

import { Models , ID  } from "react-native-appwrite";

import { account } from "./appwrite";

type AuthContextType = {
  user: Models.User<Models.Preferences> | null;
  isLoadingUser: boolean; // to wait until the the getUser is taking time and not to redirect to '/auth' immediatly before render 
  signUp: (email: string, password: string) => Promise<string | null>;
  signIn: (email: string, password: string) => Promise<string | null>;
  signOut : () => Promise<void>;
};

// createContext
const AuthContext = createContext<AuthContextType | undefined>(undefined);

//AuthProvider :  context procider 
export function AuthProvider({ children }: { children: React.ReactNode }) {
    //isLoading
    const [isLoadingUser, setIsLoadingUser] = useState<boolean>(true);

    //user
    const [user, setUser] = useState<Models.User<Models.Preferences> | null>(null);
    
    // call the getUser function in the first render
    useEffect(()=>{
        getUser();
    },[])

    const getUser = async () =>{
        try{
            const session = await account.get();
            setUser(session);
        }
        catch{
            setUser(null);
        }
        finally{
            setIsLoadingUser(false);
        }
    }

    //signUp
    const signUp = async (email: string, password: string)=>{
        try{
            await account.create(ID.unique(),email,password)
            await signIn(email,password);
            return null;
        }
        catch(error){
            if(error instanceof Error){
                return error.message;
            }
            return "An error occur during signup";
        }
    }

    //signIn
    const signIn = async (email: string, password: string)=>{
        try{
            await account.createEmailPasswordSession(email,password);

            const session = await account.get();  // inorder to redirect to the home after signin 
            setUser(session);

            return null;
        }
        catch(error){
            if(error instanceof Error){
                return error.message;
            }
            return "An error occur during signIn";
        }
    }

    const signOut = async () =>{
        try{
            await account.deleteSession("current");
            setUser(null);
        }
        catch(error){
            console.log(error);
        }
    }

  return (
    <AuthContext.Provider value={{ user, isLoadingUser , signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}


// no need to use useContext : to access the data instead useAuth hook to access the conetext props
export function useAuth() {
    
    const context = useContext(AuthContext);

    if(context===undefined){
        throw new Error("useAuth must be inside of the AuthProvider");
    }
    return context;
}
