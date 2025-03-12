import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Share, Alert,ActivityIndicator, Platform } from 'react-native';
import * as Speech from 'expo-speech';
import { FontAwesome6, FontAwesome, MaterialIcons, Feather } from '@expo/vector-icons';
import useAuth from  '../components/authContext/authContext';
import { db } from '../components/firebase/firebaseConfig';
import { addDoc, collection, doc, getDoc, getDocs, query, where, orderBy, startAfter, limit } from 'firebase/firestore';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useToast } from 'react-native-toast-notifications';
import { InterstitialAd, AdEventType, TestIds } from 'react-native-google-mobile-ads';


const adUnitId = __DEV__ ? TestIds.INTERSTITIAL: process.env.EXPO_PUBLIC_INTERSTITIAL_ID; 

// Crea la instancia del anuncio
const interstitial = InterstitialAd.createForAdRequest(adUnitId, {
  keywords: ['religion', 'bible']// esto es para anuncios personalizados
});


const DailyReading = () => {
  const { user } = useAuth();
  const navigation = useNavigation();
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
  const [isRead, setIsRead] = useState(false);
  const [readingText, setReadingText] = useState([]);
  const [interstitialLoaded, setInternitialLoaded] = useState(false);
  const userId = user.uid;
  const toast = useToast();

useEffect(() => {
    try {
      const unsubscribeLoaded = interstitial.addAdEventListener(AdEventType.LOADED, () => {
        setInternitialLoaded(true);
      });
  
      const unsubscribeOpened = interstitial.addAdEventListener(AdEventType.OPENED, () => {
        if (Platform.OS === 'ios') {
          // Prevent the close button from being unreachable by hiding the status bar on iOS
          StatusBar.setHidden(true)
        }
      });
  
      const unsubscribeClosed = interstitial.addAdEventListener(AdEventType.CLOSED, () => {
        if (Platform.OS === 'ios') {
          StatusBar.setHidden(false)
        }
        navigation.navigate('(tabs)');
      });
  
      // Start loading the interstitial straight away
      interstitial.load();
 
      console.log('interstitial cargado')

    // Unsubscribe from events on unmount
    return () => {
      unsubscribeLoaded();
      unsubscribeOpened();
      unsubscribeClosed();
    };
    
  } catch (error) {
    console.log(error)
        }
  }, [navigation]);

  const showInterstitial = () => {
    if(interstitialLoaded){
         interstitial.show();
   
       } else {
         navigation.navigate('(tabs)'); // Si no hay anuncio, ir a Home directamente
       }
  }

  // Efecto para obtener el texto de lectura
  useEffect(() => {
    const fetchReadingText = async () => {
      try {
        // 1. Se referencia el documento del usuario y la subcolección "lecturasVistas"
        const userDocRef = doc(db, 'users', user?.uid);
        const lecturasVistasRef = collection(userDocRef, 'lecturasVistas');

        // 2. Se consulta la última lectura vista ordenando por "index" de forma descendente
        const lastReadQuery = query(lecturasVistasRef, orderBy('index', 'desc'), limit(1));
        const lastReadSnapshot = await getDocs(lastReadQuery);

        // 3. Se obtiene el índice de la última lectura o se inicia en 0 si no hay lecturas previas
        let lastIndex = 0;
        if (!lastReadSnapshot.empty) {
          lastIndex = lastReadSnapshot.docs[0].data().index;
        }

        // 4. Se consulta la siguiente lectura en base al índice
        const lecturasQuery = query(
          lecturasVistasRef,
          orderBy('index'),
          startAfter(lastIndex),
          limit(1)
        );
        let lecturasSnapshot = await getDocs(lecturasQuery);
        let nuevasLecturas = [];

        // 5. Si no hay lecturas en "lecturasVistas", se consulta la colección de contenido diario
        if (lecturasSnapshot.empty) {
          const dailyContentRef = collection(db, 'dailyRearingContent');
          const dailyQuery = query(dailyContentRef, limit(1));
          lecturasSnapshot = await getDocs(dailyQuery);
          nuevasLecturas = lecturasSnapshot.docs.map((doc) => ({
            lecturaId: doc.id,
            ...doc.data(),
          }));
        } else {
          nuevasLecturas = lecturasSnapshot.docs.map((doc) => ({
            lecturaId: doc.id,
            ...doc.data(),
          }));
        }

        // 6. Se actualiza el estado con la lectura obtenida
        setReadingText(nuevasLecturas);
      } catch (error) {
        console.error('Error al obtener el texto de lectura:', error);
      }
    };

    fetchReadingText();
  }, [user]);

  // Función para reproducir el texto con Speech
  const handleSpeak = () => {
    if (readingText.length === 0) return;
    // Se combina el título y el texto para reproducirlos
    const textToSpeak = `${readingText[0].titulo}. ${readingText[0].texto}`;

    if (!isSpeaking) {
      Speech.speak(textToSpeak, {
        language: 'es',
        pitch: 0.7,
        rate: 0.8,
        onStart: () => setIsSpeaking(true),
        onDone: () => setIsSpeaking(false),
        onStopped: () => setIsSpeaking(false),
      });
    } else {
      Speech.stop();
      setIsSpeaking(false);
    }
  };

  // Función para alternar el estado del checkbox
  const handleCheckbox = () => {
    setIsChecked(!isChecked);
  };

  // Función para obtener la fecha local en formato YYYY-MM-DD
  const getLocalDateString = () => {
    const date = new Date();
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  };

  // Función para guardar la lectura en la subcolección "lecturasVistas"
  const handleReading = async () => {
    try {
      const today = getLocalDateString();
      const userRef = doc(db, 'users', userId);
      // Usar la misma subcolección para guardar la lectura ya vista
      const lecturasVistasRef = collection(userRef, 'lecturasVistas');

      // Verificar si ya existe una lectura con el mismo título en el día de hoy
      const q = query(
        lecturasVistasRef,
        where('fechaStr', '==', today),
        where('titulo', '==', readingText[0].titulo)
      );
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        Alert.alert('¡Ya guardaste esta lectura hoy!');
        return;
      }

      // Guardar la lectura en la subcolección con los datos necesarios
      await addDoc(lecturasVistasRef, {
        index: readingText[0].index,
        titulo: readingText[0].titulo,
        lectura: readingText[0].texto,
        fecha: new Date(),
        fechaStr: today,
      });
      const fechaActual = new Date().toDateString();
      await AsyncStorage.setItem("lastReadingDate", fechaActual);
      console.log('last reading date saved:', today);
      toast.show('Guardado', 'La lectura se ha guardado con éxito.', {
        type: 'success',
        duration: 2000,
        placement: 'top',
      });
      setIsSpeaking(false);
      

      setIsChecked(false);
      showInterstitial(); // Mostrar el anuncio
    } catch (error) {
      console.error('Error al guardar:', error);
      Alert.alert('Error', 'No se pudo guardar la lectura');
    }
  };

  // Función para compartir la lectura
  const handleShareReading = async () => {
    try {
      // Se comparte el título y el texto concatenados
      await Share.share({
        title: 'Reflexión Diaria',
        message: `${readingText[0].titulo}. ${readingText[0].texto}`,
      });
    } catch (error) {
      Alert.alert('Error al compartir la lectura.');
    }
  };

  if (readingText.length === 0) {
    return <ActivityIndicator size="large" color="#007AFF" />;
  }



  return (
    <View style={styles.container}>
      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {readingText.map((item) => (
          <View key={item.lecturaId} style={styles.card}>
            <Text style={styles.title}>{item.titulo}</Text>
            <Text style={styles.text}>{item.texto}</Text>
          </View>
        ))}

        {/* Controlador de audio */}
        <View style={styles.audioControls}>
          <TouchableOpacity 
            style={[styles.audioButton, isSpeaking && styles.activeAudioButton]}
            onPress={handleSpeak}
            activeOpacity={0.8}
          >
            <FontAwesome6 
              name={isSpeaking ? "pause" : "play"} 
              size={28} 
              color="white" 
              style={styles.audioIcon}
            />
            <Text style={styles.audioButtonText}>
              {isSpeaking ? "Pausar lectura" : "Escuchar lectura"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Checkbox para marcar como leído */}
        <TouchableOpacity 
          style={styles.checkboxContainer}
          onPress={handleCheckbox}
          activeOpacity={0.8}
        >
          <View style={[styles.checkbox, isChecked && styles.checked]}>
            {isChecked && <Feather name="check" size={18} color="white" />}
          </View>
          <Text style={styles.checkboxText}>Marcar como leído</Text>
        </TouchableOpacity>

        {/* Botones adicionales */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity 
            style={[styles.actionButton, styles.shareButton]}
            onPress={handleShareReading}
            activeOpacity={0.8}
          >
            <MaterialIcons name="share" size={22} color="white" />
            <Text style={styles.actionButtonText}>Compartir</Text>
          </TouchableOpacity>
          
          {isChecked && !isRead && (
            <TouchableOpacity 
              style={[styles.actionButton, styles.readButton]}
              onPress={handleReading}
              activeOpacity={0.8}
            >
              <FontAwesome name="check" size={18} color="white" />
              <Text style={styles.actionButtonText}>Leído</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#F9F9F9',
      paddingHorizontal: 16,
    },
    scrollContainer: {
      paddingVertical: 10,
    },
    card: {
      backgroundColor: 'white',
      borderRadius: 16,
      padding: 10,
      marginBottom: 30,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 6,
      elevation: 3,
    },
    title: {
      fontSize: 28,
      fontWeight: '800',
      color: '#1A1A1A',
      marginBottom: 20,
      textAlign: 'center',
      lineHeight: 34,
    },
    text: {
      fontSize: 17,
      color: '#444',
      lineHeight: 28,
      textAlign: 'justify',
    },
    audioControls: {
      marginBottom: 25,
      alignItems: 'center',
    },
    audioButton: {
      backgroundColor: '#2196F3',
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 14,
      paddingHorizontal: 24,
      borderRadius: 50,
      shadowColor: '#2196F3',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 10,
      elevation: 3,
    },
    activeAudioButton: {
      backgroundColor: '#1976D2',
    },
    audioIcon: {
      marginRight: 12,
    },
    audioButtonText: {
      fontSize: 16,
      fontWeight: '600',
      color: 'white',
    },
    checkboxContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 30,
      alignSelf: 'center',
    },
    checkbox: {
      width: 24,
      height: 24,
      borderRadius: 6,
      borderWidth: 2,
      borderColor: '#DDD',
      marginRight: 12,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'white',
    },
    checked: {
      backgroundColor: '#4CAF50',
      borderColor: '#4CAF50',
    },
    checkboxText: {
      fontSize: 16,
      color: '#444',
      fontWeight: '500',
    },
    actionsContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
      gap: 15,
    },
    actionButton: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 12,
      paddingHorizontal: 20,
      borderRadius: 50,
      minWidth: 120,
      justifyContent: 'center',
    },
    shareButton: {
      backgroundColor: '#6200EE',
    },
    readButton: {
      backgroundColor: '#4CAF50',
    },
    actionButtonText: {
      fontSize: 16,
      fontWeight: '600',
      color: 'white',
      marginLeft: 10,
    },
  });
  
  export default DailyReading;