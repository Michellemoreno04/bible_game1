import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Share, Alert } from 'react-native';
import Checkbox from 'expo-checkbox';
import * as Speech from 'expo-speech';
import { FontAwesome6, FontAwesome, MaterialIcons } from '@expo/vector-icons';
import useAuth from  '../app/authContext';
import { db } from '../components/firebase/firebaseConfig';
import { addDoc, collection, doc, getDocs, query, where } from 'firebase/firestore';
import { useNavigation } from '@react-navigation/native';



const DailyReading = () => {
  const {user} = useAuth();
  const navigation = useNavigation();
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
  const [isRead, setIsRead] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const userId = user.uid;

const titulo = 'Reflexión Diaria';
  const readingText = `
    En el principio, Dios creó los cielos y la tierra. La tierra estaba desordenada y vacía, y las tinieblas cubrían la faz del abismo. Pero el Espíritu de Dios se movía sobre la superficie de las aguas.

    Y dijo Dios: "Sea la luz". Y hubo luz. Dios vio que la luz era buena, y separó la luz de las tinieblas. Llamó a la luz "día" y a las tinieblas "noche". Y fue la tarde y la mañana del primer día.

    Así comenzó la creación del mundo, un acto de amor y poder infinito. Cada día, Dios añadió algo nuevo: los cielos, los mares, la tierra, las plantas, los animales y, finalmente, al ser humano, creado a su imagen y semejanza.

    Esta historia nos recuerda que somos parte de un plan divino, diseñado con propósito y amor. Cada día es una oportunidad para reflexionar sobre nuestra relación con Dios y su creación.
  `;

  const handleSpeak = () => {
    if (!isSpeaking) {
      Speech.speak(readingText, {
        language: 'es', // Idioma español
        pitch: 1, // Tono de voz
        rate: 1, // Velocidad de lectura
        
        onStart: () => setIsSpeaking(true),
        onDone: () => setIsSpeaking(false),
        onStopped: () => setIsSpeaking(false),
      });
    } else {
      Speech.stop();
      setIsSpeaking(false);
    }
  };

  const handleCheckbox = () => {
    setIsChecked(!isChecked);
  };
  // Función para obtener fecha local en formato YYYY-MM-DD
const getLocalDateString = () => {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
};

const handleReading = async () => {
  if (!isChecked) {
    Alert.alert('Debes marcar la casilla para confirmar la lectura');
    return;
  }

  try {
    const today = getLocalDateString();
    const userRef = doc(db, 'users', userId);
    const lecturasRef = collection(userRef, 'lecturasDiarias');

    // Verificar si ya existe una lectura con el mismo título hoy
    const q = query(
      lecturasRef,
      where('fechaStr', '==', today),
      where('titulo', '==', titulo)
    );
    
    const snapshot = await getDocs(q);
    
    if (!snapshot.empty) {
      Alert.alert('¡Ya guardaste esta lectura hoy!');
      return;
    }

    // Guardar nueva lectura
    await addDoc(lecturasRef, {
      titulo: titulo,
      lectura: readingText,
      fecha: new Date(),
      fechaStr: today // Campo adicional para búsquedas
    });
     Alert.alert('Guardado', 'La lectura se ha guardado con éxito.');
    navigation.navigate('(tabs)');
    setIsChecked(false); // Resetear checkbox
  } catch (error) {
    console.error('Error al guardar:', error);
    Alert.alert('Error', 'No se pudo guardar la lectura');
  }
};

  // Función para compartir la lectura
  const handleShareReading = async () => {
    try {
      // Attempt to share the reading text
      await Share.share({
        title: 'Reflexión Diaria', // Title for the share dialog
        message: readingText, // The content to be shared
        title: 'Reflexión Diaria',
        message: readingText,
      });
    } catch (error) {
      // Handle any errors that occur during sharing
      alert('Error al compartir la lectura.');
    }
  };


  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.title}>{titulo || 'Reflexión Diaria'}</Text>
        <Text style={styles.text}>{readingText}</Text>

        {/* Controlador de audio */}
        <View style={styles.audioControls}>
          <TouchableOpacity style={styles.audioButton} onPress={handleSpeak}>
            <FontAwesome6 name={isSpeaking ? "pause" : "play"} size={24} color="white" />
            <Text style={styles.audioButtonText}>{isSpeaking ? "Pausar" : "Escuchar"}</Text>
          </TouchableOpacity>
        </View>

        {/* Checkbox para marcar como leído */}
        <View style={styles.checkboxContainer}>
          <Checkbox style={styles.checkbox} value={isChecked} onValueChange={handleCheckbox} />
          <Text style={styles.checkboxText}>Marcar como leído</Text>
         
        </View>

        {/* Botones adicionales */}
        <View style={styles.actionsContainer}>
       
          <TouchableOpacity style={styles.actionButton} onPress={handleShareReading}>
            <MaterialIcons name="share" size={24} color="white" />
            <Text style={styles.actionButtonText}>Compartir</Text>
          </TouchableOpacity>
          
          {isChecked && !isRead && (
            <TouchableOpacity style={styles.readButton} onPress={handleReading}>
              <FontAwesome name="check" size={20} color="white" />
              <Text style={styles.readButtonText}>Leído</Text>
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
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 10,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 20,
  },
  text: {
    fontSize: 18,
    color: '#555',
    textAlign: 'justify',
    lineHeight: 28,
    marginBottom: 30,
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 15,
  },
  audioControls: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
  },
  audioButton: {
    backgroundColor: '#4CAF50',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 25,
  },
  audioButtonText: {
    fontSize: 16,
    color: 'white',
    marginLeft: 10,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  checkboxText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 10,
  },
  readButton: {
    backgroundColor: '#03DAC6',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 25,
    marginLeft: 10,
  },
  readButtonText: {
    fontSize: 16,
    color: 'white',
    marginLeft: 10,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 20,
  },
  actionButton: {
    backgroundColor: '#6200EE',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 25,
  },
  actionButtonText: {
    fontSize: 16,
    color: 'white',
    marginLeft: 10,
  },
});

export default DailyReading;