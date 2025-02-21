import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Alert,
  StyleSheet,
  Linking,
  Share,
  Image
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import {
  MaterialCommunityIcons,
  Feather,
  AntDesign,
  FontAwesome6,
  FontAwesome5,
  MaterialIcons
} from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import useAuth from '../../components/authContext/authContext';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../../components/firebase/firebaseConfig';
import { niveles } from '@/components/Niveles/niveles';
import { Avatar } from '@rneui/themed';
import { Icon } from '@rneui/themed';

export default function Profile() {
  const navigation = useNavigation();
  const { user, signOut } = useAuth();
  const [userInfo, setUserInfo] = useState({});
 


  // Escucha de cambios en la información del usuario en Firebase
  useEffect(() => {
    if (!user) return;
    const userRef = doc(db, 'users', user.uid);
    const unsubscribe = onSnapshot(userRef, (doc) => {
      setUserInfo(doc.data());
    });
    return () => unsubscribe();
  }, [user]);


  return (
    <SafeAreaView style={styles.safeAreaView}>
      {/* Encabezado personalizado */}
      <View className='flex-row items-center justify-between py-4 px-4'>
        <Text className='text-2xl font-bold'>Perfil</Text>
          <Pressable onPress={() => navigation.navigate('menuScreen')}>
          <Icon 
            name="menu"
            type="ionicon"
            size={30}
            color="black"
          />
          </Pressable>
      </View>

    
      
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Tarjeta de Perfil con fondo degradado */}
          <View style={styles.profileCard}>
            <LinearGradient
              colors={['#6366f1', '#4338ca']}
              style={styles.gradient}
            >
              <View style={styles.profileHeader}>
                <View style={styles.avatarContainer}>
                  <Avatar
                    style={[styles.avatar, { width: 100, height: 100 }]}
                    source={
                      userInfo?.FotoPerfil
                        ? { uri: userInfo.FotoPerfil }
                        : require('../../assets/images/icon.png')
                    }
                  />
                 
                </View>
                <Text className='text-2xl font-bold text-white'>
                  {userInfo?.Name || 'Usuario'}
                </Text>
                <Text className='text-lg text-white'>
                  @{userInfo?.username || 'usuario123'}
                </Text>
              </View>

              {/* Sección de Estadísticas */}
              <View style={styles.statsContainer}>
                <StatItem
                  icon={
                    <MaterialCommunityIcons
                      name="lightning-bolt"
                      size={24}
                      color="#f59e0b"
                    />
                  }
                  value={userInfo?.RachaMaxima || 0}
                  label="Racha Máx"
                />
                <StatItem
                  icon={
                    <AntDesign name="linechart" size={24} color="#3b82f6" />
                  }
                  value={`Nivel ${userInfo?.Nivel || 1}`}
                  label={niveles(userInfo?.Exp)?.insignia}
                  progress={niveles(userInfo?.Exp)?.progreso}
                />
                <StatItem
                  icon={
                    <FontAwesome6 name="coins" size={24} color="#eab308" />
                  }
                  value={userInfo?.Monedas || 0}
                  label="Monedas"
                />
              </View>
            </LinearGradient>
          </View>

          {/* Sección de Insignias Destacadas */}
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Insignias Destacadas</Text>
              <MaterialCommunityIcons
                name="medal-outline"
                size={24}
                color="#4f46e5"
              />
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.badgesScroll}
            >
              {userInfo?.Insignias?.length > 0 ? (
                userInfo.Insignias.map((insignias, index) => (
                  <View key={index} style={styles.badgeCard}>
                    <MaterialCommunityIcons
                      name="medal"
                      size={32}
                      color="#f59e0b"
                    />
                    <Text style={styles.badgeText}>{insignias}</Text>
                  </View>
                ))
              ) : (
                <View style={styles.emptyBadgeCard}>
                  <Text style={styles.emptyBadgeText}>
                    Completa más actividades para ganar insignias 🏆
                  </Text>
                </View>
              )}
            </ScrollView>
          </View>

          {/* Sección Acerca de */}
          <View style={styles.aboutCard}>
            <Text style={styles.aboutTitle}>Descripcion</Text>
            <View style={styles.aboutContent}>
              <Text style={styles.aboutText}>
                {userInfo?.Description ||
                  '¡Hola! Soy un apasionado del aprendizaje continuo y me encanta compartir conocimiento.'}
              </Text>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    
  );
}

// Componente para cada estadística del perfil
const StatItem = ({ icon, value, label}) => (
  <View style={styles.statItem}>
    <View style={styles.statIcon}>{icon}</View>
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
    
  </View>
);

const styles = StyleSheet.create({
  menu: {
    marginTop: 40,
    borderRadius: 12,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    width: '100%',
  },
  menuIcon: {
    marginRight: 12,
    color: '#64748b',
  },
  menuText: {
    fontSize: 16,
    color: '#334155',
  },
  safeAreaView: {
    flex: 1,
  },

  /* Estilos para la tarjeta de perfil */
  profileCard: {
    margin: 16,
    borderRadius: 20,
    elevation: 5,
    overflow: 'hidden',
  },
  gradient: {
    padding: 24,
  },
  profileHeader: {
    alignItems: 'center',
  },
  
  avatar: {
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'white',
    borderRadius: 50,
  },
  editIcon: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#4f46e5',
    borderRadius: 12,
    padding: 5,
    borderWidth: 2,
    borderColor: 'white',
  },

  /* Estilos para la sección de estadísticas */
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 24,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statIcon: {
    backgroundColor: 'white',
    padding: 8,
    borderRadius: 25,
    elevation: 2,
  },
  statValue: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 8,
  },
  statLabel: {
    color: '#e5e7eb',
    fontSize: 12,
    marginTop: 4,
  },
  progressContainer: {
    height: 4,
    width: 60,
    backgroundColor: '#e0e7ff',
    borderRadius: 2,
    marginTop: 4,
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#4f46e5',
    borderRadius: 2,
  },
  progressText: {
    color: '#e5e7eb',
    fontSize: 10,
    marginTop: 2,
  },
  /* Estilos para la sección de insignias */
  sectionContainer: {
    marginHorizontal: 16,
    marginTop: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  badgesScroll: {
    paddingLeft: 4,
  },
  badgeCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    minWidth: 100,
    marginRight: 12,
    elevation: 2,
  },
  badgeText: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    color: '#333',
  },
  emptyBadgeCard: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#e0f2fe',
    elevation: 2,
  },
  emptyBadgeText: {
    fontSize: 14,
    color: '#0369a1',
  },
  /* Estilos para la sección "Acerca de" */
  aboutCard: {
    margin: 16,
    borderRadius: 12,
    elevation: 3,
    backgroundColor: 'white',
  },
  aboutTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  aboutContent: {
    padding: 16,
  },
  aboutText: {
    fontSize: 14,
    color: '#555',
    lineHeight: 20,
  },
});
