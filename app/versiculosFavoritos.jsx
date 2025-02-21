import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, ActivityIndicator, TouchableOpacity, Modal, StyleSheet, Share, SafeAreaView, TextInput } from 'react-native';
import { getFirestore, collection, query, limit, startAfter, getDocs, doc, deleteDoc, orderBy } from 'firebase/firestore';
import useAuth from '../components/authContext/authContext';
import { Entypo, EvilIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function VersiculosFavoritos() {
  const [versiculos, setVersiculos] = useState([]);
  const [lastDoc, setLastDoc] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [menuVisible, setMenuVisible] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const db = getFirestore();
  const { user } = useAuth();
  const ITEMS_PER_PAGE = 10;

  const fetchVersiculos = async (loadMore = false) => {
    if (loading || (loadMore && loadingMore)) return;

    try {
      loadMore ? setLoadingMore(true) : setLoading(true);

      let q = query(
        collection(db, `users/${user.uid}/versiculosFavoritos`),
        orderBy('timestamp', 'desc'),
        limit(ITEMS_PER_PAGE)
      );

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
    } catch (error) {
      console.error('Error al obtener versículos:', error);
    } finally {
      loadMore ? setLoadingMore(false) : setLoading(false);
    }
  };

  const eliminarVersiculo = async (id) => {
    await AsyncStorage.removeItem('versiculoFavorito');
    
    try {
      await deleteDoc(doc(db, `users/${user.uid}/versiculosFavoritos`, id));
      setVersiculos(versiculos.filter(versiculo => versiculo.id !== id));
      setMenuVisible(null);
    } catch (error) {
      console.error('Error al eliminar versículo:', error);
    }
  };

  const compartir = async (versiculoId) => {
    try {
      const versiculo = versiculos.find(v => v.id === versiculoId);
      if (!versiculo) return;

      const message = `${versiculo.texto}\n- ${versiculo.versiculo}`;
      await Share.share({ message });
    } catch (error) {
      console.error('Error al compartir versículo:', error);
    }
  };

  useEffect(() => {
    fetchVersiculos();
  }, []);

  const fechaFormateada = (fechaISO) => {
    const fecha = new Date(fechaISO);
    return `${fecha.getDate()}/${fecha.getMonth() + 1}/${fecha.getFullYear()}`;
  };
// Función para filtrar los versículos por texto y versículo
  const filteredVersiculos = versiculos.filter(versiculo => {
    const searchLower = searchQuery.toLowerCase();
    return (
      versiculo.texto.toLowerCase().includes(searchLower) ||
      versiculo.versiculo.toLowerCase().includes(searchLower)
    );
  });

  const handleLoadMore = () => {
    if (lastDoc) {
      fetchVersiculos(true);
    }
  };

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

  return (
    <SafeAreaView style={styles.container}>
    
      <TextInput
        style={styles.searchInput}
        placeholder="Buscar versículos..."
        placeholderTextColor="#666"
        value={searchQuery}
        onChangeText={setSearchQuery}
      />
    

      {loading ? (
        <ActivityIndicator size="large" color="#ff8a00" />
      ) : (
        <FlatList
          data={filteredVersiculos}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            loadingMore && <ActivityIndicator size="large" color="#0000ff" />
          }
          ListEmptyComponent={
            <Text style={styles.noVersiculos}>
              {searchQuery ? "No se encontraron resultados" : "No tienes versículos favoritos aún"}
            </Text>
          }
        />
      )}

      {menuVisible && (
        <Modal transparent animationType="fade" visible={!!menuVisible} onRequestClose={() => setMenuVisible(null)}>
          <TouchableOpacity style={styles.modalOverlay} onPress={() => setMenuVisible(null)} />
          <View style={styles.menu}>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => eliminarVersiculo(menuVisible)}
            >
              <Text style={styles.menuItemText}>Eliminar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => compartir(menuVisible)}
            >
              <Text style={styles.shareText}>Compartir</Text>
            </TouchableOpacity>
          </View>
        </Modal>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 15,
    backgroundColor: '#fff',
    
  },
 
  searchInput: {
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 15,
    marginHorizontal: 5,
    marginTop: 15,
    color: '#333',
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
  shareText: {
    color: '#3b82f6',
    fontWeight: 'bold',
  },
  noVersiculos: {
    textAlign: 'center',
    marginTop: 20,
    color: '#666',
    fontSize: 16,
  },
});