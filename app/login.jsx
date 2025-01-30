import React, { useState } from 'react'
import { Text, View, Pressable, Alert, TextInput, KeyboardAvoidingView, ScrollView, StyleSheet } from 'react-native'
import { useNavigation } from '@react-navigation/native';
import { Link } from 'expo-router';
import { auth } from '../components/firebase/firebaseConfig';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useRouter } from "expo-router";
import { LinearGradient } from 'expo-linear-gradient';
import { AntDesign, FontAwesome6 } from '@expo/vector-icons';


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
        <LinearGradient colors={['#ffcc00', '#ff8a00']} style={{ flex: 1 }}>
          <KeyboardAvoidingView >
            <ScrollView>
          <View className="w-full h-screen flex items-center justify-center p-8">
            <View className="w-full h-full flex items-center justify-center gap-5">
              
              <Text className="text-3xl font-bold text-white">BibleBrain</Text>
              <Text className="text-lg font-bold text-white">
                Inicia sesión para continuar
              </Text>
      
             
              <TextInput
                className="w-full h-16 border-2 border-white rounded-md p-2 text-white font-bold"
                style={styles.input}
                placeholder="Email"
                placeholderTextColor="#fff" /* Color gris para el placeholder */
                required
                value={loginCredentials.email}
                textContentType="emailAddress"
                onChangeText={(text) => handlerOnchange('email', text)}
                
              />
      
              {/* Input de Password */}
              <TextInput
              style={styles.input}
                className="w-full h-16 border-2 border-white rounded-md p-2 text-white font-bold"
                placeholder="Password"
                placeholderTextColor="#fff"
                required
                secureTextEntry
                value={loginCredentials.password}
                textContentType="password"
                onChangeText={(text) => handlerOnchange('password', text)}
                
              />
      
              
              <Pressable
              style={styles.input}
                onPress={handleLogin}
                className="w-full h-16 flex items-center justify-center rounded-md bg-blue-500 p-2"
              >
                <Text className="text-white text-lg font-bold">Inicia Sesión</Text>
              </Pressable>
      
              {/* Sección de Login Alternativo */}
              <View className="w-full flex flex-col items-center justify-center gap-2">
                <Text className="text-white">- o inicia sesión con -</Text>
      
                <View className='w-full flex flex-row items-center justify-center gap-4'>
   <Pressable className='w-full-white p-5 bg-white rounded-full'>
                <AntDesign name="google" size={24} color="black" />
            </Pressable>
   <Pressable className='w-full-white p-5 bg-white rounded-full'>
   <FontAwesome6 name="facebook" size={24} color="black" />
            </Pressable>
   <Pressable className='w-full-white p-5 bg-white rounded-full'>
                <AntDesign name="apple1" size={24} color="black" />
            </Pressable>
   </View>
      
                {/* Link de Registro */}
                <View className="w-full flex flex-row items-center justify-center gap-2">
                  <Text className="text-white">¿No tienes una cuenta?</Text>
                  <Link href="/signUp">
                    <Text className="text-blue-500 font-bold bg">Regístrate</Text>
                  </Link>
                </View>
              </View>
            </View>
          </View>
          </ScrollView>
          </KeyboardAvoidingView>
          </LinearGradient>
        
      );
}



const styles = StyleSheet.create({  
  input: {
    color: '#fff',
    borderRadius: 30,
   
    padding: 10,
  },
});

export default Login;