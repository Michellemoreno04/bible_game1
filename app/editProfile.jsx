import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  Pressable, 
  StyleSheet, 
  Alert,
  Image,
  ScrollView 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { AntDesign } from '@expo/vector-icons';
import { Avatar } from '@rneui/themed';
import { updateDoc, doc, onSnapshot } from 'firebase/firestore';
import { db } from '../components/firebase/firebaseConfig';
import useAuth from '../components/authContext/authContext';
import * as ImagePicker from 'expo-image-picker';
import { useNavigation } from 'expo-router';

const EditProfileScreen = () => {
  const navigation = useNavigation();  
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    Name: '',
    Apodo: '',
    Description: '',
    FotoPerfil: ''
  });
  const [loading, setLoading] = useState(false);

  // Cargar datos actuales del usuario
  useEffect(() => {
    if (user) {
      const userRef = doc(db, 'users', user.uid);
      const unsubscribe = onSnapshot(userRef, (doc) => {
        setFormData(doc.data());
      });
      return () => unsubscribe();
    }
  }, [user]);

  const handleUpdate = async () => {
    
   

    try {
      setLoading(true);
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, formData);
      Alert.alert('Éxito', 'Perfil actualizado correctamente');
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', 'No se pudo actualizar el perfil');
    } finally {
      setLoading(false);
    }
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,        
        quality: 1,
      });
  
      if (!result.canceled) {
        console.log(result);
      } else {
        alert('You did not select any image.');
      }
  
      if (!result.canceled) {
        setFormData({ ...formData, FotoPerfil: result.assets[0].uri });
      }
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#6366f1', '#4338ca']}
        style={styles.gradientHeader}
      >
        <View style={styles.header}>
          <AntDesign 
            name="close" 
            size={24} 
            color="white" 
            onPress={() => navigation.goBack()} 
          />
          <Text style={styles.headerTitle}>Editar Perfil</Text>
          <Pressable onPress={handleUpdate} disabled={loading}>
            <Text style={styles.saveButton}>
              {loading ? 'Guardando...' : 'Guardar'}
            </Text>
          </Pressable>
        </View>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.content}>
        <Pressable onPress={pickImage}>
          {formData.FotoPerfil ? (
            <Avatar
              rounded
              source={{ uri: formData.FotoPerfil }}
              size="xlarge"
              />


          ) : (
            <View style={styles.avatar}>
            <Text style={styles.avatarText}>{formData.Name.toUpperCase().slice(0, 1)} </Text>
            </View>
          )
        
        }
          <View style={styles.editIcon}>
        
            <AntDesign name="camera" size={20} color="white" />
             
          </View>
        </Pressable>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Nombre Completo</Text>
          <TextInput
            style={styles.input}
            value={formData.Name}
            onChangeText={(text) => setFormData({...formData, Name: text})}
            placeholder="Ej: Juan Pérez"
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Apodo</Text>
          <TextInput
            style={styles.input}
            value={formData.Apodo}
            onChangeText={(text) => setFormData({...formData, username: text})}
            placeholder="Ej: juan123"
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Descripción</Text>
          <TextInput
            style={[styles.input, styles.descripcionInput]}
            value={formData.Description}
            onChangeText={(text) => setFormData({...formData, Description: text})}
            placeholder="Cuéntanos sobre ti..."
            multiline={true}
            numberOfLines={4} // Número inicial de líneas visibles
            autoFocus
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  gradientHeader: {
    paddingVertical: 20,
    paddingHorizontal: 15,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: '600',
  },
  saveButton: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  content: {
  
    padding: 20,
    alignItems: 'center',
  },
 
  avatar: {
    width: 150,
    height: 150,
    borderRadius: 100,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4f46e5',
  },
  avatarText: {
    color: 'white',
    fontSize: 50,
    fontWeight: '600',
    textTransform: 'uppercase',
    textAlign: 'center',
  },
  editIcon: {
    position: 'absolute',
    bottom: 5,
    right: 5,
    backgroundColor: '#4f46e5',
    borderRadius: 15,
    padding: 5,
    borderWidth: 2,
    borderColor: 'white',
  },
  formGroup: {
    width: '100%',
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    color: '#334155',
    marginBottom: 8,
    fontWeight: '500',
  },
  input: {
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 10,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  descripcionInput: {
    height: 100,
    textAlignVertical: 'top',
  },
});

export default EditProfileScreen;