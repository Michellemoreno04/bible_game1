import React, { useEffect, useState } from "react";
import { View, Text, Pressable, KeyboardAvoidingView, ScrollView } from "react-native";
import { useNavigation } from "@react-navigation/native";
import useAuth from "../components/authContext/authContext";
import LottieView from "lottie-react-native";
import { LinearGradient } from "expo-linear-gradient";

import { SigninComponents } from "../components/signinComponents/signinComponents";

export default function SignUpScreen() {
  const { user } = useAuth();

  const navigation = useNavigation();


  return (
    <LinearGradient 
    colors={['#1D2671', '#C33764']} // Mismos colores que en el login
    style={{ flex: 1 }}
  >
    
      <ScrollView 
        contentContainerStyle={{ flexGrow: 1 }} 
        keyboardShouldPersistTaps="handled"
      >
        <View className="flex-1 px-8 justify-center pb-16">
          {/* Sección de Logo y Título */}
          <View className="items-center mb-12">
            <Text className="text-5xl font-bold text-white mb-2 shadow-lg">
              BibleBrain
            </Text>
            <Text className="text-lg text-gray-200">
              Bienvenido a BibleBrain
            </Text>
          </View>

          {/* Mensaje de Bienvenida / Descripción */}
          <Text className="text-center text-lg text-gray-200 mb-6">
            Nuestra app está diseñada para ayudarte a estudiar la Biblia todos los días y fortalecer tu relación espiritual.
          </Text>

          {/* Animación Lottie */}
          <View className="items-center mb-10">
            <LottieView
              source={require("../assets/lottieFiles/llegaste.json")}
              autoPlay
              loop
              style={{ width: 300, height: 300 }}
            />
          </View>

          {/* Botón de Registro */}
          <Pressable
            onPress={() => navigation.navigate('signUp')}
            className="bg-amber-500 rounded-xl p-4 items-center justify-center shadow-lg active:opacity-80 mb-4"
            android_ripple={{ color: '#ffffff50' }}
          >
            <Text className="text-white text-xl font-bold">Registrate</Text>
          </Pressable>

          {/* Enlace a Pantalla de Inicio de Sesión */}
          <View className="flex-row justify-center">
            <Text className="text-white/90">¿Ya tienes una cuenta? </Text>
            <Pressable onPress={() => navigation.navigate('login')}>
              <Text className="text-amber-400 font-semibold underline">Inicia sesión</Text>
            </Pressable>
          </View>

          
          <SigninComponents />
        </View>
      </ScrollView>
    
  </LinearGradient>
);
};
