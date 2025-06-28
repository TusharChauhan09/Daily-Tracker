import { useState } from "react";
// 7. KeyboardAvoidingView : to avoid keyboard type view
// 9. TextInput
import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  //   Text,
  //   TextInput,
  View,
} from "react-native";
// 10. React Native Paper : TextInput , Text and UseTheme
import { Button, Text, TextInput, useTheme } from "react-native-paper";

//11. context and hook
import { useAuth } from "@/lib/auth-context";

import { useRouter } from "expo-router";

export default function AuthScreen() {

const router = useRouter();

  // 10.1 useTheme
  const theme = useTheme();

  const [isSignedUp, setIsSignedUp] = useState<boolean>(false);

  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string | null>("");

  //11.1 using the context and hook
  const { signUp, signIn } = useAuth();

  const handleSwitchMode = () => {
    setIsSignedUp((prev) => !prev);
  };

  const handleAuth = async () => {
    if (!email || !password) {
      setError("Please fill all the fields");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 character long");
      return;
    }

    setError(null);

    if (isSignedUp) {
      const error = await signIn(email, password);
      // if error or else undefined
      if (error) setError(error);
      return;
      // no redirection as under the hood it is calling signin inside the context and hook
    } else {
      const error = await signUp(email, password);
      // if error or else undefined
      if (error) setError(error);
      return;

      router.replace('/');
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <View style={styles.content}>
        <Text style={styles.title} variant="headlineMedium">
          {isSignedUp ? "Welcome Back" : "Create Account"}
        </Text>
        <TextInput
          style={styles.input}
          label="Email"
          autoCapitalize="none"
          keyboardType="email-address"
          placeholder="example@gmail.com"
          mode="outlined"
          onChangeText={setEmail}
        />
        <TextInput
          style={styles.input}
          label="Password"
          autoCapitalize="none"
          secureTextEntry
          placeholder="password"
          mode="outlined"
          onChangeText={setPassword}
        />

        {/* 10.2 theme */}
        {error && <Text style={{ color: theme.colors.error }}>{error}</Text>}

        <Button style={styles.button} mode="contained" onPress={handleAuth}>
          {isSignedUp ? "Sign In" : "Sign Up"}
        </Button>
        <Button
          style={styles.switchMode}
          mode="text"
          onPress={handleSwitchMode}
        >
          {isSignedUp
            ? "Don't have an account? Sign Up"
            : "Already have an account? Sign In"}
        </Button>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },

  content: {
    flex: 1,
    padding: 16,
    justifyContent: "center",
  },

  title: {
    textAlign: "center",
    marginBottom: 24,
  },

  input: {
    marginBottom: 16,
  },

  button: {
    marginTop: 8,
  },

  switchMode: {
    marginTop: 8,
  },
});
