import React, { useState, useRef, useEffect } from 'react';
import { ScrollView, TouchableOpacity, View, Text, StyleSheet, Modal,Pressable, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { MaterialIcons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import LottieView from 'lottie-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import  useAuth  from '../authContext/authContext';
import { db } from '../../components/firebase/firebaseConfig';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import {NoCoinsModal} from '../Modales/notCoints';



const ExploraComponent = () => {
  const { user } = useAuth();
  const userId = user?.uid;

  const navigation = useNavigation();
  const [hasDoneQuizToday, setHasDoneQuizToday] = useState(false);
  const [hasReadTheDailyVerse, setHasReadTheDailyVerse] = useState(false);
  const [showFullScreen, setShowFullScreen] = useState(false);
  const [showNoCoinsModal, setShowNoCoinsModal] = useState(false);
  const animationRef = useRef(null);

 

 // Verificar si el usuario ha hecho el quiz hoy
 useEffect(() => {
  const checkQuizStatus = async () => {
  try {
    const lastQuizDate = await AsyncStorage.getItem("lastQuizDate");
    const today = new Date().toDateString(); // Obtener la fecha actual en formato legible
       //console.log('la ultima vez que el usuario hizo el quiz',lastQuizDate);
      // console.log('hoy es',today);
       
    if (lastQuizDate === today) {
      setHasDoneQuizToday(true); // El usuario ya hizo el quiz hoy
      //console.log("El usuario ya hizo el quiz hoy");
    } else {
      setHasDoneQuizToday(false); // El usuario no ha hecho el quiz hoy
     // console.log("El usuario no ha hecho el quiz hoy");
    }
  } catch (error) {
    console.log("Error al obtener el estado del quiz:", error);
  }
  };

  checkQuizStatus();
}, []);

 // verificar el estado de la lectura diaria
 useEffect(() => {
  const checkReadingStatus = async () => {
    const lastReadingDate = await AsyncStorage.getItem("lastReadingDate");
    const today = new Date().toDateString();
    //console.log('ha leido la ultima vez',lastReadingDate);
 

 if (lastReadingDate === null) {
  await AsyncStorage.setItem("lastReadingDate", today);
  //console.log('se ha seteado la ultima lectura');
  return;
 }
   
    if (lastReadingDate !== today) {
      setHasReadTheDailyVerse(false);
    } else {
      setHasReadTheDailyVerse(true);
      
    }
    
  };

  checkReadingStatus();
}, []);


  const menuItems = [
      { 
        name: 'Quiz',
        icon: 'quiz',
        family: MaterialIcons,
        screen: 'bibleQuiz'
      },
    { 
      name: 'Lectura',
      icon: 'book-open-variant',
      family: MaterialCommunityIcons,
      screen: 'dailyReading'
    },
    /*{ 
      name: 'Oracion',
      icon: 'hands-pray',
      family: MaterialCommunityIcons,
      screen: 'PrayersScreen'
    },
    { 
      name: 'Comunidad',
      icon: 'account-group',
      family: MaterialCommunityIcons,
      screen: 'CommunityScreen'
    },*/
  ];

  const handlePress = (screenName) => {
    navigation.navigate(screenName);
  };
const handleAnimationPress = async () => {

 const userRef = doc(db, 'users', userId);
 const userDoc = await getDoc(userRef);
  const monedas = userDoc.data()?.Monedas || 0;

  if (monedas < 100) {
     // si el usuario no tiene suficientes monedas
    setShowNoCoinsModal(true);
    return; 
  }
    
  await updateDoc(userRef, { Monedas: monedas - 100 });
      
      setShowFullScreen(true);
    };
  
    const handleAnimationFinish = async () => {
      animationRef.current?.play(0, 300);
      setShowFullScreen(false);
 
      navigation.navigate("bibleQuiz");
    };

  return (
    <View >
      <NoCoinsModal visible={showNoCoinsModal} onClose={() => setShowNoCoinsModal(false)} />
    <View>
              <Text style={styles.title}>Explora</Text>
            </View>
    <ScrollView 
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.scrollContainer}
    >
      {menuItems.map((item, index) => {
        const IconComponent = item.family;
        return (
          <TouchableOpacity
            key={index}
            style={styles.menuItem}
              onPress={() => {
                if (item.name === 'Quiz') {
                  handleAnimationPress();
                } else {
                  handlePress(item.screen);
                }
                }}
            activeOpacity={0.7}
          >
            <View style={styles.iconContainer}>
              <IconComponent
                name={item.icon}
                size={32}
                color="skyblue"
              />
            </View>
            <Text style={styles.text}>{item.name}</Text>
 {item.name === 'Quiz' && !hasDoneQuizToday && ( // Solo se mostrará en el Quiz
    <View style={styles.notificationIcon}>
      <LottieView 
        source={require("../../assets/lottieFiles/notification-quiz.json")}
        renderMode="cover" 
        autoPlay 
        loop
        style={styles.notificationLottie}
      />
    </View>
  )}

 {item.name === 'Lectura' && !hasReadTheDailyVerse && ( // Solo se mostrará en la Lectura
    <View style={styles.notificationIcon}>
      <LottieView 
        source={require("../../assets/lottieFiles/notification-quiz.json")}
        renderMode="cover" 
        autoPlay 
        loop
        style={styles.notificationLottie}
      />
    </View>
  )}
          </TouchableOpacity>
        );
      })}
    </ScrollView>
    <Modal visible={showFullScreen} transparent={true}>
              <View style={styles.modalContainer}>
                <LottieView
                  ref={animationRef}
                  source={require("../../assets/lottieFiles/cerebro.json")}
                  autoPlay
                  loop={false}
                  style={styles.modalLottie}
                  resizeMode="contain"
                  onAnimationFinish={handleAnimationFinish}
                />
    
               <View style={{flexDirection: 'row', alignItems: 'center'}}>
               <Text style={styles.modalText}>-100</Text>
               <FontAwesome5 name="coins" size={24} color="yellow" />
               </View>
              </View>
            </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    paddingVertical: 15,
    paddingHorizontal: 5,
  },
  title: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
   
    
  },
  menuItem: {
    alignItems: 'center',
    
    marginRight: 30,
    
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 20,
   
   //backgroundColor: '#E8EDF4',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'skyblue',
   // shadowColor: '#000',
   // shadowOffset: { width: 0, height: 0 },
   // shadowOpacity: 0.2,
   // shadowRadius: 10,
   // elevation: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    
  },
  text: {
    fontSize: 14,
    color: 'white',
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: 18,
  },
  notificationIcon: {
    width: 30,
    height: 30,
    borderRadius: 15, // 👈 Usa la mitad del tamaño (30/2)
    overflow: 'hidden',
    position: 'absolute',
    top: -12,
    right: -15,
  },
  notificationLottie: {
    width: '100%',   // 👈 Ocupa todo el espacio del contenedor
    height: '100%',
  },
      modalContainer: {
        position: "absolute",
         top: 0,
         left: 0,
         width: "100%",
         height: "100%",
         justifyContent: "center",
         alignItems: "center",
         backgroundColor: "skyblue",
       },
       modalText: {
         fontSize: 26,
         fontWeight: "bold",
         color: "orange",
       },
       modalLottie: {
         width: 400,
         height: 400,
       },
});

export default ExploraComponent;