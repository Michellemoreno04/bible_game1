import { View, Text, ScrollView, Pressable, Alert, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Entypo } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import useAuth from '../authContext';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../../components/firebase/firebaseConfig';
import { Avatar } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { niveles } from '@/components/Niveles/niveles';

export default function Profile() {
  const insignias = ['plata', 'oro', 'diamante', 'platino'];
  const librosAprendidos = ['libro 1', 'libro 2', 'libro 3', 'libro 4', 'libro 5', 'libro 6'];
  const [userInfo, setUserInfo] = useState({});
  const { user, signOut } = useAuth();

  useEffect(() => {
    if (!user) return;

    const userRef = doc(db, 'users', user?.uid);
    const unsubscribe = onSnapshot(userRef, (doc) => {
      setUserInfo(doc.data());
    });
    return () => {
      unsubscribe();
    };
  }, [user]);

  const salir = () => {
    
    Alert.alert('Salir', '¿Está seguro de que desea salir?', [
      {
        text: 'Cancelar',
        style: 'cancel',
      },
      {
        text: 'Salir',
        onPress: async () => {
          console.log('Saliendo...');
          await signOut();
          navigation.replace('signUpScreen');
        },
      },
    ]);
  };

  return (
    <ScrollView>
      <SafeAreaView>
        <View className="bg-gray-100 min-h-screen p-5">
          {/* Botón de Logout */}
          <View className="w-full flex flex-row justify-end items-center mb-5">
            <Pressable onPress={salir}>
              <Entypo name="log-out" size={24} color="gray" />
            </Pressable>
          </View>

          {/* Tarjeta de Perfil */}
          <LinearGradient
            colors={['#1a73e8', '#4fc3f7']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.linearGradient}
          >
            <View className="items-center">
              <Avatar.Image size={120} source={require('../../assets/images/icon.png')} />
              <Text className="text-3xl font-bold text-white mt-4">{userInfo?.Name || 'Usuario'}</Text>
            </View>
            <View className="w-full flex flex-row justify-between  p-5 ">
              {/* Racha Máxima */}
              <View className="flex flex-col items-center">
                <Text className="text-2xl font-bold text-white">{userInfo?.RachaMaxima || 0}</Text>
                <Text className="text-lg font-bold text-white">Racha Máxima</Text>
              </View>
              {/* Nivel */}
              <View className="flex flex-col items-center">
                <Text className="text-2xl font-bold text-white">{niveles(userInfo?.Exp).insignia || 'Iniciante'}</Text>
                <Text className="text-lg font-bold text-white">Nivel {userInfo?.Nivel || 1}</Text>
              </View>
              {/* Monedas */}
              <View className="flex flex-col items-center">
                <Text className="text-2xl font-bold text-white">{userInfo?.Monedas || 0}</Text>
                <Text className="text-lg font-bold text-white">Monedas</Text>
              </View>
            </View>
          </LinearGradient>

          {/* Descripción */}
          <View className="p-6 ">
            <Text className="text-2xl text-gray-800 font-bold">Descripción</Text>
            <Text className="text-lg -300 mt-2">
              Lorem ipsum dolor sit amet consectetur, adipisicing elit. Vel, eum ratione ipsam voluptatem delectus
              deserunt minus qui enim reiciendis iste necessitatibus maiores dolorem commodi temporibus quaerat at
              unde. Sint, quis?
            </Text>
          </View>
        </View>
      </SafeAreaView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  linearGradient: {
    width: '100%',
    paddingTop: 20,
    borderRadius: 10,
  },
});