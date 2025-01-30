import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert,ImageBackground, ActivityIndicator} from 'react-native';
import { AntDesign,FontAwesome5, MaterialCommunityIcons, Octicons} from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { doc, updateDoc, onSnapshot, getDocs, collection,limit, query, where,addDoc, documentId } from 'firebase/firestore';
import useAuth from './authContext';
import { db } from '../components/firebase/firebaseConfig';
import { ModalPuntuacion } from '@/components/Modales/modalPuntuacion';
import { ModalRacha } from '@/components/Modales/modalRacha';
import {manejarRachaDiaria} from '@/components/Racha/manejaRacha';
import { useSound } from '@/components/soundFunctions/soundFunction';
import { useBackgroundMusic } from '@/components/soundFunctions/soundFunction';
import { LinearGradient } from 'expo-linear-gradient';


const BibleQuiz = () => {
const navigation = useNavigation();
const playSound = useSound();
const {startMusic,stopMusic,isMuted,toggleMute} = useBackgroundMusic()

  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [respuestaSeleccionada, setRespuestaSeleccionada] = useState(null);
  const [userInfo, setUserInfo] = useState({});
  const [mostrarRespuestaCorrecta, setMostrarRespuestaCorrecta] = useState(false);
  const [showModal, setShowModal] = useState(false);// Estado para mostrar el modal de puntuacion
  const [showModalRacha, setShowModalRacha] = useState(false);// Estado para mostrar el modal de racha
  const [resultadoRespuestas, setResultadoRespuestas] = useState(0);
  const [monedasGanadas, setMonedasGanadas] = useState(0);
  const [expGanada, setExpGanada] = useState(0);
  

  const { user } = useAuth();


       // Obtén las preguntas de Firestore
  const fetchQuestions = async () => {
    try {
      const userDocRef = doc(db, 'users', user?.uid);
      const preguntasRespondidasSnapshot = await getDocs(collection(userDocRef, 'Preguntas Respondidas'));
      const respuestasRespondidas = preguntasRespondidasSnapshot.docs.map(doc => doc.data().questionId); // Obtén los IDs de las preguntas respondidas
  
      // Filtra las preguntas no respondidas
      let q;
      if (respuestasRespondidas.length > 0) {
        q = query(
          collection(db, 'preguntas'),
          where(documentId(), 'not-in', respuestasRespondidas), // Filtrar por IDs de documento
          limit(2) // Limitar a 3 preguntas
        );
      } else {
        q = query(collection(db, 'preguntas'), limit(2));
      }
  
      const querySnapshot = await getDocs(q);
      const preguntas = querySnapshot.docs.map(doc => ({
        questionId: doc.id, // Agrega el ID del documento como questionId
        ...doc.data(),      // Incluye los datos del documento
      }));
  
      console.log('se obtuvieron las preguntas');
if (preguntas.length === 0) {
  
  Alert.alert('No hay preguntas disponibles.');
  return;
}

      setQuestions(preguntas);
    } catch (error) {
      console.error('Error al obtener las preguntas:', error);
      Alert.alert('Error', 'No se pudieron obtener mas preguntas.');
    }
  };

  useEffect(() => {
    if(navigation.addListener('focus', () => {
      fetchQuestions()
    }))
    return () => {
      navigation.removeListener('focus', () => {
        fetchQuestions()
      })
    }
  }, []);

  // Escucha en tiempo real para obtener los datos del usuario
  useEffect(() => {
    const userDocRef = doc(db, 'users', user?.uid);

    const unsubscribe = onSnapshot(userDocRef, (doc) => {
      if (doc.exists()) {
        setUserInfo(doc.data());
      } else {
        console.error('El documento del usuario no existe');
      }
    });

    // Cleanup listener al desmontar el componente
    return () => unsubscribe();
  }, [user?.uid]);

  const pregunta = questions[currentQuestion]?.question;
  const referencia = questions[currentQuestion]?.bibleReference;
  const textoBiblico = questions[currentQuestion]?.bibleText;
  const correcta = questions[currentQuestion]?.correctAnswer;
  const respuestas = questions[currentQuestion]?.answers || [];
  
  

// Función para marcar una pregunta como respondida en Firestore
  const marcarPreguntaRespondida = async (questionId) => {
    if (!questionId) {
      console.error('No se ha encontrado un ID de pregunta válido.');
      return;
    }
  
    const userDocRef = doc(db, 'users', user?.uid);
    const preguntasRespondidasRef = collection(userDocRef, 'Preguntas Respondidas');
  
    try {
      const docRef = await addDoc(preguntasRespondidasRef, {
        questionId: questionId,
        answeredAt: new Date(),
      });
      console.log('Pregunta respondida registrada en Firestore', docRef.id);
    } catch (error) {
      console.error('Error al agregar la pregunta respondida:', error);
    }
  };
  
 
// Función para comprobar la respuesta seleccionada
  const comprobarRespuesta = async () => {
    if (respuestaSeleccionada === null) {
      Alert.alert('Por favor, selecciona una respuesta.');
      return;
    }
  
    if (respuestaSeleccionada === correcta) {
      
        await playSound(require('../assets/sound/correct-choice.mp3')); // sonido de respuesta correcta
 
      setExpGanada((prevExp) => prevExp + 15);
      setMonedasGanadas((prevMonedas) => prevMonedas + 10);

      setResultadoRespuestas(resultadoRespuestas + 1); // Incrementar el contador de respuestas correctas
      await marcarPreguntaRespondida(questions[currentQuestion]?.questionId);
      if (currentQuestion < questions.length - 1) {
        const userDocRef = doc(db, 'users', user?.uid);
        await updateDoc(userDocRef, {
          Exp: userInfo.Exp + 15,
          Monedas: userInfo.Monedas 
        });
     
        setCurrentQuestion(currentQuestion + 1);
        setRespuestaSeleccionada(null);

      } else {
        
          const userDocRef = doc(db, 'users', user?.uid);
          await updateDoc(userDocRef, {
            Monedas: userInfo.Monedas + monedasGanadas + 10
          });
        setShowModal(true); // Muestra el modal de puntuación
        
      }
    } else {
     // Alert.alert('¡Respuesta incorrecta!');

      setMostrarRespuestaCorrecta(true);
      await playSound(require('../assets/sound/incorrect-choice.mp3')); // sonido de respuesta incorrecta

      setTimeout(async () => {
        const userDocRef = doc(db, 'users', user?.uid);
  
        if (userInfo.Vidas > 0) {
          try {
            await updateDoc(userDocRef, {
              Vidas: userInfo.Vidas - 1,
            });
            setUserInfo((prevUserInfo) => ({
              ...prevUserInfo,
              Vidas: prevUserInfo.Vidas,
            }));
  
            if (currentQuestion < questions.length - 1) {
              setMostrarRespuestaCorrecta(false); // Ocultar el borde al cambiar de pregunta
              setCurrentQuestion(currentQuestion + 1);
              setRespuestaSeleccionada(null);
            } else {
              
              setShowModal(true); // Muestra el modal de puntuación
              stopMusic();
                
             } 
          } catch (error) {
            console.error('Error al actualizar las vidas:', error);
            Alert.alert('Error', 'No se pudieron actualizar las vidas.');
          }
        } else {
          Alert.alert('No tienes más vidas. El juego ha terminado.');
          
          await updateDoc(userDocRef, {
            Monedas: userInfo.Monedas + monedasGanadas,
          })
          setShowModal(true); // Muestra el modal
          stopMusic();
        }
      }, 2000); // Esperar 2 segundos antes de avanzar
    }
  };
  
  // Función para saltar una pregunta
  const skip = async () => {

    if (userInfo.Monedas < 50) {
      Alert.alert('No tienes suficientes monedas para saltar la pregunta.');
      return;
    }

    if (currentQuestion < questions.length - 1) {
      const userDocRef = doc(db, 'users', user?.uid);
      try {
        await updateDoc(userDocRef, {
          Monedas: userInfo.Monedas - 50,
        });
        setCurrentQuestion(currentQuestion + 1);
        setRespuestaSeleccionada(null);
      } catch (error) {
        console.error('Error al actualizar las monedas:', error);
        Alert.alert('Error', 'No se pudieron actualizar las monedas.');
      }
    } else {
      Alert.alert('Has completado el quiz.');
      //manejarRachaDiaria(user.uid);
      setShowModal(true); // Muestra el modal
    }
  };

  // Función para "remover dos respuestas incorrectas"
  const removeTwo = async () => {
    if (userInfo.Monedas < 50) {
      Alert.alert('No tienes suficientes monedas para remover respuestas.');
      return;
    }


    // Filtrar las respuestas incorrectas
    const respuestasIncorrectas = respuestas.filter(respuesta => respuesta !== correcta);
    // Mantener una respuesta incorrecta y eliminar las demás
    const respuestasRestantes = respuestasIncorrectas.slice(0, 1);

    // Actualizar el estado con las respuestas restantes (correcta + una incorrecta)
    const nuevasRespuestas = [correcta, ...respuestasIncorrectas.slice(0, 1)];


    

    // Actualizar el estado de las preguntas con las nuevas respuestas
    setQuestions((prevQuestions) => {
      return prevQuestions.map((pregunta) => {
        if (pregunta.questionId === questions[currentQuestion].questionId) {
          return {
            ...pregunta,
            answers: nuevasRespuestas,
          };
        }
        return pregunta;
      });
    });

   

    // Descontar las monedas
    const userDocRef = doc(db, 'users', user?.uid);
    try {
      await updateDoc(userDocRef, {
        Monedas: userInfo.Monedas - 50,
      });
    } catch (error) {
      console.error('Error al actualizar las monedas:', error);
      Alert.alert('Error', 'No se pudieron actualizar las monedas.');
    }
  };

  const showTextoBiblico = () => {
    Alert.alert(referencia, textoBiblico, [{ text: 'Cerrar' }]);
  };

  // Función para mostrar el modal de racha diaria 
 const mostrarModalRacha = () => { 
  
    setShowModal(false);
   stopMusic();
    setTimeout(() => { // Esperar 1 segundo antes de mostrar el otro modal de racha
      manejarRachaDiaria(user?.uid,setShowModalRacha);
      navigation.navigate('(tabs)')

    }, 1000)
    
}


const salir = () => {
  Alert.alert('Salir', '¿Seguro que deseas salir?', [
    {
      text: 'Cancelar',
      style: 'cancel',
    },
    {
      text: 'Terminar',
       onPress: () => {
        navigation.replace('(tabs)');
      },  
    },
  ]
  );
}

// Inicia la música de fondo
useEffect(() => {
  const backgroundMusic = require('../assets/sound/quiz-music1.mp3');

  // Inicia la música de fondo
  if(navigation.addListener('focus', () => startMusic(backgroundMusic))); // Inicia la musica de fondo al entrar en el componente solamente

  // Detiene la música al salir del component
  return () => {
    stopMusic();
  };
}, [])


  return (
    
    <SafeAreaView>
 <ModalPuntuacion expGanada={expGanada} monedasGanadas={monedasGanadas} respuestasCorrectas={resultadoRespuestas} isVisible={showModal} onClose={mostrarModalRacha}/>  
<ModalRacha userInfo={userInfo} isVisible={showModalRacha} setShowModalRacha={setShowModalRacha}  />
     
    <View  className='w-full h-full  flex items-center bg-slate-400 '>
   
      <View className='w-full flex flex-row justify-between items-center '>
      
        <TouchableOpacity onPress={salir} >
        <MaterialCommunityIcons name="home" color="blue" size={40} className=' w-10 h-10 ml-5'/>
        </TouchableOpacity>
        
        <View style={styles.statusBar}>
        <AntDesign name="heart" size={24} color="red" />
        <Text style={styles.status}>{userInfo.Vidas}</Text>
        <FontAwesome5 name="coins" size={24} color="yellow" />
        <Text style={styles.status}>{userInfo.Monedas}</Text>
        </View>
      </View>
    
     <View className='w-full h-[90%] rounded-md  flex items-center p-5 '>
     
       <View className='w-full flex flex-row justify-end '>
       <TouchableOpacity onPress={toggleMute} style={styles.iconButton}>
        <Octicons
          name={isMuted ? 'mute' : 'unmute'} // Ícono cambia según el estado
          size={24}
          color={isMuted ? 'blue' : 'blue'} // Cambia color si está muteado
        />
      </TouchableOpacity>
       </View>

  
    <View style={styles.questionContainer} className="w-full h-52  rounded-md mb-5 mt-5 flex items-center justify-center p-2">
      <Text 
        className="text-white rounded-md p-3 absolute top-0 left-0 "
        onPress={showTextoBiblico}
      >
        {referencia}
      </Text>
      <Text className="text-3xl font-bold text-white">{pregunta}</Text>
    </View>
  


      <View className='w-full flex flex-col items-center'>
      {respuestas.map((respuesta, index) => (
  <TouchableOpacity
    key={index}
    style={styles.respuestas}
    className={`w-full h-16 rounded-md flex items-center  justify-center m-1  ${
      respuestaSeleccionada === respuesta
        ? 'border-4 border-green-500'
        : mostrarRespuestaCorrecta && respuesta === correcta
        ? 'border-2 border-green-500'
        : 'border-2 border-gray-400'
    } ${
      mostrarRespuestaCorrecta && respuesta !== correcta
        ? 'border-2 border-red-500'
        : ''
    

    }`}
    onPress={() => setRespuestaSeleccionada(respuesta)}
    disabled={mostrarRespuestaCorrecta} // Evitar que el usuario cambie la respuesta mientras se muestra la correcta
  >
    <Text className='text-2xl text-white font-bold'>{respuesta}</Text>
  </TouchableOpacity>
))}
      </View>

      <TouchableOpacity
      style={styles.comprobar}
       className='w-full h-16  bg-blue-500 rounded-md flex items-center justify-center flex-row gap-2 m-5'
       onPress={comprobarRespuesta}
       >
        
        <Text className='text-2xl font-bold text-white'>Comprobar</Text>
        <AntDesign name="rightcircleo" size={24} color="white" />
      </TouchableOpacity>

      <View className='w-full flex flex-row items-center justify-center gap-2'>
        <TouchableOpacity
        onPress={skip}
        className='w-56 h-20  bg-red-500 rounded-md flex items-center justify-center ' >
          <Text className='color-white'>💰{'50'}</Text>
          <Text className='color-white font-bold'>Saltar</Text>
        </TouchableOpacity>
        <TouchableOpacity
          className='w-56 h-20  bg-red-500 rounded-md flex items-center justify-center'
         onPress={removeTwo}
         disabled={respuestas.length <= 2} // Deshabilita el botón si hay 2 o menos respuestas
        >
          <Text className='color-white'>💰{'50'}</Text>
          <Text className='color-white font-bold'>{respuestas.length > 2 ? 'Remover 2 incorrectas' : 'No disponible'}</Text>
        </TouchableOpacity>
      </View>
      
      </View>
    </View>
  
    </SafeAreaView>
    
  );
};

const styles = StyleSheet.create({

 questionContainer: {
  height: 250,
    borderRadius: 20,
    padding: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    
  },
  respuestas: {
   // boxShadow: '0px 0px 10px rgba(0, 0, 0, 0.7)',
   backgroundColor: 'rgba(0, 0, 0, 0.7)',
  borderRadius: 50,
  },
  comprobar: {
 
  borderRadius: 50,
  },
 
  
  statusBar: {
    
    flexDirection: 'row',
    alignItems: 'center',
    
  },
  status: {
    marginHorizontal: 10,
    fontSize: 18,
  },
  backgroundImage: {
    width: '100%',
    resizeMode: 'cover',
    borderRadius: 20,
    overflow: 'hidden',
  },
  

 
});

export default BibleQuiz;
