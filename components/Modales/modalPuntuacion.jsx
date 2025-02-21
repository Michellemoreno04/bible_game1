import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Modal from 'react-native-modal';
import LottieView from 'lottie-react-native';
import { FontAwesome5, FontAwesome6 } from '@expo/vector-icons';
import { Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSound } from '../soundFunctions/soundFunction';

const { width } = Dimensions.get('window');
export function ModalPuntuacion({ isVisible, onClose, respuestasCorrectas, expGanada, monedasGanadas,userInfo }) {
   const playSound = useSound();
 
   useEffect(() => {
     if (isVisible) {
       playSound(require('../../assets/sound/goodresult.mp3'));
     }
   }, [isVisible]);
 
   return (
     <Modal isVisible={isVisible} backdropOpacity={0.3}>
       <LinearGradient
         colors={['#fdf2ff', '#e6d4ff', '#d8c4ff']}
         style={styles.gradientContainer}
       >
         <View style={styles.contentContainer}>
           <Text style={styles.subtitle}>🎉 Nueva recompensa 🎉</Text>
           
         
 
           <Text style={styles.streakText}>🔥 Racha actual: {userInfo.Racha} días consecutivos</Text>
 
           <View style={styles.animationContainer}>
             <LottieView
               source={require('../../assets/lottieFiles/treasureCoins.json')}
               autoPlay
               loop={false}
               style={styles.animation}
             />
             <Text style={styles.congratsText}>¡Felicidades!</Text>
             <View style={styles.confettiEffect}/>
           </View>
 
           <View style={styles.rewardsContainer}>
             <View style={styles.rewardItem}>
               <LinearGradient
                 colors={['#ffd700', '#ffbf00']}
                 style={[styles.iconContainer, styles.coinBackground]}
               >
                 <FontAwesome5 name="coins" size={32} color="#a88600" />
               </LinearGradient>
               <Text style={styles.rewardValue}>+{monedasGanadas}</Text>
               <Text style={styles.rewardLabel}>Monedas</Text>
             </View>
 
             <View style={styles.rewardItem}>
               <LinearGradient
                 colors={['#6a5acd', '#7b68ee']}
                 style={[styles.iconContainer, styles.expBackground]}
               >
                 <FontAwesome6 name="award" size={32} color="#fff" />
               </LinearGradient>
               <Text style={styles.rewardValue}>+{expGanada}</Text>
               <Text style={styles.rewardLabel}>Experiencia</Text>
             </View>
           </View>
 
           <View style={styles.progressContainer}>
             <Text style={styles.progressText}>
               {respuestasCorrectas}/10 respuestas correctas
             </Text>
             <View style={styles.progressBarBackground}>
               <LinearGradient
                 colors={['#76ff03', '#4CAF50']}
                 style={[styles.progressBarFill, { width: `${(respuestasCorrectas / 10) * 100}%` }]}
               />
             </View>
           </View>
 
           <Pressable onPress={onClose} style={styles.buttonContainer}>
             <LinearGradient
               colors={['#ff6b6b', '#ff8e53']}
               style={styles.buttonGradient}
             >
               <Text style={styles.buttonText}> Volver al inicio</Text>
             </LinearGradient>
           </Pressable>
         </View>
       </LinearGradient>
     </Modal>
   );
 }
 
 const styles = StyleSheet.create({
   gradientContainer: {
     width: '100%',
     borderRadius: 25,
     overflow: 'hidden',
   },
   contentContainer: {
     alignItems: 'center',
     padding: 15,
     paddingTop: 35,
   },
   subtitle: {
     fontSize: 18,
     color: '#6d4c41',
     marginBottom: 5,
     fontFamily: 'Inter-Bold',
     letterSpacing: 0.5,
   },
   titleContainer: {
     position: 'relative',
     marginBottom: 8,
   },
   titleBackground: {
     position: 'absolute',
     width: '120%',
     height: '150%',
     top: -5,
     left: -25,
     borderRadius: 20,
     transform: [{ rotate: '-0deg' }],
   },
   title: {
     fontSize: 42,
     fontWeight: '900',
     color: '#fff',
     textShadowColor: 'rgba(0, 0, 0, 0.2)',
     textShadowOffset: { width: 2, height: 2 },
     textShadowRadius: 5,
     transform: [{ rotate: '2deg' }],
   },
   streakText: {
     fontSize: 16,
     color: '#4a148c',
     marginBottom: 20,
     fontFamily: 'Inter-SemiBold',
     backgroundColor: '#fff3e0',
     paddingVertical: 6,
     paddingHorizontal: 15,
     borderRadius: 20,
     elevation: 3,
   },
   animationContainer: {
     position: 'relative',
     top: -50,
     marginBottom: -30,

   },
   animation: {
     width: 220,
     height: 220,
   },
   congratsText: {
     fontSize: 32,
     fontWeight: '800',
     color: '#4a148c',
     marginTop: -20,
     fontFamily: 'Inter-Black',
     textAlign: 'center',
   },
   confettiEffect: {
     position: 'absolute',
     top: -30,
     left: -30,
     right: -30,
     bottom: -30,
     backgroundColor: 'rgba(255, 223, 0, 0.1)',
     borderRadius: 50,
   },
   rewardsContainer: {
     flexDirection: 'row',
     justifyContent: 'center',
     gap: 35,
     marginVertical: 20,
   },
   rewardItem: {
     alignItems: 'center',
   },
   iconContainer: {
     padding: 18,
     borderRadius: 25,
     marginBottom: 15,
     shadowColor: '#000',
     shadowOffset: { width: 0, height: 4 },
     shadowOpacity: 0.3,
     shadowRadius: 6,
     elevation: 8,
   },
   rewardValue: {
     fontSize: 26,
     fontWeight: '900',
     color: '#4a148c',
     marginBottom: 4,
     fontFamily: 'Inter-Black',
   },
   rewardLabel: {
     fontSize: 16,
     color: '#6d4c41',
     fontFamily: 'Inter-SemiBold',
   },
   progressContainer: {
     width: '90%',
     marginVertical: 20,
   },
   progressText: {
     fontSize: 16,
     color: '#4a148c',
     marginBottom: 12,
     textAlign: 'center',
     fontFamily: 'Inter-SemiBold',
   },
   progressBarBackground: {
     height: 20,
     borderRadius: 10,
     backgroundColor: '#fff',
     overflow: 'hidden',
     borderWidth: 2,
     borderColor: '#4a148c',
   },
   progressBarFill: {
     height: '100%',
     borderRadius: 8,
   },
   buttonContainer: {
     width: '100%',
     marginTop: 15,
     shadowColor: '#ff6b6b',
     shadowOffset: { width: 0, height: 4 },
     shadowOpacity: 0.4,
     shadowRadius: 8,
   },
   buttonGradient: {
     paddingVertical: 16,
     borderRadius: 15,
     alignItems: 'center',
   },
   buttonText: {
     color: 'white',
     fontSize: 20,
     fontWeight: '900',
     fontFamily: 'Inter-Black',
     letterSpacing: 0.5,
   },
 });