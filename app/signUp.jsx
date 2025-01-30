import { Link } from 'expo-router';
import React, { useState } from 'react';
import { View, TextInput, KeyboardAvoidingView, Text, StyleSheet, Pressable, Alert, ScrollView } from 'react-native';
import AntDesign from '@expo/vector-icons/AntDesign';
import { createUserWithEmailAndPassword } from "firebase/auth";
import {auth,db} from '../components/firebase/firebaseConfig'
import { useNavigation } from '@react-navigation/native';
import { doc, setDoc, Timestamp } from 'firebase/firestore';
import { LinearGradient } from 'expo-linear-gradient';
import { FontAwesome6 } from '@expo/vector-icons';





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

    navigate.navigate('(tabs)');

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
            <LinearGradient colors={['#ffcc00', '#ff8a00']} style={{ flex: 1 }}>
    <KeyboardAvoidingView >
    <ScrollView  >
    <View className="w-full h-screen flex items-center justify-center p-8 gap-4" >
      <View>
        <Text className='text-3xl font-bold color-white text-center '>BibleBrain</Text>
        <Text className='text-lg font-bold color-white'>Registrate para continuar</Text>
      </View>
      <TextInput
      style={styles.input}
        className='w-full h-16 border-2 border-white rounded-md p-2 text-white font-bold'
        placeholder="Nombre"
        placeholderTextColor="#fff"
        value={credenciales.name}
        onChangeText={(text) => handlerOnChange('name', text)}
        keyboardType="default"
      />
      <TextInput
      style={styles.input}
        className='w-full h-16 border-2 border-white rounded-md p-2 text-white font-bold'
        placeholder="correo electronico"
        placeholderTextColor="#fff"
        value={credenciales.email}
        onChangeText={(text) => handlerOnChange('email', text)}
        keyboardType="email-address"
      />
      <TextInput
      style={styles.input}
        className='w-full h-16 border-2 border-white rounded-md p-2 text-white font-bold'
        placeholder="contraseña"
        placeholderTextColor="#fff"
        value={credenciales.password}
        onChangeText={(text) => handlerOnChange('password', text)}
        secureTextEntry
      />
      <TextInput
      style={styles.input}
      className='w-full h-16 border-2 border-white rounded-md p-2 text-white font-bold'
        placeholder="Confirmar contraseña"
        placeholderTextColor='#fff'
        value={credenciales.confirmPassword}
        onChangeText={(text) => handlerOnChange('confirmPassword', text)}
        secureTextEntry
      />
      {error ? <Text >{error}</Text> : null}
      <Pressable
      style={styles.input}
      onPress={handleSignUp}
      className='w-full h-16 flex items-center justify-center  rounded-md bg-blue-500 p-2 mt-3'>
        <Text className='color-white'>Registrate</Text>
      </Pressable>

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

      <Text className='color-white' >
        Ya tienes una cuenta?{' '}
        <Link href="/login">
        <Text className='text-blue-500 font-bold' >
          iniciar seccion
        </Text> 
        </Link>
      </Text>
           
    </View>
    </ScrollView>
    </KeyboardAvoidingView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  input: {
    color: '#fff',
    borderRadius: 30,
   
    padding: 10,
  },
});


export default SignUp;
