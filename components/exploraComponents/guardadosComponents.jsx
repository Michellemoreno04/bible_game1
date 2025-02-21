import {
    Text,
    View,
    StyleSheet,
    Modal,
    TouchableOpacity,
    ScrollView,
  } from "react-native";
  import {
    AntDesign,
    FontAwesome5,
    Ionicons,
  } from "@expo/vector-icons";
  import React, {useEffect, useState, useRef } from "react";
  import { useNavigation } from "expo-router";
  import LottieView from "lottie-react-native";
  import AsyncStorage from "@react-native-async-storage/async-storage";


  
  export default function GuardadosComponents() {
    const navigation = useNavigation();



  
    return (    
          <View  >
            <Text className="text-2xl font-bold text-black">
              Guardados
            </Text>
          
        <View className="w-full mt-4 flex flex-row  ">
                    
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
      marginRight: 10
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
      marginRight: 10
      
    },
    notificationIcon: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    top: 85,
    left: 5,
      
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
      marginRight: 10
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
