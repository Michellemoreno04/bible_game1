import React, { useEffect, useState, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ImageBackground, Animated,Platform } from 'react-native';
import { AntDesign, FontAwesome5, MaterialCommunityIcons, Octicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { doc, updateDoc, onSnapshot, getDocs, collection, limit, query, orderBy, startAfter, serverTimestamp, increment, setDoc } from 'firebase/firestore';
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
import { InterstitialAd, AdEventType, TestIds } from 'react-native-google-mobile-ads';


const adUnitId = __DEV__ ? TestIds.INTERSTITIAL: process.env.EXPO_PUBLIC_INTERSTITIAL_ID; 

// Crea la instancia del anuncio
const interstitial = InterstitialAd.createForAdRequest(adUnitId, {
  keywords: ['religion', 'bible']// esto es para anuncios personalizados
});


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
  const [interstitialLoaded, setInternitialLoaded] = useState(false);
  const { user } = useAuth();
  const userId = user?.uid;



// Cargar el anuncio
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
  }, []);

  // mostrar los anuncios
  const showAds = () => {
    if(interstitialLoaded){
      interstitial.show();

      interstitial.addAdEventListener(AdEventType.CLOSED, () => {
        
        navigation.navigate('(tabs)'); // Redirigir a Home después de cerrar el anuncio
        // showModal(false);
      });

    } else {
      navigation.navigate('(tabs)'); // Si no hay anuncio, ir a Home directamente
    }

    
  }

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
 // Animaciones
 const questionOpacity = useRef(new Animated.Value(0)).current;
 const [answerAnimations, setAnswerAnimations] = useState(
   respuestas.map(() => new Animated.Value(0))
 );
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

        if (userInfo.Vidas >= 1) { 
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


// Animaciones
  useEffect(() => {
    // Reiniciar animaciones cuando cambia la pregunta
    questionOpacity.setValue(0);
    const newAnimations = respuestas.map(() => new Animated.Value(0));
    setAnswerAnimations(newAnimations);

    // Animación para la pregunta
    Animated.timing(questionOpacity, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start(() => {
      // Animación para respuestas después de 2 segundos
      setTimeout(() => {
        newAnimations.forEach((anim, index) => {
          Animated.timing(anim, {
            toValue: 1,
            duration: 500,
            delay: index * 200,
            useNativeDriver: true,
          }).start();
        });
      }, 2000);
    });
  }, [pregunta]);

  if (!interstitial) {
    return null;
  } 

  return (
    <SafeAreaView style={styles.safeArea}>
      <ModalPuntuacion userInfo={userInfo} expGanada={expGanada} monedasGanadas={monedasGanadas} respuestasCorrectas={resultadoRespuestas} isVisible={showModal} onClose={mostrarModalRacha} showAds={showAds} />
      <ModalRacha userInfo={userInfo} isVisible={showModalRacha} setShowModalRacha={setShowModalRacha} />
      <ModalRachaPerdida userInfo={userInfo} isVisible={showModalRachaPerdida} setShowModalRachaPerdida={setShowModalRachaPerdida} />
      <NivelModal Exp={userInfo.Exp} nivel={userInfo?.Nivel} isVisible={showNivelModal} onClose={() => setShowNivelModal(false)}/>

        
<ImageBackground 
        source={require('../assets/images/bg-quiz.png')} 
         resizeMode="cover" 
        style={styles.backgroundImage}
      >
        <View style={styles.mainContainer}>
          <View style={styles.header}>
            <TouchableOpacity onPress={salir} style={styles.homeButton}>
              <MaterialCommunityIcons 
                name="home" 
                color="blue" 
                size={40} 
                style={styles.homeIcon} 
              />
            </TouchableOpacity>

            <View style={styles.statusBar}>
              <AntDesign name="heart" size={24} color="red" />
              <Text style={styles.statusText}>{userInfo.Vidas}</Text>
              <FontAwesome5 name="coins" size={24} color="yellow" />
              <Text style={styles.statusText}>{userInfo.Monedas}</Text>
            </View>

          </View>

          <View style={styles.contentContainer}>
            <View style={styles.muteButtonContainer}>
              <TouchableOpacity onPress={toggleMute}>
                <Octicons
                  name={isMuted ? 'mute' : 'unmute'}
                  size={24}
                  color={isMuted ? 'blue' : 'blue'}
                />
              </TouchableOpacity>
            </View>

            <Animated.View style={[styles.questionContainer, { opacity: questionOpacity }]}>
            <Text
              style={styles.referenceText}
              onPress={showTextoBiblico}
            >
              {referencia}
            </Text>
            <Text style={styles.questionText}>{pregunta}</Text>
          </Animated.View>


            <View style={styles.answersContainer}>
              {respuestas.map((respuesta, index) => {
                const isSelected = respuestaSeleccionada === respuesta;
                const isCorrect = mostrarRespuestaCorrecta && respuesta === correcta;
                const isIncorrect = mostrarRespuestaCorrecta && respuesta !== correcta;
                
                return (
                  <Animated.View
                  key={index}
                  style={{ opacity: answerAnimations[index] || 0 }}
                >
                  <TouchableOpacity
                    style={[
                      styles.answerButton,
                      isSelected && styles.selectedAnswer,
                      isCorrect && styles.correctAnswer,
                      isIncorrect && styles.incorrectAnswer
                    ]}
                    onPress={() => setRespuestaSeleccionada(respuesta)}
                    disabled={mostrarRespuestaCorrecta}
                  >
                    <Text style={styles.answerText}>{respuesta}</Text>
                  </TouchableOpacity>
                </Animated.View>
                )
              })}
            </View>

            <TouchableOpacity
              style={styles.checkButton}
              onPress={comprobarRespuesta}
            >
              <Text style={styles.checkButtonText}>Comprobar</Text>
              <AntDesign name="rightcircleo" size={24} color="white" />
            </TouchableOpacity>

            <View style={styles.actionsContainer}>
              <TouchableOpacity
                onPress={skip}
                style={styles.actionButton}
              >
                <Text style={styles.actionText}>💰50</Text>
                <Text style={styles.actionText}>Saltar</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.actionButton, respuestas.length <= 2 && styles.disabledButton]}
                onPress={removeTwo}
                disabled={respuestas.length <= 2}
              >
                <Text style={styles.actionText}>💰50</Text>
                <Text style={styles.actionText}>
                  {respuestas.length > 2 ? 'Remover 2 incorrectas' : 'No disponible'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ImageBackground>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1
  },
  backgroundImage: {
    flex: 1,
    width: '100%'
  },
  mainContainer: {
   
    width: '100%',
    alignItems: 'center'
  },
  header: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 10,
    
  },
  homeButton: {
    
    padding: 10,
  },
  homeIcon: {
    width: 40,
    height: 40,
    
  },
  statusBar: {
    flexDirection: 'row',
    alignItems: 'center',
    
  },
  statusText: {
    marginHorizontal: 10,
    fontSize: 18,
    color: 'white'
  },
  contentContainer: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    padding: 20,
    
  },
  muteButtonContainer: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'flex-end',
  position: 'relative',
  bottom: 20,
  },
 
  questionContainer: {
    width: '100%',
    height: 200,
    borderRadius: 20,
    padding: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    marginBottom: 20,
    justifyContent: 'center',
    alignItems: 'center'
  },
  referenceText: {
    color: 'white',
    position: 'absolute',
    top: 8,
    left: 8,
    padding: 8
  },
  questionText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center'
  },
  answersContainer: {
    width: '100%',
    alignItems: 'center'
  },
  answerButton: {
    width: 370,
    height: 64,
    borderRadius: 50,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 4,
    borderWidth: 2,
    borderColor: '#gray',
    padding: 20,
  },
  selectedAnswer: {
    borderWidth: 4,
    borderColor: '#00FF00',
    
  },
  correctAnswer: {
    borderWidth: 2,
    borderColor: '#00FF00'
  },
  incorrectAnswer: {
    borderWidth: 2,
    borderColor: '#FF0000'
  },
  answerText: {
    
    fontSize: 18,
    color: 'white',
    fontWeight: 'bold'
  },
  checkButton: {
    width: 208,
    height: 64,
    borderRadius: 50,
    backgroundColor: 'rgba(0, 0, 255, 0.8)',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginVertical: 20
  },
  checkButtonText: {
    fontSize: 18,
    color: 'white',
    fontWeight: 'bold'
  },
  actionsContainer: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  actionButton: {
    width: 200,
    height: 80,
    borderRadius: 15,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  disabledButton: {
    opacity: 0.5
  },
  actionText: {
    color: 'white',
    fontWeight: 'bold'
  }
});

export default BibleQuiz;