import { View, Text, ScrollView, Pressable, Alert, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  Entypo,  
  MaterialCommunityIcons, 
  AntDesign, 
  FontAwesome6,
  Ionicons
} from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import useAuth from '../../components/authContext/authContext';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../../components/firebase/firebaseConfig';
import { Avatar } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { niveles } from '@/components/Niveles/niveles';
import { useNavigation } from '@react-navigation/native';

export default function Profile() {
  const navigation = useNavigation();
  const [userInfo, setUserInfo] = useState({});
  const { user, signOut } = useAuth();




  useEffect(() => {
    if (!user) return;
    const userRef = doc(db, 'users', user?.uid);
    
    const unsubscribe = onSnapshot(userRef, (doc) => {
      setUserInfo(doc.data());
    });
    return () => unsubscribe();
  }, [user]);


  const salir = () => {
    Alert.alert('Salir', '¿Está seguro de que desea salir?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Salir',
        onPress: async () => {
          await signOut();
          navigation.replace('signUpScreen');
        },
      },
    ]);
  };


  return (
    <ScrollView className='bg-gray-100'>
      <SafeAreaView className="flex-1">
        {/* Header con botón de salida */}
        <View className="flex-row justify-between items-center p-4 ">
          <View className='flex-row items-center '>
          <Ionicons name="person-circle" size={35} color="black" />
          <Text className="text-2xl font-bold text-gray-800 ml-2 ">Perfil</Text>
          </View>
          <Pressable
            onPress={salir}
            className="flex-row items-center bg-red-100 p-2 rounded-lg"
          >
            <Entypo name="log-out" size={20} color="red" />
            <Text className="text-red-600 ml-2 font-bold">Salir</Text>
          </Pressable>
        </View>

        {/* Tarjeta de perfil con gradiente */}
        <LinearGradient
          colors={['blue', '#6E8BFA']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.card} 
        >
          <View className="items-center">
            <Avatar.Image
              size={100}
              source={userInfo?.photoURL ? { uri: userInfo.photoURL } : require('../../assets/images/icon.png')}
              className="bg-white"
            />
            <Text className="text-2xl font-bold text-white mt-4">{userInfo?.Name || 'Usuario'}</Text>
            <View className="flex-row items-center mt-1">
              <MaterialCommunityIcons name="certificate" size={16} color="#fbbf24" />
              <Text className="text-gray-200 ml-1">@{userInfo?.username || 'usuario123'}</Text>
            </View>
          </View>

          {/* Estadísticas rápidas */}
          <View className="flex-row justify-between mt-6">
            <View className="items-center">
              <View className="bg-white p-2 rounded-full">
    <MaterialCommunityIcons name="lightning-bolt-outline" size={26} color="black" />
              </View>
              <Text className="text-white text-xl font-bold mt-2">{userInfo?.RachaMaxima }</Text>
              <Text className="text-gray-200 text-sm">Racha Máxima</Text>
            </View>

            <View className="items-center">
              <View className="bg-white p-2 rounded-full">
                <AntDesign name="linechart" size={24} color="#4f46e5" />
              </View>
              <Text className="text-white text-xl font-bold mt-2">Nivel {userInfo?.Nivel || 1}</Text>
              <Text className="text-gray-200 text-sm">{niveles(userInfo?.Exp).insignia}</Text>
            </View>

            <View className="items-center">
              <View className="bg-white p-2 rounded-full">
              <FontAwesome6 name="coins" size={24} color="gold" />         
              </View>
              <Text className="text-white text-xl font-bold mt-2">{userInfo?.Monedas || 0}</Text>
              <Text className="text-gray-200 text-sm">Monedas</Text>
            </View>
          </View>
        </LinearGradient>

      

        {/* Sección de insignias */}
        <View className="mx-4 mt-6">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-xl font-bold text-gray-800">Logros</Text>
            <MaterialCommunityIcons name="medal" size={24} color="#4f46e5" />
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
  {userInfo?.Insignias?.length > 0 ? (
    userInfo.Insignias.map((insignia, index) => (
      <View 
        key={insignia.id || index} 
        style={styles.insigniaContainer}
      >
        <Entypo name="trophy" size={24} color="gold" />
        <Text style={styles.insigniaText}>
          {insignia}
        </Text>
      </View>
    ))
  ) : (
    <Text style={styles.noInsigniasText}>Aún no has conseguido ninguna insignia.</Text>
  )}
</ScrollView>
        </View>
<View className="mx-4 mt-6">
  <Text className='text-xl font-bold text-gray-800'>Descripcion</Text>
  <Text className='text-xl  text-gray-800'>
    Lorem, ipsum dolor sit amet consectetur adipisicing elit. Officiis quas nostrum odit ea libero magnam! Provident aperiam officiis dolorem praesentium aliquid, unde ratione natus cumque. Beatae rem omnis nulla repudiandae?
    </Text>
</View>
       
        
      </SafeAreaView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  card: {
    height: 300,
    padding: 16,
    borderRadius: 8,
    marginHorizontal: 20,
  },
  insignia: {
    alignItems: 'center',
    marginRight: 10,
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    minWidth: 100,
  },
    insigniaContainer: {
      borderRadius: 20,
       paddingVertical: 8,
      paddingHorizontal: 20,
      marginHorizontal: 4,
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    backgroundColor: 'blue',
    
    },
   
    insigniaText: {
      color: '#fff',
      fontSize: 13,
      fontWeight: '700',
      textTransform: 'uppercase',
      letterSpacing: 0.5,
      textShadowColor: 'yellow',
      textShadowOffset: { width: 0.5, height: 0.5 },
      textShadowRadius: 1,
      
    },
   

});