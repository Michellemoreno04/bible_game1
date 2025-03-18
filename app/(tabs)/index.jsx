import { View, StyleSheet,Linking, SafeAreaView, ScrollView, ActivityIndicator, Platform,  StatusBar as RNStatusBar, Alert } from 'react-native';
import React, { useEffect, useState } from 'react';
import {VersiculosDiarios} from '@/components/VersiculoDiario/versiculoDiario';
import NivelModal from '@/components/Modales/modalNivel';
import { LinearGradient } from 'expo-linear-gradient';
import {HeaderHome} from '@/components/headerHome/headerHome';
import ExploraComponent from '@/components/exploraComponents/exploraComponent';
import GuardadosComponents from '@/components/exploraComponents/guardadosComponents';
import { StatusBar } from 'expo-status-bar';
import { BannerAd, BannerAdSize, TestIds } from 'react-native-google-mobile-ads';
import  useAuth  from '@/components/authContext/authContext';
import { db } from '@/components/firebase/firebaseConfig';
import { doc, onSnapshot } from 'firebase/firestore';
import registerNNPushToken from 'native-notify';
import * as Notifications from 'expo-notifications';
// app-privacy-policy.com
const adUnitId = __DEV__
  ? TestIds.ADAPTIVE_BANNER
  : Platform.OS === 'ios'
  ? process.env.EXPO_PUBLIC_BANNER_ID_IOS
  : process.env.EXPO_PUBLIC_BANNER_ID_ANDROID;

export default function AppComponent() {
  registerNNPushToken ( 28331 , ' R6WYRgvLqd0UbMTJR5Ja8b ');

/*
// Reemplaza el código comentado con esto
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});
*/

  const { user } = useAuth();
  const userId = user?.uid;
  const [userAuthenticated, setUserAuthenticated] = useState({});

  // check user authenticated
useEffect(() => {
  if (!userId) return;
  const userRef = doc(db, 'users', userId);
  const unsubscribe = onSnapshot(userRef, (snapshot) => {
    const userData = snapshot.data() || {};
    setUserAuthenticated(userData);
   
  });

  return () => unsubscribe();

}, []);
/*
// Función para solicitar permiso de notificaciones
const registerForPushNotifications = async () => {
  try {
    const { status } = await Notifications.requestPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert(
        'Permisos requeridos',
        'Habilita las notificaciones para recibir actualizaciones y versículos diarios',
        [
          {
            text: 'Configuración',
            onPress: () => Linking.openSettings(),
          },
          { 
            text: 'Cancelar', 
            style: 'cancel' 
          }
        ]
      );
    }
  } catch (error) {
    console.error('Error en notificaciones:', error);
  }
};

useEffect(() => {
  registerForPushNotifications();
}, []);
*/
if(!userId){
  return <ActivityIndicator size="large" color="white" />
}

  return (
    <LinearGradient
      colors={[ '#1E3A5F', '#3C6E9F']}
      style={styles.container}
    >
    
       <SafeAreaView 
       style={[
         styles.safeArea, 
         // Añadimos padding solo para Android
         Platform.OS === 'android' && { paddingTop: RNStatusBar.currentHeight }
       ]}
     >
        <ScrollView>
          <View style={styles.screen}>

           <HeaderHome />

            <VersiculosDiarios />
           
            <ExploraComponent />
            <GuardadosComponents />

            <BannerAd  unitId={adUnitId}
             size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
             onAdLoaded={() => console.log('Ad loaded')} //verificar que el anuncio se haya cargado
             onAdFailedToLoad={(error) => console.error('Ad failed to load:', error)} // verifica si hay algun error
              
             
             />
          </View>
        </ScrollView>
      </SafeAreaView>
      <StatusBar style="light" />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  screen: {
    height: '100%',
    padding: 10,
  },
  
});