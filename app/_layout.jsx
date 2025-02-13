import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import "react-native-reanimated";
import { useColorScheme } from "@/hooks/useColorScheme";
import { AuthProvider } from "../components/authContext/authContext";
import { PaperProvider } from "react-native-paper";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }
  // difine el tema de la aplicacion para el react-native-paper
  const theme = {
    ...DefaultTheme,
    colors: {
      ...DefaultTheme.colors,
      primary: "blue",
      secondary: "yellow",
    },
    titleLarge: {
      fontFamily: "Roboto-Medium",
      fontWeight: "500",
      fontSize: 20,
    },
  };

  return (
    <PaperProvider theme={theme}>
      <AuthProvider>
        <ThemeProvider
          value={colorScheme === "dark" ? DarkTheme : DefaultTheme}
        >
          <Stack screenOptions={{ headerShown: true }}>
            <Stack.Screen
              name="(tabs)"
              options={{ headerShown: false, gestureEnabled: false }}
            />
            {/*gestureEnabled: false desactiva el deslizar*/}
            {/*<Stack.Screen name="index" options={{ headerShown: false }} />*/}
            <Stack.Screen name="app" options={{ headerShown: false }} />
            <Stack.Screen
              name="login"
              options={{
                headerShown: true,
                headerTransparent: true,
                headerTitle: "",
                headerTintColor: "#fff",
              }}
            />
            <Stack.Screen
              name="signUp"
              options={{
                headerShown: true,
                headerTransparent: true,
                headerTitle: "",
                headerTintColor: "#fff",
              }}
            />
            <Stack.Screen
              name="signUpScreen"
              options={{
                headerShown: false,
                headerTransparent: true,
                headerTitle: "",
                headerTintColor: "#fff",
              }}
            />
            <Stack.Screen
              name="bibleQuiz"
              options={{ headerShown: false, gestureEnabled: false }}
            />
            <Stack.Screen
              name="versiculosFavoritos"
              options={{
                headerShown: true,
                headerTitle: "Versiculos Favoritos",
                headerBackTitle: "back",
              }}
            />
            <Stack.Screen
              name="dailyReading"
              options={{
                headerShown: true,
                headerTitle: "Lectura Diaria",
                headerBackTitle: "volver",
              }}
            />
            
            <Stack.Screen
              name="lecturasVistas"
              options={{
                headerShown: true,
                headerTitle: "Lecturas Vistas",
                headerBackTitle: "volver",
              }}
            />
            <Stack.Screen
              name="welcomeScreen"
              options={{
                headerShown: false,
                
              }}
            />
            <Stack.Screen name="+not-found" />
          </Stack>
          <StatusBar style="auto" />
        </ThemeProvider>
      </AuthProvider>
    </PaperProvider>
  );
}
