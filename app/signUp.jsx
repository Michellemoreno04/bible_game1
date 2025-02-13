import { Link } from 'expo-router';
import React, { useState } from 'react';
import { View, TextInput, KeyboardAvoidingView, Text, Platform, Pressable, Alert, ScrollView } from 'react-native';
import AntDesign from '@expo/vector-icons/AntDesign';
import { createUserWithEmailAndPassword } from "firebase/auth";
import {auth,db} from '../components/firebase/firebaseConfig'
import { useNavigation } from '@react-navigation/native';
import { doc, setDoc, Timestamp } from 'firebase/firestore';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons,FontAwesome } from '@expo/vector-icons';
import { SigninComponents } from '../components/signinComponents/signinComponents';





const SignUp = () => {
  const navigate = useNavigation();
  const [credenciales, setCredenciales] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [vidas, setVidas] = useState(3);
  const [monedas, setMonedas] = useState(200);
  const [exp, setExp] = useState(0);
  const [nivel,setNivel] = useState(1);
  const [racha, setRacha] = useState(0);
  const [rachaMaxima, setRachaMaxima] = useState(0);

  const hoy = new Date(); 
    hoy.setHours(0, 0, 0, 0); // Establecer solo la fecha (sin hora)
    const ayer = new Date(hoy);
      ayer.setDate(hoy.getDate() - 1); // Restar un día para setear la racha
 const handlerOnChange = (field, value) => {
  setCredenciales((prevCredenciales) => ({
    ...prevCredenciales,
    [field]: value,// Establece el valor del campo correspondiente
  }));
};
const handleSignUp = () => {
  if (credenciales.name && credenciales.email && credenciales.password ) {
createUserWithEmailAndPassword(auth, credenciales.email, credenciales.password)
  .then((userCredential) => {
    const user = userCredential.user;
    try{
      setDoc(doc(db, "users", user.uid), {
        Name: credenciales.name,
        Email: credenciales.email,
        TiempoRegistrado: Timestamp.now(),
        Vidas: vidas,
        Monedas: monedas,
        Exp: exp,
        Nivel: nivel,
        Racha: racha,
        RachaMaxima: rachaMaxima,
        modalRachaShow: ayer.toISOString(),
      });
    } catch (error) {
  
      console.log(error);
      return error
    }


    console.log('user logged');

    setCredenciales({
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    })

    navigate.navigate('welcomeScreen');

  })
  .catch((error) => {
    const errorCode = error.code;
    const errorMessage = error.message;
    handleFirebaseError(error);
    // ..
  });

  } else {
    Alert.alert('Por favor, complete todos los campos.');
  }
};

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
      case "auth/email-already-in-use":
        errorMessage = "El correo electrónico ya está en uso. Por favor, utiliza otro correo electrónico.";
        break;
        case "auth/weak-password":
          errorMessage = "La contraseña debe tener al menos 6 caracteres.";
          break;
          
    default:
      errorMessage = "Ha ocurrido un error inesperado. Por favor, inténtalo de nuevo más tarde.";
  }

  // Muestra el mensaje de error con una alerta
  Alert.alert("Error de inicio de sesión", errorMessage, [{ text: "Entendido" }]);
};

  return (
    <LinearGradient 
    colors={['#1D2671', '#C33764']} // Mismo gradiente que en Login
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
          {/* Sección de Logo y Título */}
          <View className="items-center mb-12">
            <Text className="text-5xl font-bold text-white mb-2 shadow-lg">
              BibleBrain
            </Text>
            <Text className="text-lg text-gray-200">
              Registrate para continuar
            </Text>
          </View>

          {/* Sección de Formulario */}
          <View className="space-y-6">
            {/* Input de Nombre */}
            <View className="bg-white/10 rounded-xl p-3 mb-3 flex-row items-center">
              <MaterialIcons 
                name="person" 
                size={24} 
                color="#FFF" 
                style={{ marginRight: 10 }} 
              />
              <TextInput
                placeholder="Nombre"
                placeholderTextColor="rgba(255,255,255,0.7)"
                className="flex-1 text-white text-lg"
                value={credenciales.name}
                onChangeText={(text) => handlerOnChange('name', text)}
              />
            </View>

            {/* Input de Correo electrónico */}
            <View className="bg-white/10 rounded-xl p-3 mb-3 flex-row items-center">
              <MaterialIcons 
                name="email" 
                size={24} 
                color="#FFF" 
                style={{ marginRight: 10 }} 
              />
              <TextInput
                placeholder="Correo electrónico"
                placeholderTextColor="rgba(255,255,255,0.7)"
                className="flex-1 text-white text-lg"
                autoCapitalize="none"
                keyboardType="email-address"
                value={credenciales.email}
                onChangeText={(text) => handlerOnChange('email', text)}
              />
            </View>

            {/* Input de Contraseña */}
            <View className="bg-white/10 rounded-xl p-3 mb-3 flex-row items-center">
              <MaterialIcons 
                name="lock" 
                size={24} 
                color="#FFF" 
                style={{ marginRight: 10 }} 
              />
              <TextInput
                placeholder="Contraseña"
                placeholderTextColor="rgba(255,255,255,0.7)"
                className="flex-1 text-white text-lg"
                secureTextEntry
                value={credenciales.password}
                onChangeText={(text) => handlerOnChange('password', text)}
              />
            </View>

            {/* Input de Confirmar Contraseña */}
            <View className="bg-white/10 rounded-xl p-3 mb-3 flex-row items-center">
              <MaterialIcons 
                name="lock" 
                size={24} 
                color="#FFF" 
                style={{ marginRight: 10 }} 
              />
              <TextInput
                placeholder="Confirmar contraseña"
                placeholderTextColor="rgba(255,255,255,0.7)"
                className="flex-1 text-white text-lg"
                secureTextEntry
                value={credenciales.confirmPassword}
                onChangeText={(text) => handlerOnChange('confirmPassword', text)}
              />
            </View>

            {/* Mensaje de error (si existe) */}
            {error ? (
              <Text className="text-red-500 text-center">{error}</Text>
            ) : null}

            {/* Botón para registrarse */}
            <Pressable
              onPress={handleSignUp}
              className="bg-amber-500 rounded-xl p-4 items-center justify-center shadow-lg active:opacity-80"
              android_ripple={{ color: '#ffffff50' }}
            >
              <Text className="text-white text-xl font-bold">Registrate</Text>
            </Pressable>

            {/* Sección de Redes Sociales */}
            <View className="py-6">
              <View className="flex-row items-center mb-6">
                <View className="flex-1 h-px bg-white/30" />
                <Text className="px-4 text-white/80 text-sm">Continúa con</Text>
                <View className="flex-1 h-px bg-white/30" />
              </View>
             <SigninComponents />
            </View>

            {/* Enlace para ir a Login */}
            <View className="flex-row justify-center pt-4">
              <Text className="text-white/90">Ya tienes una cuenta? </Text>
              <Link href="/login">
                <Text className="text-amber-400 font-semibold underline">
                  Inicia sesión
                </Text>
              </Link>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  </LinearGradient>
);
};

export default SignUp