import React, { useEffect } from 'react';
import { View, Text,StyleSheet } from 'react-native';
import Modal from 'react-native-modal';
import LottieView from 'lottie-react-native';
import { FontAwesome5, FontAwesome6 } from '@expo/vector-icons';
import { ProgressBar } from 'react-native-paper';
import { Pressable } from 'react-native';
import { useSound } from '../soundFunctions/soundFunction';

// Modal para mostrar la puntuación obtenida en la trivia
export function ModalPuntuacion({isVisible,onClose,respuestasCorrectas,expGanada,monedasGanadas}) {
const playSound = useSound();

useEffect(() => {
   if (isVisible) {
       playSound(require('../../assets/sound/goodresult.mp3')); 
   }
}, [isVisible]);


    return (
      
        <Modal isVisible={isVisible} >
          <View style={styles.Modalcontainer} >
       
       <Text >New award</Text>
       <Text className='text-3xl font-bold' >Platinium</Text>
       <Text >Sigues mateniendo tus 15 dias de racha</Text>

          <View className='w-52 h-52 flex items-center justify-center rounded-full m-5' >
           <LottieView source={require('../../assets/lottieFiles/award.json')}  autoPlay  
           style={{width: 300, height: 300}}
           />             
          </View>
       <Text className='text-3xl font-bold' >Felicidades</Text>
       <View  style={styles.monedasContainer} >
           <View  style={styles.itemsGanados}>
            <Text className='text-2xl  ' >
               +{monedasGanadas}
            <FontAwesome5 name="coins" size={24} color="black"  />
            </Text>
            <Text className='text-2xl'>Monedas</Text>
           </View>

           <View className='flex flex-col items-center justify-center ' >
            <Text className='text-2xl ' >
           +{expGanada}
           <FontAwesome6 name="award" size={24} color="black" />
            </Text>
            <Text className='text-2xl'>Exp</Text>
         </View>
            
       </View>

<View className='w-60 flex flex-col items-center justify-center'>
<Text >
   {respuestasCorrectas + ' Respuestas correctas de 10'}
</Text>

<ProgressBar progress={respuestasCorrectas/10} color='gray' /> 


<Pressable
className='w-full h-10 flex flex-rows justify-center items-center bg-cyan-400 rounded'
onPress={onClose}
>
   <Text className='text-white text-2xl font-bold'>Volver al inicio</Text>
</Pressable>
</View>

   </View>
        </Modal>
      
    );
  }




  const styles = StyleSheet.create({
    Modalcontainer: {
    display: 'flex',
    flexDirection: 'column',  
      justifyContent: 'center',
      alignItems: 'center',
      padding: 10,
    borderRadius: 10,
    backgroundColor: 'yellow',
    },
    
    monedasContainer:{
      width: '100%',
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'center',
      justifyContent: 'space-around',
      padding: 10,

    },
    itemsGanados: {
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      padding: 10,
    }
    });