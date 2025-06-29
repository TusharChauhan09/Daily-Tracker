// 4. Stack
// 8. useRouter
// 12. useSegments
// 13. useRootNavigationState
import {
  Stack,
  // useRootNavigationState, // made a isLoading   | not good : prev -> no need as i moved RouteGuard inside the stack
  useRouter,
  useSegments,
} from "expo-router";
import { useEffect } from "react";

import { AuthProvider } from "@/lib/auth-context";

// 11. Context and Hook
import { useAuth } from "@/lib/auth-context";

// 16 PaperProvider : to use react-native-paper
import { PaperProvider, Text } from "react-native-paper";

// 15 SafeAreaProvider : to avoid the screen out bounderies and notches of different devices 
import { SafeAreaProvider } from "react-native-safe-area-context";

// 18 custome theme 
import themes from "@/lib/themes";

// 8.1 route guard function
function RouteGuard({ children }: { children: React.ReactNode }) {
  // 8.2 router
  const router = useRouter();

  //12.1 useSegments : to check the page
  const segments = useSegments();

  // 13.1 useRootNavigationState :  Wait for router/navigation to be ready
  // const navigationState = useRootNavigationState();
  // if (!navigationState?.key) {
  //   // Wait until router is ready
  //   return null; // or a loading spinner if you prefer
  // }

  // check if user is authenticated
  // 11.1 useAuth Context and Hook to get user is authenticated or not
  const { user } = useAuth();

  // 11.2 isLoading : to check if the user is got from the db
  const { isLoadingUser } = useAuth(); //to wait until the the getUser is taking time and not to redirect to '/auth' immediatly before render

  useEffect(() => {
    if (!isLoadingUser) {
      // to check if the user is currently at auth page or not
      const isAuthGroup = segments[0] === "auth";
      if (!user && !isAuthGroup) {
        // if already present at the auth page then no need to redirect
        router.replace("/auth"); //  RouteGuard is called before stack
      } else if (user && isAuthGroup) {
        router.replace("/");
      }
      // no else case : we don't want to redirect the user in any other senario
    }
  }, [user, segments, isLoadingUser]);

  if (isLoadingUser) {
    return <Text>loading....</Text>;
  }

  return <>{children}</>;
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <PaperProvider theme={themes}>
        <SafeAreaProvider>
          <RouteGuard>
            <Stack>
              {/* 4.1 Stack.Screen  */}
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            </Stack>
          </RouteGuard>
        </SafeAreaProvider>
      </PaperProvider>
    </AuthProvider>
  );
}
