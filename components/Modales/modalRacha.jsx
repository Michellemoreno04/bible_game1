import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Modal from 'react-native-modal';
import LottieView from 'lottie-react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { Pressable } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { db } from '../../components/firebase/firebaseConfig';
import { doc, onSnapshot } from 'firebase/firestore';
import useAuth from '../authContext/authContext';
import { useSound } from '../soundFunctions/soundFunction';
import { LinearGradient } from 'expo-linear-gradient';


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
    <Modal isVisible={isVisible} animationIn="zoomIn" animationOut="zoomOut">
    <View style={styles.modalContainer}>
      <Text style={styles.title}>🔥 Récord Diario 🔥</Text>
  
      {/* Anillo de progreso alrededor de la animación */}
      <View style={styles.progressRing}>
        <View style={styles.animationContainer}>
          <LottieView
            source={require('../../assets/lottieFiles/fireRachaIcon.json')}
            autoPlay
            loop
            style={{ width: 180, height: 180 }}
          />
        </View>
      </View>
  
      <Text style={styles.highlightedText}>
        ¡Estás en llamas!{'\n'}Sigue así 🔥
      </Text>
  
      <View style={styles.statsContainer}>
        <View style={[styles.statBox, styles.elevatedBox]}>
          <View style={styles.iconBadge}>
            <FontAwesome5 name="fire" size={28} color="#FF6B35" />
          </View>
          <Text style={styles.statNumber}>{userInfo.Racha}</Text>
          <Text style={styles.statLabel}>Días consecutivos</Text>
        </View>
  
        <View style={[styles.statBox, styles.elevatedBox]}>
          <View style={styles.iconBadge}>
            <FontAwesome5 name="trophy" size={28} color="#FFD700" />
          </View>
          <Text style={styles.statNumber}>{userInfo.RachaMaxima}</Text>
          <Text style={styles.statLabel}>Racha máxima</Text>
        </View>
      </View>
  
      <View style={styles.footerContainer}>
        <Pressable 
          style={({pressed}) => [
            styles.closeButton,
            pressed && {transform: [{scale: 0.95}]}
          ]} 
          onPress={closeModal}
        >
          <LinearGradient
            colors={['#FF6B35', '#FF8E53']}
            style={styles.gradientButton}
          >
            <Text style={styles.closeButtonText}>¡Continuar racha!</Text>
          </LinearGradient>
        </Pressable>
      </View>
    </View>
  </Modal>
  )}

  const styles = StyleSheet.create({
    modalContainer: {
      backgroundColor: '#FFF9F2',
      borderRadius: 25,
      padding: 25,
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.1,
      shadowRadius: 20,
      elevation: 10,
    },
    title: {
      fontSize: 28,
      fontWeight: '800',
      color: '#2F4858',
      marginBottom: 15,
      textAlign: 'center',
      letterSpacing: 0.5,
    },
    progressRing: {
      borderRadius: 150,
      padding: 10,
      backgroundColor: '#FFF2E6',
      marginVertical: 20,
      shadowColor: '#FF6B35',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.3,
      shadowRadius: 15,
    },
    animationContainer: {
      width: 200,
      height: 200,
      borderRadius: 100,
      overflow: 'hidden',
      backgroundColor: '#FFEEDD',
      borderWidth: 5,
      borderColor: '#FFD6B3',
    },
    highlightedText: {
      fontSize: 22,
      fontWeight: '700',
      color: '#FF6B35',
      textAlign: 'center',
      lineHeight: 30,
      marginVertical: 15,
    },
    statsContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      width: '100%',
      marginVertical: 20,
    },
    statBox: {
      alignItems: 'center',
      padding: 20,
      borderRadius: 15,
      flex: 1,
      marginHorizontal: 5,
      backgroundColor: 'white',
    },
    elevatedBox: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 5 },
      shadowOpacity: 0.1,
      shadowRadius: 10,
      elevation: 5,
    },
    iconBadge: {
      backgroundColor: '#FFF2E6',
      padding: 12,
      borderRadius: 50,
      marginBottom: 10,
    },
    statNumber: {
      fontSize: 32,
      fontWeight: '900',
      color: '#2F4858',
      marginBottom: 5,
    },
    statLabel: {
      fontSize: 14,
      color: '#6C757D',
      fontWeight: '600',
      textAlign: 'center',
    },
    closeButton: {
      width: '100%',
      borderRadius: 15,
      overflow: 'hidden',
      marginTop: 15,
    },
    gradientButton: {
      paddingVertical: 15,
      paddingHorizontal: 40,
      alignItems: 'center',
      borderRadius: 30,
    },
    closeButtonText: {
      color: 'white',
      fontSize: 18,
      fontWeight: '700',
      letterSpacing: 0.5,
    },
    footerText: {
      fontSize: 16,
      color: '#6C757D',
      marginTop: 15,
      fontStyle: 'italic',
    },
  });
