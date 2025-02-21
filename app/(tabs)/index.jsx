import { Text, View, StyleSheet, SafeAreaView, ScrollView, Alert, ActivityIndicator,Image } from 'react-native';
import '../../global.css';
import {FontAwesome5, MaterialCommunityIcons} from '@expo/vector-icons';
import useAuth from '../../components/authContext/authContext';
import React, { useEffect, useState} from 'react';
import { doc, getDoc, onSnapshot, updateDoc } from 'firebase/firestore';
import {db } from '@/components/firebase/firebaseConfig';

import { niveles } from '@/components/Niveles/niveles';
import VersiculosDiarios from '@/components/VersiculoDiario/versiculoDiario';
import NivelModal from '@/components/Modales/modalNivel';
import { Link, useNavigation } from 'expo-router';
import ShareButton from '@/components/compartir/share';
import { LinearGradient } from 'expo-linear-gradient';
import { Avatar } from '@rneui/base';
import ExploraComponent from '@/components/exploraComponents/exploraComponent';
import GuardadosComponents from '@/components/exploraComponents/guardadosComponents';

export default function AppComponent() {
  const { user } = useAuth();
  const navigation = useNavigation();
  const [userAuthenticated, setUserAuthenticated] = useState({});
  const [showNivelModal, setShowNivelModal] = useState(false);
  const [nivelAnterior, setNivelAnterior] = useState(null);
  const [isLoading, setIsLoading] = useState(true); // Nuevo estado de carga

  const userId = user?.uid;
 // Función para verificar si el usuario está autenticado
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
            'Has subido de nivel',
            `Has subido del nivel ${nivelAnterior} al ${nivelActual}`,
            [{ text: 'OK', onPress: () => setShowNivelModal(true) }]
          );
        }

        setNivelAnterior(nivelActual);
      }
      setIsLoading(false); // Finaliza la carga
    });

    return () => unsubscribe();
  }, [userId]);

// Función para guardar la insignia
  useEffect(() => {
    const guardarInsignia = async () => {
        if (!userAuthenticated.Exp) return;

        const nuevaInsignia = niveles(userAuthenticated.Exp).insignia;
        const userRef = doc(db, 'users', userId);

        try {
            // Obtener el documento actual
            const userDoc = await getDoc(userRef);
            const currentInsignias = userDoc.data()?.Insignias || [];

            // Verificar si la insignia ya existe para no duplicar
            if (!currentInsignias.includes(nuevaInsignia)) {
                // Crear nuevo array con la insignia nueva al principio
                const updatedInsignias = [nuevaInsignia, ...currentInsignias];

                // Actualizar el documento
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
      colors={['#ffffff', '#e8f4f8']}
      style={styles.container}
    >
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView >
        <View style={styles.screen} >
          <NivelModal
          Exp={userAuthenticated?.Exp}
            nivel={userAuthenticated?.Nivel}
            isVisible={showNivelModal}
            onClose={() => setShowNivelModal(false)}
          />
          
          
          <View style={styles.headerContainer}>
  {/* Contenedor Izquierdo: Avatar e Información */}
  <View style={styles.leftContainer}>
    <Avatar
    size={60}
    rounded
     source={require('../../assets/images/Loader.png')} />
    <View style={styles.userInfo}>
      <Text style={styles.greeting}>
        {`Hola!, ${userAuthenticated?.Name || 'Anónimo'}`}
      </Text>
      <View  className=" flex-row items-center">

      <Text style={styles.level} className="bg-blue-100">
        {`Nivel ${niveles(userAuthenticated?.Exp || 0).nivel} -> ${niveles(userAuthenticated?.Exp || 0).insignia}`}
      </Text>
      <MaterialCommunityIcons name="medal" size={20} color="#f59e0b"/>
                            </View>
    </View>
  </View>

  {/* Contenedor Derecho: Racha */}
  <View style={styles.rachaContainer}>
    <Text style={styles.rachaText}>{userAuthenticated?.Racha || 0}</Text>
    <FontAwesome5 name="fire-alt" size={24} color="#FFD700" />
  </View>
</View>


            <VersiculosDiarios />
            <ExploraComponent />
            <GuardadosComponents />
            <ShareButton />
            
          </View>
        </ScrollView>
          </SafeAreaView>
      
          </LinearGradient>
  );
}



const styles = StyleSheet.create({
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
  },
  level: {
    fontSize: 14,
    color: '#555',
    padding: 5,
    borderRadius: 5,
    
  },

  rachaContainer: {
    position: 'relative',
    bottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF3E0',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 50,
    gap: 5,
  },
  rachaText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFA000',
    marginLeft: 5,
  },

});
