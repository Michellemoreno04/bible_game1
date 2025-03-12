import React, { useEffect, useState, useRef, useCallback } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Alert,
  Share,
  ImageBackground,
  Animated,
  ActivityIndicator,
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
  onSnapshot,
} from "firebase/firestore";
import useAuth from "../authContext/authContext";
import { useNavigation } from "@react-navigation/native";
import { captureRef } from "react-native-view-shot";
import { useToast } from "react-native-toast-notifications";
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from "firebase/storage";
import { LinearGradient } from "expo-linear-gradient";

export const VersiculosDiarios = () => {
  const { user } = useAuth();
  const navigation = useNavigation();
  const [versiculo, setVersiculo] = useState(null);
  const [versiculoGuardado, setVersiculoGuardado] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const userId = user?.uid;
  const toast = useToast();

  // Estado para controlar si se muestran los botones o no.
  const [hideButtons, setHideButtons] = useState(false);

  // Ref para capturar la vista completa (fondo y contenido)
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
      }
    };
  
    fetchVersiculoDelDia();
  }, [userId]);
  

  // Función para compartir la imagen capturada sin botones
  const share = async () => {
    setIsProcessing(true);
    toast.show('Compartiendo...',
       { type: 'success', 
        icon: <ActivityIndicator size="small" color="white" />

        });
    try {
      setHideButtons(true);
      setTimeout(async () => {
        const uri = await captureRef(viewRef, {
          format: "png",
          quality: 1,
        });
        await Share.share({
          url: uri,
          title: "Compartir Versículo",
        });
        setHideButtons(false);
      }, 200);
    } catch (error) {
      console.error("Error al capturar y compartir:", error.message);
      setHideButtons(false);
    }finally{
      setIsProcessing(false);
      setHideButtons(false);
    }
  };

  useEffect(() => {
    if (!userId || !versiculo?.id) return;
  
    const docRef = doc(db, `users/${userId}/versiculosFavoritos/${versiculo.id}`);
  
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      setVersiculoGuardado(docSnap.exists());
    });
  
    return () => unsubscribe(); // Limpiar la suscripción cuando el componente se desmonte
  }, [userId, versiculo?.id]);

 
 // Función de guardado simplificada
 const guardar = async () => {
  
  if ( versiculoGuardado){
    toast.show("⭐ Ya guardaste este versículo!",{
      type: "success",
      placement: "top",
    });
    setIsProcessing(true);
    return;
  } 

setIsProcessing(true);

toast.show("⭐ Guardando...",{
  type: "success",
  placement: "top",
  icon: <ActivityIndicator size="small" color="white" />,
});


  try {
    setHideButtons(true);
    await new Promise(resolve => setTimeout(resolve, 200)); // Esperar renderizado

    const uri = await captureRef(viewRef, {
      format: "png",
      quality: 0.8,
    });

    const storage = getStorage();
    const filename = `versiculo_${Date.now()}.png`;
    const imageRef = storageRef(storage, `users/${userId}/${filename}`);
    
    const response = await fetch(uri);
    const blob = await response.blob();
    await uploadBytes(imageRef, blob);
    
    const imageUrl = await getDownloadURL(imageRef);
    
    // Guardar usando ID del versículo como referencia
    const docRef = doc(db, `users/${userId}/versiculosFavoritos/${versiculo.id}`);
    await setDoc(docRef, {
      imageUrl,
      timestamp: serverTimestamp()
    }, { merge: true });

    setVersiculoGuardado(true); // Actualizar estado inmediatamente
    
  } catch (error) {
    console.error("Error:", error);
    toast.show("😢 Error al guardar", { type: "danger" });
  } finally {
    setHideButtons(false);
    setIsProcessing(false);
  }
  
};



return (
  <LinearGradient
  ref={viewRef}
  colors={["#6A65FB", "#8C9EFF"]}
    style={styles.container}
  >

    <View style={styles.card}>
      <Text style={styles.reference}>- {versiculo?.versiculo}</Text>
      <Text style={styles.text}>{versiculo?.texto}</Text>
      {!hideButtons && (
      <View style={styles.actionsContainer}>
        <Pressable style={styles.actionButton} onPress={share}>
          <Feather name="share-2" size={18} color="white" />
          <Text style={styles.actionText}>Compartir</Text>
        </Pressable>
        
        <Pressable 
          style={styles.actionButton} 
          onPress={guardar}
          disabled={ isProcessing}
        >
          <AntDesign
            name={versiculoGuardado ? "heart" : "hearto"}
            size={18}
            color={versiculoGuardado ? "#FF3B30" : "white"}
          />
          <Text style={styles.actionText}>
            {versiculoGuardado ? 'Guardado' : 'Guardar'}
          </Text>
        </Pressable>
      </View>
    )}
    </View>
    
    
  </LinearGradient>
);
};


  // Estilos ajustados
  const styles = StyleSheet.create({
    container: {
 
      
      borderRadius: 20,
      overflow: "hidden",
     marginBottom: 20
    },
   
    card: {
      minHeight: 235, // Altura aumentada
//backgroundColor: "black",
      //opacity: 0.5,
      borderRadius: 20,
      justifyContent: 'center',
      alignContent: 'center'
    },
   
    text: {
      fontSize: 20, // Tamaño de fuente aumentado
      color: "white",
      fontWeight: "500",
      lineHeight: 36, // Interlineado mayor
      textAlign: "center",
      fontFamily: 'Georgia', // Fuente serif si está disponible
      marginHorizontal: 10,
      
     
    },
    reference: {
      fontSize: 16,
      color: "white",
      fontWeight: "400",
      textAlign: "center",
      fontStyle: "italic",
      fontFamily: 'Georgia', // Fuente serif si está disponible
      
    },
    actionsContainer: {
      flexDirection: "row",
      justifyContent: 'flex-start', // Botones a la derecha
      gap: 5, // Espacio entre botones
      marginTop: 0,
      position: 'absolute',
      bottom: 2,
      left: 15
      
    },
    actionButton: {
      flexDirection: "row",
      alignItems: "center",
      gap: 2,
      paddingVertical: 8,
      paddingHorizontal: 2,
      borderRadius: 20, // Bordes redondeados
  
      
      
    },
    actionText: {
      color: "white",
      fontSize: 14,
      fontWeight: "500",
      
    },
  });