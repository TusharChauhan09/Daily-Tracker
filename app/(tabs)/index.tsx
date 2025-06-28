// 1. View
// 2. Text
// 3. StyleSheet
import { StyleSheet, Text, View } from "react-native";

import { Button } from "react-native-paper";

// 11 Context and hook 
import { useAuth } from "@/lib/auth-context";

export default function Index() {

  //11.1 signOut
  const { signOut } = useAuth();

  return (
    <View style={styles.homeView}>
      <Text>Home Screen : index</Text>
      <Button onPress={signOut} mode="text" icon={"logout"} >SigOut</Button>
    </View>
  );
}

const styles = StyleSheet.create({
  homeView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
