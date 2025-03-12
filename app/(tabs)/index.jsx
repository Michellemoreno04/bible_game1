import { Text, View, StyleSheet, SafeAreaView, ScrollView, ActivityIndicator, Platform,  StatusBar as RNStatusBar } from 'react-native';

import { FontAwesome5 } from '@expo/vector-icons';
import useAuth from '../../components/authContext/authContext';
import React, { useEffect, useState } from 'react';
import { doc, getDoc, onSnapshot, updateDoc } from 'firebase/firestore';
import { db } from '@/components/firebase/firebaseConfig';
import { niveles } from '@/components/Niveles/niveles';
import {VersiculosDiarios} from '@/components/VersiculoDiario/versiculoDiario';
import NivelModal from '@/components/Modales/modalNivel';
import { Link, useNavigation } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Avatar } from '@rneui/base';
import ExploraComponent from '@/components/exploraComponents/exploraComponent';
import GuardadosComponents from '@/components/exploraComponents/guardadosComponents';
import { StatusBar } from 'expo-status-bar';
import { useToast } from "react-native-toast-notifications";
import { BannerAd, BannerAdSize, TestIds } from 'react-native-google-mobile-ads';

const adUnitId = __DEV__ ? TestIds.ADAPTIVE_BANNER : process.env.EXPO_PUBLIC_BANNER_ID;


export default function AppComponent() {
  const { user } = useAuth();
  const navigation = useNavigation();
  const [userAuthenticated, setUserAuthenticated] = useState({});
  const [showNivelModal, setShowNivelModal] = useState(false);
  const [nivelAnterior, setNivelAnterior] = useState(null);
  const [isLoading, setIsLoading] = useState(true);


  const toast = useToast();

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
          setShowNivelModal(true);
        }

        setNivelAnterior(nivelActual);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [userId]);

  // Guardar insignia en la base de datos
  useEffect(() => {
    const guardarInsignia = async () => {
      if (!userAuthenticated.Exp) return;

      const nuevaInsignia = niveles(userAuthenticated.Exp).insignia;
      const userRef = doc(db, 'users', userId);

      try {
        const userDoc = await getDoc(userRef);
        const currentInsignias = userDoc.data()?.Insignias || [];

        if (!currentInsignias.includes(nuevaInsignia)) {
          const updatedInsignias = [nuevaInsignia, ...currentInsignias];
          await updateDoc(userRef, {
            Insignias: updatedInsignias
          });
          console.log('Insignia agregada al principio con éxito');
        }
      } catch (error) {
        console.error('Error al actualizar insignias:', error);
      }
    };

    guardarInsignia();
  }, [userAuthenticated.Exp, userId]);

  if (isLoading) {
    return <ActivityIndicator size="large" color="#0000ff" />;
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
            <NivelModal
              Exp={userAuthenticated?.Exp}
              nivel={userAuthenticated?.Nivel}
              isVisible={showNivelModal}
              onClose={() => setShowNivelModal(false)}
            />

            <View style={styles.headerContainer}>
              <View style={styles.leftContainer}>
                <Avatar
                  size={60}
                  rounded
                  {
                    ...userAuthenticated?.FotoPerfil 
                      ? { source: { uri: userAuthenticated.FotoPerfil } }
                      : { title: userAuthenticated?.Name?.charAt(0) } 
                  }
                  avatarStyle={{ borderWidth: 1, borderColor: '#fff', backgroundColor: '#4f46e5',zIndex: -1,overflow: 'hidden',borderRadius: 100, }}
                />
                <View style={styles.userInfo}>
                  <Text style={styles.greeting}>
                    {`Hola!, ${userAuthenticated?.Name || 'Anónimo'}`}
                  </Text>
                  <View className="flex-row ">
                    <Text style={styles.level} >
                      {niveles(userAuthenticated?.Exp || 0).insignia}
                    </Text>
                  </View>
                </View>
              </View>

              <View style={styles.rachaContainer}>
                <Text style={styles.rachaText}>{userAuthenticated?.Racha || 0}</Text>
                <FontAwesome5 name="fire-alt" size={24} color="#FFD700" />
              </View>
            </View>

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
  headerContainer: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 10,
    marginBottom: 15,
  },
  leftContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userInfo: {
    marginLeft: 10,
  },
  greeting: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF', // Texto blanco para contrastar con el fondo oscuro
  },
  level: {
    fontSize: 14,
    color: '#FFFFFF', // Texto blanco
    
    borderRadius: 5,
  },
  rachaContainer: {
    position: 'relative',
    bottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)', // Fondo semi-transparente
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 50,
    gap: 5,
  },
  rachaText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFD700', // Texto dorado
    marginLeft: 5,
  },
});