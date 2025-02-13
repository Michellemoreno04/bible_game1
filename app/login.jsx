import React, { useState } from 'react'
import { Text, View, Pressable, Alert, TextInput, KeyboardAvoidingView, ScrollView, SafeAreaView,Platform } from 'react-native'
import { useNavigation } from '@react-navigation/native';
import { Link } from 'expo-router';
import { auth } from '../components/firebase/firebaseConfig';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useRouter } from "expo-router";
import { LinearGradient } from 'expo-linear-gradient';
import { AntDesign, FontAwesome, MaterialIcons } from '@expo/vector-icons';
import { SigninComponents } from '../components/signinComponents/signinComponents';



function Login() {
  const router = useRouter();
 
const navigation = useNavigation();



const [loginCredentials, setLoginCredentials] = useState({
   email: '',
   password: ''
   });

   // 
  const handlerOnchange = (field, value) => {
      setLoginCredentials((prevLoginCredentials) => ({
        ...prevLoginCredentials,
        [field]: value,
      }));
    };

    const handleLogin = () => {
      signInWithEmailAndPassword(auth, loginCredentials.email, loginCredentials.password)
        .then((userCredential) => {
          const user = userCredential.user;
          console.log('User logged in');
          navigation.navigate("(tabs)");
        })
        .catch((error) => {
          const errorCode = error.code;
          const errorMessage = error.message;
          console.log('Login error:', errorCode, errorMessage);
          handleFirebaseError(error);
        });

      setLoginCredentials({
        email: '',
        password: ''
      })

    }

// Función para manejar los errores de Firebase
const handleFirebaseError = (error) => {
  let errorMessage = "Ocurrió un error. Por favor, inténtalo de nuevo.";

  switch (error.code) {
    case "auth/invalid-email":
      errorMessage = "El correo electrónico no es válido. Verifica el formato.";
      break;
    case "auth/user-not-found":
      errorMessage = "No se encontró una cuenta con este correo. Regístrate primero.";
      break;
    case "auth/wrong-password":
      errorMessage = "La contraseña es incorrecta. Inténtalo de nuevo.";
      break;
    case "auth/invalid-credential":
      errorMessage = "Las credenciales ingresadas no son válidas. Intenta nuevamente.";
      break;
    default:
      errorMessage = "Ha ocurrido un error inesperado. Por favor, inténtalo de nuevo más tarde.";
  }

  // Muestra el mensaje de error con una alerta
  Alert.alert("Error de inicio de sesión", errorMessage, [{ text: "Entendido" }]);
};

    

 
      return (
        <LinearGradient 
  colors={['#1D2671', '#C33764']} 
  style={{ flex: 1 }}
>
  <KeyboardAvoidingView 
    behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
    style={{ flex: 1 }}
    keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}
  >
    <ScrollView 
      contentContainerStyle={{ flexGrow: 1 }}
      keyboardShouldPersistTaps="handled"
    >
      <View className="flex-1 px-8 justify-center pb-16">
        {/* Logo Section */}
        <View className="items-center mb-12">
          <Text className="text-5xl font-bold text-white mb-2 shadow-lg">BibleBrain</Text>
          <Text className="text-lg text-gray-200">Tu conexión espiritual inteligente</Text>
        </View>

        {/* Form Section */}
        <View className="space-y-6">
          {/* Email Input */}
          <View className="bg-white/10 rounded-xl p-3 mb-3 flex-row items-center">
            <MaterialIcons name="email" size={24} color="#FFF" style={{ marginRight: 10 }} />
            <TextInput
              placeholder="Correo electrónico"
              placeholderTextColor="#rgba(255,255,255,0.7)"
              className="flex-1 text-white text-lg"
              autoCapitalize="none"
              keyboardType="email-address"
              value={loginCredentials.email}
              onChangeText={(text) => handlerOnchange('email', text)}
            />
          </View>

          {/* Password Input */}
          <View className="bg-white/10 rounded-xl p-3 mb-3 flex-row items-center">
            <MaterialIcons name="lock" size={24} color="#FFF" style={{ marginRight: 10 }} />
            <TextInput
              placeholder="Contraseña"
              placeholderTextColor="#rgba(255,255,255,0.7)"
              className="flex-1 text-white text-lg"
              secureTextEntry
              value={loginCredentials.password}
              onChangeText={(text) => handlerOnchange('password', text)}
            />
          </View>

          {/* Login Button */}
          <Pressable
            onPress={handleLogin}
            className="bg-amber-500 rounded-xl p-4 items-center justify-center shadow-lg active:opacity-80"
            android_ripple={{ color: '#ffffff50' }}
          >
            <Text className="text-white text-xl font-bold">Acceder</Text>
          </Pressable>

          {/* Social Login */}
          <View className="py-6">
            <View className="flex-row items-center mb-6">
              <View className="flex-1 h-px bg-white/30" />
              <Text className="px-4 text-white/80 text-sm">Continúa con</Text>
              <View className="flex-1 h-px bg-white/30" />
            </View>

            <SigninComponents />
          </View>

          {/* Signup Link */}
          <View className="flex-row justify-center pt-4">
            <Text className="text-white/90">¿Nuevo aquí? </Text>
            <Link href="/signUp" className="text-amber-400 font-semibold underline">
              <Text className="text-amber-400 font-semibold underline">Crea una cuenta</Text>
            </Link>
          </View>
        </View>
      </View>
    </ScrollView>
  </KeyboardAvoidingView>
</LinearGradient>


      );
}

export default Login