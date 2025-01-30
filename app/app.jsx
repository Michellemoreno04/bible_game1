import { Text, View, StyleSheet, SafeAreaView, ScrollView, Alert } from 'react-native';
import '../global.css';
import { Link } from 'expo-router';
import { AntDesign, MaterialCommunityIcons } from '@expo/vector-icons';
import useAuth from './authContext';
import React, { useEffect, useState } from 'react';
import { doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { db } from '@/components/firebase/firebaseConfig';
import { Avatar } from 'react-native-paper';
import { niveles } from '@/components/Niveles/niveles';
import VersiculosDiarios from '@/components/VersiculoDiario/versiculoDiario';
import NivelModal from '@/components/Modales/modalNivel';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from 'expo-router';
import AppComponent from './(tabs)';
//import AppComponent from './(tabs)';


export default  function Home() {


  return (
    <View className="w-full h-full  flex items-center justify-center ">
    <Text className="text-3xl text-black">hello</Text>
    
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    width: '100%',
    height: '100%',
    padding: 20,
  },
  estudiaContainer: {
    borderRadius: 10,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
  },
  estudia: {
    width: 185,
    height: 185,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ff8a00',
    margin: 10,
  },
});
