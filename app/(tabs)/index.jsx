import { Text, View, StyleSheet, SafeAreaView, ScrollView, Alert, Image,TouchableWithoutFeedback, Modal, TouchableOpacity } from 'react-native';
import '../../global.css';
import { Link } from 'expo-router';
import { AntDesign, FontAwesome5, MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import useAuth from '../authContext';
import React, { useEffect, useState,useRef } from 'react';
import { doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { auth, db } from '@/components/firebase/firebaseConfig';
import { Avatar } from 'react-native-paper';
import { niveles } from '@/components/Niveles/niveles';
import VersiculosDiarios from '@/components/VersiculoDiario/versiculoDiario';
import NivelModal from '@/components/Modales/modalNivel';
import { useNavigation } from 'expo-router';
import LottieView from 'lottie-react-native';



export default function AppComponent() {
  const { user } = useAuth();
  const navigation = useNavigation();
  const [userAuthenticated, setUserAuthenticated] = useState({});
  const [showNivelModal, setShowNivelModal] = useState(false);
  const [nivelAnterior, setNivelAnterior] = useState(null);
  const [showFullScreen, setShowFullScreen] = useState(false);
 
  
  const animationRef = useRef(null); 

 
  const handleAnimationPress = () => {
    setShowFullScreen(true); 
  };

  const handleAnimationFinish = () => {
  animationRef.current?.play(0, 300);
    setShowFullScreen(false); 
    navigation.navigate('bibleQuiz');
  };
  const userId = user?.uid;

  useEffect(() => {
    if (!userId) return;

    const userRef = doc(db, 'users', userId);
    const unsubscribe = onSnapshot(userRef, (snapshot) => {
      const userData = snapshot.data() || {};
      setUserAuthenticated(userData);

      if (userData.Exp) {
        const nivelActual = niveles(userData.Exp).nivel;
        const nivelAnterior = userData.Nivel || 0;

        updateDoc(userRef, { Nivel: nivelActual });

        if (nivelAnterior !== null && nivelActual > nivelAnterior) {
          Alert.alert(
            'has subido de nivel',
            `Has subido del nivel ${nivelAnterior} al ${nivelActual}`,
            [{ text: 'OK', onPress: () => setShowNivelModal(true) }]
          );
        }

        setNivelAnterior(nivelActual);
      }
    });

    return () => unsubscribe();
  }, [userId]);

  return (
      <SafeAreaView>
        <View style={styles.screen} className='bg-gray-100' >
        <ScrollView >
          <NivelModal
            userInfo={userAuthenticated?.Nivel}
            isVisible={showNivelModal}
            onClose={() => setShowNivelModal(false)}
          />
          
          <View style={styles.headerContainer}>
  {/* Contenedor Izquierdo: Avatar e Información */}
  <View style={styles.leftContainer}>
    <Avatar.Image size={50} source={require('../../assets/images/Loader.png')} />
    <View style={styles.userInfo}>
      <Text style={styles.greeting}>
        {`Hola!, ${userAuthenticated?.Name || 'Anónimo'}`}
      </Text>
      <Text style={styles.level} className="bg-blue-100">
        {`Nivel ${niveles(userAuthenticated?.Exp || 0).nivel} -> ${niveles(userAuthenticated?.Exp || 0).insignia}`}
      </Text>
    </View>
  </View>

  {/* Contenedor Derecho: Racha */}
  <View style={styles.rachaContainer}>
    <Text style={styles.rachaText}>{userAuthenticated?.Racha || 0}</Text>
    <MaterialCommunityIcons name="lightning-bolt-outline" size={26} color="black" />
  </View>
</View>


            <VersiculosDiarios />

            <View className="w-full flex justify-start mt-5">
              <Text className="text-3xl font-bold">Explora</Text>
            </View>
            <View className=" flex flex-row gap-4 mt-4 ">
      {/* Tarjeta Refuerza Conocimientos */}
      <TouchableOpacity className="w-52 h-32 bg-blue-600 rounded-xl p-4 flex justify-between"
       onPress={handleAnimationPress}
      >
        <View className="flex flex-row justify-between">
        <FontAwesome5 name="brain" size={30} color="white"  />
          <AntDesign name="arrowright" size={24} color="black" />
        </View>
        <Text className="text-white font-bold p-1">Refuerza tus conocimientos</Text>
        
      </TouchableOpacity>

      {/* Tarjeta Versículos Guardados */}
      <TouchableOpacity className="w-52 h-32 bg-orange-500 rounded-xl p-4 flex justify-between"
      onPress={() => navigation.navigate('versiculosFavoritos')}
      >
        <View className="flex flex-row justify-between">
          <FontAwesome5 name="book-open" size={28} color="white" />
          
          <AntDesign name="arrowright" size={24} color="black" />
      
        </View>
        <Text className="text-white font-bold">Versículos Guardados</Text>
        <View className="flex flex-row justify-end">
        </View>
      </TouchableOpacity>
    </View>
                <View className="flex flex-row justify-center gap-4 mt-4">

               {/* Modal para animación de pantalla completa */}
      <Modal visible={showFullScreen} transparent={true}>
        <View style={styles.modalContainer}>
          <LottieView
            ref={animationRef}
            source={require('../../assets/lottieFiles/cerebro.json')}
            autoPlay
            loop={false}
            style={{ width: '100%', height: '100%' }}
            resizeMode="contain"
            onAnimationFinish={() => {
              handleAnimationFinish();
            }}
          />
        </View>
      </Modal>
        
    
             
              
            </View>
        </ScrollView>
          </View>
      </SafeAreaView>
    
  );
}



const styles = StyleSheet.create({
  screen: {
    
    height: '100%',
    padding: 10,
    
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between', // Separar elementos a los extremos
    alignItems: 'center',
    paddingHorizontal: 10,
    marginBottom: 20,
  },
  leftContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userInfo: {
    marginLeft: 10,
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  level: {
    fontSize: 14,
    color: '#555',
    padding: 5,
    borderRadius: 5,
  },

  rachaContainer: {
    position: 'relative',
    bottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0', // Fondo claro
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 20,
    elevation: 2, // Sombra sutil
  },
  rachaText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginRight: 5, // Separación entre texto e ícono
  },
  cerebro: {
    width: 100,
    height: 40,
    position:'relative',
    right:20,
    marginBottom:5,
   
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)', // Fondo oscuro para resaltar la animación
    justifyContent: 'center',
    alignItems: 'center',
  },
});
