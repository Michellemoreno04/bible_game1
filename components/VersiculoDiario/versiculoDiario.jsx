import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Alert,
  Share,
  ImageBackground,
} from "react-native";
import { Feather, AntDesign } from "@expo/vector-icons";
import { db } from "../../components/firebase/firebaseConfig";
import {
  collection,
  getDocs,
  getDoc,
  query,
  limit,
  where,
  serverTimestamp,
  doc,
  setDoc,
  writeBatch,
  addDoc,
  updateDoc,
  orderBy,
  startAfter,
  
} from "firebase/firestore";
import useAuth from "../authContext/authContext";
import { useNavigation } from "@react-navigation/native";
import { captureRef } from "react-native-view-shot";
import AsyncStorage from "@react-native-async-storage/async-storage";


const VersiculosDiarios = () => {
  const { user } = useAuth();
  const navigation = useNavigation();
  const [versiculo, setVersiculo] = useState(null);
  const [versiculoGuardado, setVersiculoGuardado] = useState(false);
  const userId = user?.uid;

  // Estado para controlar si se muestran los botones o no.
  const [hideButtons, setHideButtons] = useState(false);

  // Creamos el ref para capturar la vista completa (incluyendo el fondo y el contenido)
  const viewRef = useRef();
      
    // Obtener versículo del día
  useEffect(() => {
    if (!userId) return;
  
    const fetchVersiculoDelDia = async () => {
      try {
        const userDocRef = doc(db, 'users', userId);
        const versiculoDocRef = doc(userDocRef, 'versiculoDelDia/current');
        
        // 1. Obtener documento del usuario y último índice usado
        const [userDoc, currentVerseDoc] = await Promise.all([
          getDoc(userDocRef),
          getDoc(versiculoDocRef)
        ]);
  
        const currentTime = new Date();
        
        // 2. Verificar si hay versículo de hoy
        if (currentVerseDoc.exists()) {
          const data = currentVerseDoc.data();
          if (data.timestamp.toDate().toDateString() === currentTime.toDateString()) {
            setVersiculo(data.versiculo);
            return;
          }
        }
  
        // 3. Obtener el último índice usado del usuario
        const lastIndex = userDoc.data()?.lastVerseIndex || 0;
        
        // 4. Buscar siguiente versículo por índice
        const q = query(
          collection(db, "versiculosDiarios"),
          orderBy("index", "asc"),
          startAfter(lastIndex),
          limit(1)
        );
  
        let snapshot = await getDocs(q);
        let nuevoVersiculo = snapshot.docs[0];
  
        // 5. Si no hay más versículos, reiniciar contador
        if (!nuevoVersiculo) {
          const resetQuery = query(
            collection(db, "versiculosDiarios"),
            orderBy("index", "asc"),
            limit(1)
          );
          snapshot = await getDocs(resetQuery);
          nuevoVersiculo = snapshot.docs[0];
        }
  
        if (!nuevoVersiculo) {
          throw new Error("No hay versículos disponibles");
        }
  
        // 6. Actualizar en lote
        const batch = writeBatch(db);
        const newIndex = nuevoVersiculo.data().index;
        const verseData = { id: nuevoVersiculo.id, ...nuevoVersiculo.data() };
  
        // Actualizar último índice en usuario
        batch.update(userDocRef, {
          lastVerseIndex: newIndex
        });
  
        // Guardar versículo actual
        batch.set(versiculoDocRef, {
          versiculo: verseData,
          timestamp: serverTimestamp()
        });
  
        await batch.commit();
        setVersiculo(verseData);
  
      } catch (error) {
        console.error("Error obteniendo versículo:", error);
        // Manejar error o asignar versículo por defecto
      }
    };
  
    fetchVersiculoDelDia();
  }, [userId]);
  

  // Función para capturar la vista SIN los botones y compartir la imagen
  const share = async () => {
    try {
      // Ocultamos temporalmente los botones
      setHideButtons(true);
      // Esperamos un breve momento para que se re-renderice la vista sin los botones
      setTimeout(async () => {
        const uri = await captureRef(viewRef, {
          format: "png", // Puedes usar "jpg" si prefieres
          quality: 1,
        });
        console.log("Imagen capturada");

        // Compartimos la imagen capturada
        await Share.share({
          url: uri,
          title: "Compartir Versículo",
        });

        // Volvemos a mostrar los botones después de compartir
        setHideButtons(false);
      }, 200); // 200 ms de retraso (ajusta si es necesario)
    } catch (error) {
      console.error("Error al capturar y compartir:", error.message);
      // Aseguramos que se vuelvan a mostrar los botones en caso de error
      setHideButtons(false);
    }
  };

  // Función para guardar el versículo como favorito
  const guardar = async () => {
    try {
      // Si ya está guardado, no hacer nada
      if (versiculoGuardado){
        Alert.alert("Este versículo ya estaba guardado.");
        return;
      }
      
      // Actualizar estado inmediatamente
      setVersiculoGuardado(true);
      const today = new Date().toDateString();
      await AsyncStorage.setItem('versiculoFavorito', today);
      
      const versiculosRef = collection(db, `users/${userId}/versiculosFavoritos`);
      const q = query(versiculosRef, where("texto", "==", versiculo.texto));
  
      const querySnapshot = await getDocs(q);
  
      if (!querySnapshot.empty) {
        Alert.alert("Este versículo ya está guardado.");
        return;
      }
  
      await addDoc(versiculosRef, {
        fecha: new Date().toDateString(),
        versiculo: versiculo.versiculo,
        texto: versiculo.texto,
        timestamp: serverTimestamp(),
      });
      
    
  
    } catch (error) {
      console.error("Error guardando el versículo:", error);
      // Revertir estado si hay error
      setVersiculoGuardado(false);
    }
  };
  
  
  // verficar si el versiculo ya ha sido guardado
  useEffect(() => {
    const checkInitialState = async () => {
      const today = new Date().toDateString();
      const savedDate = await AsyncStorage.getItem('versiculoFavorito');
      setVersiculoGuardado(savedDate === today);
      //console.log('dia guardado del versiculo',savedDate);
    };
    checkInitialState();
  }, []);



  return (
<ImageBackground
  ref={viewRef}
  collapsable={false}
  source={require("../../assets/images/bg-versiculo.jpg")}
  style={styles.backgroundImage}
>
 
  <View style={styles.card}>
    
      {/* Texto del versículo con formato de cita */}
      <Text style={styles.text}>“{versiculo?.texto}”</Text>
      
      {/* Referencia alineada a la derecha con tipografía especial */}
      <Text style={styles.reference}>- {versiculo?.versiculo}</Text>

      {/* Contenedor de botones alineado a la derecha */}
    </View>
      {!hideButtons && (
        <View style={styles.actionsContainer}>
          <Pressable style={styles.actionButton} onPress={share}>
            <Feather name="share-2" size={18} color="white" />
            <Text style={styles.actionText}>Compartir</Text>
          </Pressable>
          <Pressable style={styles.actionButton} onPress={guardar}>
            <AntDesign
              name={versiculoGuardado ? "heart" : "hearto"}
              size={18}
              color={versiculoGuardado ? "red" : "white"}
            />
            <Text style={styles.actionText}>{versiculoGuardado ? 'Guardado' : 'Guardar'}</Text>
          </Pressable>
        </View>
      )}
  
</ImageBackground>

  );
};

// Estilos ajustados
const styles = StyleSheet.create({
  backgroundImage: {

    minHeight: 300, // Altura aumentada
    borderRadius: 20,
    overflow: "hidden",
    padding: 10,
    paddingTop: 20,
    
  },
 
  card: {
    minHeight: 235, // Altura aumentada
    backgroundColor: "white",
    opacity: 0.5,
    borderRadius: 20,
    justifyContent: 'center',
    alignContent: 'center'
  },
 
  text: {
    fontSize: 20, // Tamaño de fuente aumentado
    color: "black",
    fontWeight: "500",
    lineHeight: 36, // Interlineado mayor
    textAlign: "center",
    fontFamily: 'Georgia', // Fuente serif si está disponible
    marginHorizontal: 10,
    //marginTop: 5,
   
  },
  reference: {
    fontSize: 20,
    color: "black",
    fontWeight: "400",
    textAlign: "right",
    fontStyle: "italic",
    fontFamily: 'Georgia', // Fuente serif si está disponible
    marginHorizontal: 15,
    position: 'absolute',
    bottom: 10,
    right: 10
  },
  actionsContainer: {
    flexDirection: "row",
    justifyContent: 'flex-start', // Botones a la derecha
    gap: 15, // Espacio entre botones
    marginTop: 0,
    position: 'absolute',
    bottom: 2,
    left: 15
    
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingVertical: 8,
    paddingHorizontal: 5,
    borderRadius: 20, // Bordes redondeados
  // backgroundColor: 'rgba(255, 255, 255, 0.6)',
    //borderWidth: 1,
    //borderColor: "#2C3A4B",
    
    
  },
  actionText: {
    color: "white",
    fontSize: 16,
    fontWeight: "500",
    letterSpacing: 0.5,
  },
});
  
  export default VersiculosDiarios;