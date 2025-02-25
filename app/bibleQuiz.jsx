import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ImageBackground } from 'react-native';
import { AntDesign, FontAwesome5, MaterialCommunityIcons, Octicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { doc, updateDoc, onSnapshot, getDocs, collection, limit, query, getDoc,arrayUnion, Timestamp, orderBy, startAfter, serverTimestamp, increment, setDoc } from 'firebase/firestore';
import useAuth from '../components/authContext/authContext';
import { db } from '../components/firebase/firebaseConfig';
import { ModalPuntuacion } from '@/components/Modales/modalPuntuacion';
import { ModalRacha } from '@/components/Modales/modalRacha';
import { ModalRachaPerdida } from '@/components/Modales/rachaPerdida';
import { manejarRachaDiaria } from '@/components/Racha/manejaRacha';
import { useSound } from '@/components/soundFunctions/soundFunction';
import { useBackgroundMusic } from '@/components/soundFunctions/soundFunction';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NivelModal from '@/components/Modales/modalNivel';
import { niveles } from '@/components/Niveles/niveles';


const BibleQuiz = () => {
  const navigation = useNavigation();
  const playSound = useSound();
  const { startMusic, stopMusic, isMuted, toggleMute } = useBackgroundMusic();

  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [respuestaSeleccionada, setRespuestaSeleccionada] = useState(null);
  const [userInfo, setUserInfo] = useState({});
  const [mostrarRespuestaCorrecta, setMostrarRespuestaCorrecta] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showModalRacha, setShowModalRacha] = useState(false);
  const [showModalRachaPerdida, setShowModalRachaPerdida] = useState(false);
  const [resultadoRespuestas, setResultadoRespuestas] = useState(0);
  const [monedasGanadas, setMonedasGanadas] = useState(0);
  const [expGanada, setExpGanada] = useState(0);
  const [preguntasRespondidas, setPreguntasRespondidas] = useState([]);
  const [showNivelModal, setShowNivelModal] = useState(false);
  const [lastDoc, setLastDoc] = useState([]);
  const { user } = useAuth();
  const userId = user?.uid;


  // Verifica el nivel del usuario para mostrar el modal de nivel  
 useEffect(() => {
  const checkNivel = async () => {
    const userRef = doc(db, 'users', userId);
    try {
      if (userInfo.Exp) {
        const nivelActual = niveles(userInfo.Exp).nivel;
        const nivelAnterior = userInfo.Nivel || 0;
  
        updateDoc(userRef, { Nivel: nivelActual });
  
        if (nivelAnterior !== null && nivelActual > nivelAnterior) {
          setShowNivelModal(true);
         // console.log('debio mostrar modal');
        }else{
          //console.log('noo debio mostrar modal');
        }
      }
    } catch (error) {
      console.error('Error al verificar el nivel:', error);
    }
  };
  checkNivel();
  }, [userInfo.Nivel, userInfo.Exp]);

  // Obtén las preguntas de Firestore
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const userDocRef = doc(db, 'users', user?.uid);
        
        // 1. Obtener el último índice de la subcolección de preguntas respondidas
        const answeredColRef = collection(userDocRef, 'preguntas_respondidas');
        const lastAnsweredQuery = query(
          answeredColRef,
          orderBy('index', 'desc'),
          limit(1)
        );
        
        const lastAnsweredSnapshot = await getDocs(lastAnsweredQuery);
        let lastQuestionIndex = 0;
        
        if (!lastAnsweredSnapshot.empty) {
          lastQuestionIndex = lastAnsweredSnapshot.docs[0].data().index;
        }
  
        // 2. Configurar la consulta paginada en la colección "preguntas"
        const q = query(
          collection(db, 'preguntas'),
          orderBy('index'),
          startAfter(lastQuestionIndex),
          limit(2)
        );
        
        const querySnapshot = await getDocs(q);
        
        if (querySnapshot.empty) {
          console.log('No hay más preguntas disponibles.');
          return;
        }
        
        // 3. Mapear los documentos obtenidos
        const nuevasPreguntas = querySnapshot.docs.map(doc => ({
          questionId: doc.id,
          ...doc.data(),
        }));
        
        setQuestions(nuevasPreguntas);
      } catch (error) {
        console.error('Error al obtener las preguntas:', error);
        Alert.alert('Error', 'No se pudieron obtener más preguntas.');
      }
    };
  
    fetchQuestions();
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

    return () => unsubscribe();
  }, [user?.uid]);

  const pregunta = questions[currentQuestion]?.question;
  const referencia = questions[currentQuestion]?.bibleReference;
  const textoBiblico = questions[currentQuestion]?.bibleText;
  const correcta = questions[currentQuestion]?.correctAnswer;
  const respuestas = questions[currentQuestion]?.answers || [];

// Función optimizada para marcar como respondida
const marcarPreguntaRespondida = async (questionId, questionIndex) => {
  if (!questionId || !user?.uid) return;

  const userDocRef = doc(db, 'users', user.uid);
  
  try {
    // 1. Crear documento en la subcolección de preguntas respondidas
    const answeredQuestionRef = doc(
      collection(userDocRef, 'preguntas_respondidas'),
      questionId
    );
    
    await setDoc(answeredQuestionRef, {
      questionId,
      index: questionIndex,
      timestamp: serverTimestamp()
    });
    
    // 2. Actualizar estado local
    setPreguntasRespondidas(prev => [...prev, questionId]);
  } catch (error) {
    console.error('Error al marcar la pregunta:', error);
  }
};



// Escucha cambios en el documento del usuario
useEffect(() => {
  const userDocRef = doc(db, 'users', user?.uid);
  const unsubscribe = onSnapshot(userDocRef, (doc) => {
    if (doc.exists()) {
      setPreguntasRespondidas(doc.data().answeredQuestions || []);
    }
  });

  return () => unsubscribe();
}, []);

  // Función para comprobar la respuesta seleccionada
  const comprobarRespuesta = async () => {
    if (respuestaSeleccionada === null) {
      Alert.alert('Por favor, selecciona una respuesta.');
      return;
    }

    if (respuestaSeleccionada === correcta) {
      await playSound(require('../assets/sound/correct-choice.mp3'));

      setExpGanada((prevExp) => prevExp + 15);
      setMonedasGanadas((prevMonedas) => prevMonedas + 10);
      setResultadoRespuestas(resultadoRespuestas + 1);
      await marcarPreguntaRespondida(questions[currentQuestion]?.questionId, questions[currentQuestion]?.index);

      if (currentQuestion < questions.length - 1) {
        const userDocRef = doc(db, 'users', userId);
        await updateDoc(userDocRef, {
          Exp: userInfo.Exp + 15,
          Monedas: userInfo.Monedas,
        });

        setCurrentQuestion(currentQuestion + 1);
        setRespuestaSeleccionada(null);
      } else {
        const userDocRef = doc(db, 'users', userId);
        await updateDoc(userDocRef, {
          Monedas: userInfo.Monedas + monedasGanadas + 10,
        });

        const today = new Date().toDateString();
        await AsyncStorage.setItem("lastQuizDate", today);
        console.log('Fecha del último quiz guardada:', today);

        setShowModal(true);
      }
    } else {
      setMostrarRespuestaCorrecta(true);
      await playSound(require('../assets/sound/incorrect-choice.mp3'));

      setTimeout(async () => {
        const userDocRef = doc(db, 'users', userId);

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
              setMostrarRespuestaCorrecta(false);
              setCurrentQuestion(currentQuestion + 1);
              setRespuestaSeleccionada(null);
            } else {
              const today = new Date().toDateString();
              await AsyncStorage.setItem("lastQuizDate", today);
              console.log('Fecha del último quiz guardada:', today);
              setShowModal(true);
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
          });

          const today = new Date().toDateString();
          await AsyncStorage.setItem("lastQuizDate", today);
          console.log('Fecha del último quiz guardada:', today);
          setShowModal(true);
          stopMusic();
        }
      }, 2000);
    }
  };

  // Función para saltar una pregunta
  const skip = async () => {
    if (userInfo.Monedas < 50) {
      Alert.alert('No tienes suficientes monedas para saltar la pregunta.');
      return;
    }

    if (currentQuestion < questions.length - 1) {
      const userDocRef = doc(db, 'users', userId);
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
      const today = new Date().toDateString();
      await AsyncStorage.setItem("lastQuizDate", today);
      console.log('Fecha del último quiz guardada:', today);
      setShowModal(true);
    }
  };

  // Función para "remover dos respuestas incorrectas"
  const removeTwo = async () => {
    if (userInfo.Monedas < 50) {
      Alert.alert('No tienes suficientes monedas para remover respuestas.');
      return;
    }

    const respuestasIncorrectas = respuestas.filter(respuesta => respuesta !== correcta);
    const respuestasRestantes = respuestasIncorrectas.slice(0, 1);
    const nuevasRespuestas = [correcta, ...respuestasIncorrectas.slice(0, 1)];

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

    const userDocRef = doc(db, 'users', userId);
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

  const mostrarModalRacha = () => {
    setShowModal(false);
    stopMusic();
    setTimeout(() => {
      manejarRachaDiaria(userId, setShowModalRacha, setShowModalRachaPerdida);
      navigation.navigate('(tabs)');
    }, 1000);
  };

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
    ]);
  };

  useEffect(() => {
    const backgroundMusic = require('../assets/sound/quiz-music1.mp3');

    if (navigation.addListener('focus', () => startMusic(backgroundMusic)));

    return () => {
      stopMusic();
    };
  }, []);

  if (!userId) {
    return;
  }

  return (
    <SafeAreaView>
      <ModalPuntuacion userInfo={userInfo} expGanada={expGanada} monedasGanadas={monedasGanadas} respuestasCorrectas={resultadoRespuestas} isVisible={showModal} onClose={mostrarModalRacha} />
      <ModalRacha userInfo={userInfo} isVisible={showModalRacha} setShowModalRacha={setShowModalRacha} />
      <ModalRachaPerdida userInfo={userInfo} isVisible={showModalRachaPerdida} setShowModalRachaPerdida={setShowModalRachaPerdida} />
      <NivelModal Exp={userInfo.Exp} nivel={userInfo?.Nivel} isVisible={showNivelModal} onClose={() => setShowNivelModal(false)}/>

        
      <ImageBackground source={require('../assets/images/bg-quiz.png')} resizeMode="cover" style={styles.backgroundImage}>
        <View className='w-full h-full flex items-center '>
          <View className='w-full flex flex-row justify-between items-center '>
            <TouchableOpacity onPress={salir}>
              <MaterialCommunityIcons name="home" color="blue" size={40} className=' w-10 h-10 ml-5' />
            </TouchableOpacity>

            <View style={styles.statusBar}>
              <AntDesign name="heart" size={24} color="red" />
              <Text style={styles.status}>{userInfo.Vidas}</Text>
              <FontAwesome5 name="coins" size={24} color="yellow" />
              <Text style={styles.status}>{userInfo.Monedas}</Text>
            </View>
          </View>

          <View className='w-full h-[90%] rounded-md flex items-center p-5 '>
            <View className='w-full flex flex-row justify-end '>
              <TouchableOpacity onPress={toggleMute} style={styles.iconButton}>
                <Octicons
                  name={isMuted ? 'mute' : 'unmute'}
                  size={24}
                  color={isMuted ? 'blue' : 'blue'}
                />
              </TouchableOpacity>
            </View>

            <View style={styles.questionContainer} className="w-full h-52 rounded-md mb-5 mt-5 flex items-center justify-center p-2">
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
                  className={`w-full h-16 rounded-md flex items-center justify-center m-1 ${
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
                  disabled={mostrarRespuestaCorrecta}
                >
                  <Text className='text-2xl text-white font-bold'>{respuesta}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              style={styles.comprobar}
              className='w-52 h-16 rounded-md flex items-center justify-center flex-row gap-2 m-5'
              onPress={comprobarRespuesta}
            >
              <Text className='text-2xl font-bold text-white'>Comprobar</Text>
              <AntDesign name="rightcircleo" size={24} color="white" />
            </TouchableOpacity>

            <View className='w-full flex flex-row items-center justify-center gap-2'>
              <TouchableOpacity
                onPress={skip}
                className='w-56 h-20 bg-red-500 rounded-md flex items-center justify-center '
              >
                <Text className='color-white'>💰{'50'}</Text>
                <Text className='color-white font-bold'>Saltar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className='w-56 h-20 bg-red-500 rounded-md flex items-center justify-center'
                onPress={removeTwo}
                disabled={respuestas.length <= 2}
              >
                <Text className='color-white'>💰{'50'}</Text>
                <Text className='color-white font-bold'>{respuestas.length > 2 ? 'Remover 2 incorrectas' : 'No disponible'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ImageBackground>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  questionContainer: {
    height: 250,
    borderRadius: 20,
    padding: 5,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  respuestas: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 50,
  },
  comprobar: {
    backgroundColor: 'rgba(0, 0,255, 0.8)',
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
  },
});

export default BibleQuiz;