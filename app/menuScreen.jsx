import { StyleSheet, ScrollView, View, Text, TouchableOpacity, Alert } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import useAuth from '../components/authContext/authContext';
import { useNavigation } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
const MenuScreen = () => {

const { signOut } = useAuth();
const navigation = useNavigation();




   // Función para cerrar sesión
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
    <SafeAreaView style={styles.container}>
    <ScrollView style={styles.container}>
      <Text className="text-2xl text-center font-bold pb-10"> Ajustes y Privacidad</Text>
      {/* Sección Principal */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Cuenta</Text>
        
        <TouchableOpacity style={styles.option} onPress={() => navigation.navigate('editProfile')}>
          <Text style={styles.optionText}>Editar perfil</Text>
          <MaterialIcons name="chevron-right" size={24} color="#666" />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.option}>
          <Text className="text-gray-400">Privacidad</Text>
          <MaterialIcons name="chevron-right" size={24} color="#666" />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.option} onPress={() => Alert.alert('no disponible aun')}>
          <Text className="text-gray-400">Soporte</Text>
          <MaterialIcons name="chevron-right" size={24} color="#666" />
        </TouchableOpacity>
      </View>

      {/* Sección Secundaria */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Preferencias</Text>
        
        <TouchableOpacity style={styles.option} onPress={() => Alert.alert('no disponible aun')}>
          <Text className="text-gray-400">Notificaciones</Text>
          <MaterialIcons name="chevron-right" size={24} color="#666" />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.option} onPress={() => Alert.alert('no disponible aun')}>
          <Text className="text-gray-400">Tema</Text>
          <MaterialIcons name="chevron-right" size={24} color="#666" />
        </TouchableOpacity>
      </View>

      {/* Cerrar Sesión */}
      <TouchableOpacity style={[styles.option, styles.logoutButton]} onPress={salir}>
        <Text style={styles.logoutText}>Cerrar sesión</Text>
      </TouchableOpacity>
    </ScrollView>
  </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 10,
  },
  section: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    color: '#666',
    fontSize: 14,
    fontWeight: '500',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  option: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
 
  logoutButton: {
    backgroundColor: 'white',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  logoutText: {
    color: 'red',
    fontSize: 16,
    fontWeight: '500',
  },
});

export default MenuScreen;