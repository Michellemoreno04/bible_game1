import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, ActivityIndicator, TouchableOpacity, Modal, StyleSheet, Share, SafeAreaView,ImageBackground } from 'react-native';
import { getFirestore, collection, query, limit, startAfter, getDocs, doc, deleteDoc, orderBy } from 'firebase/firestore';
import useAuth from '../components/authContext/authContext';
import { Entypo } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';


export default function VersiculosFavoritos() {
  const [versiculos, setVersiculos] = useState([]);
  const [lastDoc, setLastDoc] = useState(null); // Para la paginación
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [menuVisible, setMenuVisible] = useState(null); // Controla el menú visible

  const db = getFirestore();
  const { user } = useAuth();

  const ITEMS_PER_PAGE = 10; // Número de elementos por página

  const fetchVersiculos = async (loadMore = false) => {
    if (loading || (loadMore && loadingMore)) return;

    try {
      loadMore ? setLoadingMore(true) : setLoading(true);

      let q = query(
        collection(db, `users/${user.uid}/versiculosFavoritos`),
        orderBy('timestamp', 'desc'),
        limit(ITEMS_PER_PAGE)
      );

      // Agregar paginación
      if (loadMore && lastDoc) {
        q = query(q, startAfter(lastDoc));
      }

      const querySnapshot = await getDocs(q);
      const newVersiculos = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));

      setVersiculos(loadMore ? [...versiculos, ...newVersiculos] : newVersiculos);
      setLastDoc(querySnapshot.docs[querySnapshot.docs.length - 1]);
         console.log('Versículos obtenidos:', newVersiculos.length);
    } catch (error) {
      console.error('Error al obtener versículos:', error);
    } finally {
      loadMore ? setLoadingMore(false) : setLoading(false);
    }
  };

  const eliminarVersiculo = async (id) => {
    try {
      await deleteDoc(doc(db, `users/${user.uid}/versiculosFavoritos`, id));
      setVersiculos(versiculos.filter(versiculo => versiculo.id !== id));
      await AsyncStorage.removeItem('versiculoFavorito');
      setMenuVisible(null);
    } catch (error) {
      console.error('Error al eliminar versículo:', error);
    }
  };

  const compartir = async (versiculoId) => {
    try {
      // Buscar el versículo correspondiente en la lista
      const versiculo = versiculos.find(v => v.id === versiculoId);
      if (!versiculo) {
        console.error('No se encontró el versículo para compartir.');
        return;
      }
  
      // Preparar el contenido a compartir
      const message = `${versiculo.texto}\n- ${versiculo.versiculo}`;
      
      // Compartir el contenido
      await Share.share({
        
        message: message,
      });
  
      console.log('Versículo compartido con éxito');
    } catch (error) {
      console.error('Error al compartir versículo:', error);
    }
  };
  
  useEffect(() => {
    fetchVersiculos();
  }, []);

  const fechaFormateada = (fechaISO) => {
    const fecha = new Date(fechaISO);
    const dia = fecha.getDate();
    const mes = fecha.getMonth() + 1; // Los meses en JavaScript se indexan desde 0
    const anio = fecha.getFullYear();
    return `${dia}/${mes}/${anio}`;
  };

 

  if(!versiculos){
    return(
    <>
        <ActivityIndicator size="large" color="#ff8a00" />
        <Text>Cargando versículos...</Text>
        </>
    )
  }


  if(!versiculos.length){  
    return(
        <Text style={styles.noVersiculos}>No tienes versículos favoritos aun</Text>
  )}
  const renderItem = ({ item }) => (
    
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardDate}>{fechaFormateada(item.fecha)}</Text>
        <TouchableOpacity onPress={() => setMenuVisible(item.id)}>
        <Entypo name="dots-three-vertical" size={24} color="black" />
        </TouchableOpacity>
      </View>
      <Text style={styles.cardTitle}>{item.versiculo}</Text>
      <Text style={styles.cardText}>{item.texto}</Text>
    </View>
    
  );

  const handleLoadMore = () => {
    if (lastDoc) {
      fetchVersiculos(true);
    }
  };

  return (
    <SafeAreaView>
    <View style={styles.container} >
      {loading && <ActivityIndicator size="large" color="#0000ff" />}
      <FlatList
        data={versiculos}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          loadingMore && <ActivityIndicator size="large" color="#0000ff" />
        }
      />
     
     
      {/* Modal del menú */}
      {menuVisible && (
        <Modal transparent animationType="fade" visible={!!menuVisible} onRequestClose={() => setMenuVisible(null)}>
          <TouchableOpacity style={styles.modalOverlay} onPress={() => setMenuVisible(null)} />
          <View style={styles.menu}>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                eliminarVersiculo(menuVisible);
                
              }}
            >
              <Text style={styles.menuItemText}>Eliminar</Text>
            </TouchableOpacity>
            {/* Compartir versiculo */}
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                compartir(menuVisible);
                
              }}
            >
              <Text className="text-blue-500 font-bold" >Compartir</Text>
            </TouchableOpacity>
          </View>
        </Modal>
      )}
    </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: '100%',
    padding: 15,
    
  },
  card: {
    backgroundColor: '#e2e8f0',
    marginBottom: 10,
    padding: 15,
    borderRadius: 10,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardDate: {
    color: '#64748b',
    fontSize: 12,
  },
  menuButton: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 10,
  },
  cardText: {
    fontSize: 14,
    color: '#1f2937',
    marginTop: 5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  menu: {
    position: 'absolute',
    bottom: 50,
    right: 20,
    backgroundColor: '#ffffff',
    padding: 10,
    borderRadius: 5,
    elevation: 5,
  },
  menuItem: {
    padding: 10,
  },
  menuItemText: {
    color: '#ef4444',
    fontWeight: 'bold',
  },
  noVersiculos: {
    color: '#333',
    textAlign: 'center',
    marginTop: 50,
  },
  backgroundColor: {
    width: '100%',
    height: '100%',
    

  },
});
