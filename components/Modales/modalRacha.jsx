import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Modal from 'react-native-modal';
import LottieView from 'lottie-react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { Pressable } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { db } from '../../components/firebase/firebaseConfig';
import { doc, onSnapshot } from 'firebase/firestore';
import useAuth from '@/app/authContext';
import { useSound } from '../soundFunctions/soundFunction';


export function ModalRacha({ isVisible, setShowModalRacha }) {
const { user } = useAuth();
  const  playSound  = useSound();
  const navigation = useNavigation();
  const [userInfo, setUserInfo] = useState({});

useEffect(() => {
  if (isVisible) {
    playSound(require('../../assets/sound/rachaSound.mp3'));
  }

}, [isVisible]);




  useEffect(() => {
    const userDocRef = doc(db, 'users', user.uid);
    const unsubscribe = onSnapshot(userDocRef, (doc) => {
      if (doc.exists()) {
        const userData = doc.data();
        setUserInfo(userData);
      }
     

    });

    return () => {
      unsubscribe();
    };
  }, []);

 



   // Función para cerrar el modal
    const closeModal = () => {
      
    setShowModalRacha(false);
      
      navigation.navigate('(tabs)');
    };

  return (
    <Modal isVisible={isVisible}>
      <View style={styles.modalContainer}>
        <Text style={styles.title}>Racha Diaria</Text>

        <View style={styles.animationContainer}>
          <LottieView
            source={require('../../assets/lottieFiles/fireRachaIcon.json')}
            autoPlay
            loop
            style={{ width: 200, height: 200 }}
          />
        </View>

        <Text style={styles.highlightedText}>¡Sigue manteniendo tu racha!</Text>

        <View style={styles.statsContainer}>
          <View style={styles.statBox}>
            <Text style={styles.statText}>
              {userInfo.Racha}
              <FontAwesome5 name="fire" size={24} color="orange" />
            </Text>
            <Text style={styles.labelText}>Días acumulados</Text>
          </View>

          <View style={styles.statBox}>
            <Text style={styles.statText}>
              {userInfo.RachaMaxima}
              <FontAwesome5 name="trophy" size={24} color="gold" />
            </Text>
            <Text style={styles.labelText}>Máxima racha</Text>
          </View>
        </View>

        <View style={styles.footerContainer}>
            <Text style={styles.footerText}>¡Sigue así! 🎉</Text>
          <Pressable style={styles.closeButton} onPress={closeModal}>
            <Text style={styles.closeButtonText}>Volver</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    borderRadius: 10,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  animationContainer: {
    width: 200,
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#4CAF50',
    borderRadius: 100,
    marginBottom: 20,
    borderColor: 'green',
    borderWidth: 5,
  },
  highlightedText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  statsContainer: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  statBox: {
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 10,
  },
  statText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  labelText: {
    fontSize: 16,
    color: '#555',
  },
  footerContainer: {
    width: '100%',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 16,
    marginBottom: 20,
  },
  closeButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
