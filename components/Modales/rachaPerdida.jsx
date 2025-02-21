import { View, Text, StyleSheet, Pressable, Alert } from 'react-native'
import React from 'react'
import Modal from 'react-native-modal' // Nota: Se recomienda usar "react-native-modal" para los props isVisible, animationIn, etc.
import { FontAwesome5 } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import LottieView from 'lottie-react-native'
import { doc, updateDoc } from 'firebase/firestore'
import { db } from '../../components/firebase/firebaseConfig'
import useAuth from '../authContext/authContext'

export function ModalRachaPerdida({ userInfo,isVisible, setShowModalRachaPerdida }) {
  const { user } = useAuth();

  const userId = user.uid;
  const coinsRequired = 500;

  // Funciones dummy para manejar las acciones de los botones.
  const userDocRef = doc(db, 'users', userId);

  const handlePay = () => {
   const coins = userInfo.Monedas;
if (coins >= coinsRequired) {
  const coinsAfterPayment = coins - coinsRequired;
  updateDoc(userDocRef, {
    Monedas: coinsAfterPayment
  });
}else{
  Alert.alert('No tienes suficientes monedas para pagar.','quieres ver videos para obtener monedas?');
}
  setShowModalRachaPerdida(false);  
  
  
  
  }

  // lógica para reiniciar la racha (sin pago).
  const handleReset = () => {
    console.log("La racha se reinicia.");
   const rachaReiniciada = 1;

    updateDoc(userDocRef, {
      Racha: rachaReiniciada
    });

    setShowModalRachaPerdida(false);

  };

  return (
    <Modal isVisible={isVisible} animationIn="zoomIn" animationOut="zoomOut">
      <View style={styles.modalContainer}>
        {/* Título del modal */}
        <Text style={styles.title}>😢 Racha Perdida 😢</Text>

        {/* Contenedor de la animación */}
        <View style={styles.animationContainer}>
          <LottieView
            source={require('../../assets/lottieFiles/fireRachaIcon.json')}
            autoPlay
            loop={true}
            style={{ width: 180, height: 180 }}
          />
        </View>

        {/* Mensaje indicando la pérdida de la racha */}
        <Text style={styles.highlightedText}>
          ¡Oh no! Has perdido tu racha.
        </Text>
        <Text className="text-gray-600 text-center">
          No te desanimes, lo importante es seguir aprendiendo y reforsando tus conocimientos biblicos.
        </Text>
        {/* Mensaje motivador y que invita a pagar monedas para mantener la racha */}
        <Text style={styles.motivationalText}>
          Pero puedes pagar{' '}
          <FontAwesome5 name="coins" size={18} color="#FFD700" /> {coinsRequired} monedas para mantenerla.
        </Text>

        {/* Contenedor de estadísticas */}
        <View style={styles.statsContainer}>
          {/* Estadística de la racha actual (reiniciada a 0) */}
          <View style={[styles.statBox, styles.elevatedBox]}>
            <View style={styles.iconBadge}>
              <FontAwesome5 name="frown" size={28} color="#6C757D" />
            </View>
            <Text style={styles.statNumber}>{userInfo?.Racha}</Text>
            <Text style={styles.statLabel}>Racha Actual</Text>
          </View>

          {/* Estadística del récord personal */}
          <View style={[styles.statBox, styles.elevatedBox]}>
            <View style={styles.iconBadge}>
              <FontAwesome5 name="trophy" size={28} color="#FFD700" />
            </View>
            <Text style={styles.statNumber}>{userInfo?.RachaMaxima}</Text>
            <Text style={styles.statLabel}>Racha Maxima</Text>
          </View>
        </View>

        {/* Contenedor de botones de acción */}
        <View style={styles.footerContainer}>
          {/* Botón para pagar y mantener la racha */}
          <Pressable
            style={({ pressed }) => [
              styles.buttonWrapper,
              pressed && { transform: [{ scale: 0.95 }] },
            ]}
            onPress={handlePay}
          >
            <LinearGradient
              colors={['#FFD700', '#FFA500']}
              style={styles.gradientButton}
            >
              <Text style={styles.buttonText}>Pagar y Mantener</Text>
            </LinearGradient>
          </Pressable>
          {/* Botón para reiniciar la racha sin pago */}
          <Pressable
            style={({ pressed }) => [
              styles.buttonWrapper,
              pressed && { transform: [{ scale: 0.95 }] },
            ]}
            onPress={handleReset}
          >
            <LinearGradient
              colors={['#6C757D', '#A9A9A9']}
              style={styles.gradientButton}
            >
              <Text style={styles.buttonText}>Reiniciar Racha</Text>
            </LinearGradient>
          </Pressable>
        </View>
      </View>
    </Modal>
  )
}

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
    fontSize: 20,
    fontWeight: '700',
    color: '#FF6B35',
    textAlign: 'center',
    lineHeight: 30,
    marginVertical: 10,
  },
  motivationalText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2F4858',
    textAlign: 'center',
    marginBottom: 20,
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
  footerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
    marginTop: 15,
  },
  buttonWrapper: {
    width: '48%',
    borderRadius: 15,
    overflow: 'hidden',
  },
  gradientButton: {
    padding: 15,
  
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 15,
    marginHorizontal: 5,

  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});
