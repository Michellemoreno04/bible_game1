import {
    Text,
    View,
    StyleSheet,
    Modal,
    TouchableOpacity,
    ScrollView,
  } from "react-native";
  import "../../global.css";
  import { Link } from "expo-router";
  import {
    AntDesign,
    FontAwesome5,
    Ionicons,
  } from "@expo/vector-icons";
  import React, {useEffect, useState, useRef } from "react";
  import { useNavigation } from "expo-router";
  import LottieView from "lottie-react-native";
  import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";



  
  export default function ExploraComponents() {
    const navigation = useNavigation();
    const [showFullScreen, setShowFullScreen] = useState(false);
    const animationRef = useRef(null);
    const [selectedTab, setSelectedTab] = useState("inicio");
    const [hasDoneQuizToday, setHasDoneQuizToday] = useState(false);

    const tabs = [
        { key: "inicio", label: "Inicio" },
        { key: "Lectura Diaria", label: "Lectura Diaria" },
        
      ]


  // Verificar si el usuario ha hecho el quiz hoy
  useEffect(() => {
    const checkQuizStatus = async () => {
      const lastQuizDate = await AsyncStorage.getItem("lastQuizDate");
      const today = new Date().toDateString(); // Obtener la fecha actual en formato legible

      if (lastQuizDate === today) {
        setHasDoneQuizToday(true); // El usuario ya hizo el quiz hoy
      } else {
        setHasDoneQuizToday(false); // El usuario no ha hecho el quiz hoy
      }
    };

    checkQuizStatus();
  }, []);

    const handleAnimationPress = () => {
      setShowFullScreen(true);
    };
  
    const handleAnimationFinish = async () => {
      animationRef.current?.play(0, 300);
      setShowFullScreen(false);
                // Guardar la fecha actual como la última vez que el usuario hizo el quiz
  const today = new Date().toDateString();
  await AsyncStorage.setItem("lastQuizDate", today);
  console.log('Fecha del último quiz guardada:', today);

      navigation.navigate("bibleQuiz");
    };
  
    return (
      <View>
        <View className="w-full flex justify-start mt-5">
          <Text className="text-3xl font-bold">Explora</Text>
        </View>
        
        {/* Navegación superior */}
        <View className=" flex flex-row gap-2 mt-4 ">
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab.key}
              className={` px-4 py-2 rounded-full ${
                selectedTab === tab.key ? " bg-blue-100 p-3" : "bg-white p-3"
              }`}
              onPress={() => setSelectedTab(tab.key)}
            >
              <Text className={selectedTab === tab.key ? "text-black" : "text-black"}>{tab.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
        

       
        <ScrollView  horizontal showsHorizontalScrollIndicator={true}>
        {/* Contenido dinámico basado en la pestaña seleccionada */}
        <View className="mt-4">
          {selectedTab === "inicio" && (
            <View className="flex flex-row gap-4">
               <TouchableOpacity
               style={styles.inicio}
            //className="w-52 h-32 bg-blue-600 rounded-xl p-4 flex justify-between shadow-lg"
            onPress={handleAnimationPress}
            activeOpacity={0.7}
          >
               
            <View className="flex flex-row justify-between">
           
              <FontAwesome5 name="brain" size={30} color="white" />
              <View className="flex-row relative items-center gap-2">
               
                <AntDesign name="arrowright" size={24} color="black" />
              </View>
            </View>
            <Text className="text-white font-bold text-lg">
              Refuerza tus conocimientos
            </Text>
            {!hasDoneQuizToday && ( // Mostrar ícono si no ha hecho el quiz hoy
                  <View className=" w-full h-full flex flex-row justify-end relative top-10 right-0 " >
                    <LottieView source={require("../../assets/lottieFiles/notification-quiz.json")}
                     renderMode="cover" autoPlay loop
                     style={styles.notificationLottie}	
                    />
                  </View>

                )}

  
          </TouchableOpacity>
              <TouchableOpacity
                style={styles.verciculos}
                //className="w-52 h-32 bg-orange-500 rounded-xl p-4 flex justify-between"
                onPress={() => navigation.navigate("versiculosFavoritos")}
              >
                <View className="flex flex-row justify-between">
                  <FontAwesome5 name="book" size={28} color="white" />
                  <AntDesign name="arrowright" size={24} color="black" />
                </View>
                <Text className="text-white font-bold">Versículos Guardados</Text>
              </TouchableOpacity>
            </View>
          )}
          


          {/* Contenido de la pestaña "Lectura Diaria" */}
          <View className="flex flex-row gap-4">
          {selectedTab === "Lectura Diaria" && (
            <View className="flex flex-row gap-4">
              <TouchableOpacity 
              onPress={() => navigation.navigate("dailyReading")}
              style={styles.lecturaDiaria}
              >
                <View className="flex flex-row justify-between">
                  <FontAwesome5 name="book-open" size={30} color="white" />
                  <AntDesign name="arrowright" size={24} color="black" />
                </View>
                <Text className="text-white font-bold w-8">
                  Lectura Diaria
                </Text>

                {!hasDoneQuizToday && ( // Mostrar ícono si no ha hecho el quiz hoy
                  <View className=" flex flex-row justify-end  " >
                    <LottieView source={require("../../assets/lottieFiles/notification-quiz.json")}
                     renderMode="cover" autoPlay loop
                     style={styles.notificationLottie}	
                    />
                  </View>
                )}
              </TouchableOpacity>
            </View>
          )}
          {
            selectedTab === 'Lectura Diaria' && (
              <View className="flex flex-row gap-4">
                <TouchableOpacity 
                onPress={() => navigation.navigate("lecturasVistas")}
                style={styles.lecturas}
                >
                  <View className="flex flex-row justify-between">
                    <FontAwesome5 name="book" size={30} color="white" />
                    <AntDesign name="arrowright" size={24} color="black" />
                  </View>
                  <Text className="text-white font-bold">Lecturas</Text>
                  
                </TouchableOpacity>
              </View>
            )
          }
          </View>
          
        </View>
        </ScrollView>
        {/* Modal para animación de pantalla completa */}
        <Modal visible={showFullScreen} transparent={true}>
          <View style={styles.modalContainer}>
            <LottieView
              ref={animationRef}
              source={require("../../assets/lottieFiles/cerebro.json")}
              autoPlay
              loop={false}
              style={{ width: "100%", height: "100%" }}
              resizeMode="contain"
              onAnimationFinish={handleAnimationFinish}
            />
          </View>
        </Modal>
      </View>
    );
  }

const styles = StyleSheet.create({
    inicio: {
      width: 180,
      height: 130,
      display: "flex",
      flexDirection: "column",
      justifyContent: "space-around",
      backgroundColor: "blue",
      borderRadius: 10, 
      padding: 10,
    },
   
    verciculos: {
      width: 180,
      height: 130,
      display: "flex",
      flexDirection: "column",
      justifyContent: "space-around",
     backgroundColor: "#F97316",
      borderRadius: 10, 
      padding: 10,
      
    },
    lecturaDiaria: {
      
      width: 180,
      height: 130,
      display: "flex",
      flexDirection: "column",
      justifyContent: "space-around",
     backgroundColor: "red",
      borderRadius: 10, 
      padding: 10,
      
    },
    lecturas: {
      
      width: 180,
      height: 130,
      display: "flex",
      flexDirection: "column",
      justifyContent: "space-around",
     backgroundColor: "purple",
      borderRadius: 10, 
      padding: 10,
      justifyContent: "space-around",
    },
    notificationLottie: {
        width: 40,
        height: 40,
        borderRadius: 50,
        overflow: "hidden",
        position: "absolute",
        right: -10,
        bottom: 70,
    },
   
  cerebro: {
    width: 100,
    height: 40,
    position: "relative",
    right: 20,
    marginBottom: 5,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.8)", // Fondo oscuro para resaltar la animación
    justifyContent: "center",
    alignItems: "center",
  },
});
