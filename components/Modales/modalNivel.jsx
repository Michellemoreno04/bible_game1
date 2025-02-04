import { View, Text, StyleSheet } from 'react-native';
import { AntDesign } from '@expo/vector-icons';
import Modal from 'react-native-modal';
import { Pressable } from 'react-native';
import { niveles } from '../Niveles/niveles';
import LottieView from 'lottie-react-native';


export default function NivelModal({ nivel, isVisible, onClose, Exp }) {
  const insignia = niveles(Exp).insignia;

  return (
    <Modal
      animationType="slide"
      transparent={true}
      isVisible={isVisible}
      onBackdropPress={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          
          <View style={styles.header}>
            <AntDesign name="star" size={28} color="#FFD700" />
            <Text style={styles.modalTitle}>¡Nivel Alcanzado!</Text>
            <AntDesign name="star" size={28} color="#FFD700" />
         
          </View>
          <LottieView
            autoPlay
            loop
            style={styles.lottie}
            source={require('../../assets/lottieFiles/angel-nivel.json')}
            resizeMode='contain'
          />
          <View style={styles.insigniaContainer}>
            <Text style={styles.insigniaText}>{insignia}</Text>
            <View style={styles.insigniaGlow} />
          </View>

          <Text style={styles.modalText}>
            Has alcanzado el nivel {' '}
            <Text style={styles.levelText}>{nivel}</Text>
          </Text>

          <Pressable 
            style={styles.button}
            onPress={onClose}
          >
            <Text style={styles.buttonText}>Continuar</Text>
            <AntDesign name="arrowright" size={20} color="white" />
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    width: '100%',
    height: '100%',
    
    justifyContent: 'center',
    alignItems: 'center',
    
  },
  modalContent: {
    width: '100%',
    backgroundColor: '#2A2F4D',
    borderRadius: 25,
    padding: 25,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#3E4570',
    transform: [{ translateY: -20 }],
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 15,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFD700',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  lottie: {
    width: 200,
    height: 200,
   
  },
  insigniaContainer: {
    backgroundColor: '#FFD700',
    padding: 20,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 20,
    borderWidth: 4,
    borderColor: '#FFFFFF',
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  insigniaGlow: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: 50,
    backgroundColor: '#FFD700',
    opacity: 0.3,
  },
  insigniaText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  levelText: {
    color: '#00E0FF',
    fontSize: 28,
    fontWeight: '900',
    textShadowColor: 'rgba(0, 173, 181, 0.4)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  modalText: {
    fontSize: 16,
    color: '#EEEEEE',
    textAlign: 'center',
    marginBottom: 25,
    lineHeight: 22,
    letterSpacing: 0.5,
  },
  button: {
   
    backgroundColor: '#00ADB5',
    paddingVertical: 12,
    paddingHorizontal: 35,
    borderRadius: 30,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
 
  buttonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});