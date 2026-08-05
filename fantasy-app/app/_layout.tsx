import { Stack, Tabs } from "expo-router";
import { useFonts } from "expo-font";
import {
  Oswald_400Regular,
  Oswald_600SemiBold,
  Oswald_700Bold,
} from "@expo-google-fonts/oswald";
import { COLORS, TYPOGRAPHY } from "../constants/theme";
export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Oswald_400Regular,
    Oswald_600SemiBold,
    Oswald_700Bold,
  });

  if (!fontsLoaded) return null;

  return (
    // <<<<<<< Updated upstream
    //     <Stack screenOptions={{ headerShown: false }}>
    //       <Tabs screenOptions={{ headerShown: false }}>
    //         <Tabs.Screen name="home" />
    //         <Tabs.Screen name="league" />
    //         <Tabs.Screen
    //           name="index"
    //           options={{ href: null, tabBarStyle: { display: "none" } }}
    //         />
    //         <Tabs.Screen
    //           name="login"
    //           options={{ href: null, tabBarStyle: { display: "none" } }}
    //         />
    //         <Tabs.Screen
    //           name="signup"
    //           options={{ href: null, tabBarStyle: { display: "none" } }}
    //         />
    //         <Tabs.Screen name="navbar" options={{ href: null }} />
    //         <Tabs.Screen name="team" options={{ href: null }} />
    //         <Tabs.Screen name="player" options={{ href: null }} />
    //       </Tabs>
    // =======
    <Stack
      screenOptions={{
        // 1. Show the header so we get the arrow
        headerShown: true,
        // 2. Midnight Theme colors
        headerStyle: {
          backgroundColor: COLORS.card,
        },
        headerShadowVisible: false, // Removes the thin line under the header
        headerTintColor: COLORS.lightBlue,

        // 3. Remove the Title text
        headerTitle: "",
        headerBackVisible: false, // Removes "Back" text on iOS
      }}
    >
      <Stack.Screen
        name="home"
        options={{ headerLeft: () => null, gestureEnabled: false }}
      />
      <Stack.Screen
        name="leagues"
        options={{ headerLeft: () => null, gestureEnabled: false }}
      />
      <Stack.Screen
        name="profile"
        options={{ headerLeft: () => null, gestureEnabled: false }}
      />
      {/* 
         The internal Tabs component usually doesn't need a back arrow.
         We hide the Stack header for the Tabs themselves.
      */}
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />

      {/* 
         If your player or team screens are pushed onto the stack, 
         they will now show the blue arrow and NO title automatically.
      */}
      {/* >>>>>>> Stashed changes */}
    </Stack>
  );
}
