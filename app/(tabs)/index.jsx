import { Text, View, StyleSheet, SafeAreaView, ScrollView, Alert, ActivityIndicator } from 'react-native';
import '../../global.css';
import {MaterialCommunityIcons} from '@expo/vector-icons';
import useAuth from '../authContext';
import React, { useEffect, useState} from 'react';
import { addDoc, arrayUnion, doc, getDoc, onSnapshot, orderBy, updateDoc } from 'firebase/firestore';
import {db } from '@/components/firebase/firebaseConfig';
import { Avatar } from 'react-native-paper';
import { niveles } from '@/components/Niveles/niveles';
import VersiculosDiarios from '@/components/VersiculoDiario/versiculoDiario';
import NivelModal from '@/components/Modales/modalNivel';
import { useNavigation } from 'expo-router';
import ExploraComponents from '@/components/exploraComponents/exploraComponents';
import ShareButton from '@/components/compartir/share';
import LottieView from 'lottie-react-native';





export default function AppComponent() {
  const { user } = useAuth();
  const navigation = useNavigation();
  const [userAuthenticated, setUserAuthenticated] = useState({});
  const [showNivelModal, setShowNivelModal] = useState(false);
  const [nivelAnterior, setNivelAnterior] = useState(null);
  const [isLoading, setIsLoading] = useState(true); // Nuevo estado de carga

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
      <SafeAreaView>
        <View style={styles.screen} className='bg-gray-100' >
        <ScrollView >
          <NivelModal
          Exp={userAuthenticated?.Exp}
            nivel={userAuthenticated?.Nivel}
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
            <ExploraComponents />
            <ShareButton />
            
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
    justifyContent: 'space-between', 
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

});
