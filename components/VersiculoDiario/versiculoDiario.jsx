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
} from "firebase/firestore";
import useAuth from "../authContext/authContext";
import * as Clipboard from "expo-clipboard";
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
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

    
  // Función para obtener el versículo del día
  useEffect(() => {
    if (!userId) return;

    // Función para obtener el versículo del día
    const fetchVersiculoDelDia = async () => {
      try {
        // 1. Verificar si hay versículo vigente
        const currentRef = doc(db, `users/${userId}/versiculoDelDia/current`);
        const currentDoc = await getDoc(currentRef);
        
        if (currentDoc.exists()) {
          const data = currentDoc.data();
          const lastTimestamp = data.timestamp.toDate();
          
          if (new Date() - lastTimestamp < 86400000) { // 24h
            setVersiculo(data.versiculo);
            return;
          }
        }
    
        // 2. Obtener metadata de progreso
        const progressRef = doc(db, `users/${userId}/system/verseProgress`);
        const progressDoc = await getDoc(progressRef);
        const progress = progressDoc.exists() ? progressDoc.data() : { lastIndex: -1 };
    
        // 3. Obtener siguiente versículo
        const versiculosRef = collection(db, "versiculosDiarios");
        let nextIndex = progress.lastIndex + 1;
        
        // Intentar obtener el siguiente versículo
        let snapshot = await getDocs(query(
          versiculosRef,
          where("indice", "==", nextIndex),
          limit(1)
        ));
    
        // 4. Resetear si no hay más versículos
        if (snapshot.empty) {
          // Obtener el máximo índice disponible
          const maxSnapshot = await getDocs(query(
            versiculosRef,
            orderBy("indice", "desc"),
            limit(1)
          ));
          
          const maxIndex = maxSnapshot.docs[0]?.data().indice || 0;
          
          if (nextIndex > maxIndex) {
            nextIndex = 0; // Reiniciar ciclo
            snapshot = await getDocs(query(
              versiculosRef,
              where("indice", "==", 0),
              limit(1)
            ));
          }
        }
    
        // 5. Actualizar registros
        if (!snapshot.empty) {
          const nuevoVersiculo = snapshot.docs[0].data();
          const batch = writeBatch(db);
    
          // Actualizar progreso
          batch.set(progressRef, { 
            lastIndex: nextIndex,
            updatedAt: serverTimestamp()
          });
    
          // Establecer nuevo versículo
          batch.set(currentRef, {
            versiculo: nuevoVersiculo,
            timestamp: serverTimestamp()
          });
    
          await batch.commit();
          setVersiculo(nuevoVersiculo);
        } else {
          throw new Error("No se encontraron versículos en la base de datos");
        }
    
      } catch (error) {
        console.error("Error:", error);
        // Opcional: Cargar versículo por defecto
      }
    };
    
    fetchVersiculoDelDia();
  }, [userId]);

  // Función para copiar el texto al portapapeles
  const copiar = async () => {
    const textoCompleto = `${versiculo.texto} \n\n ${versiculo.versiculo}`;
    await Clipboard.setStringAsync(textoCompleto);
    Alert.alert("Texto copiado", "El texto se ha copiado al portapapeles.");
  };

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
      const versiculoFavoritoRef = doc(
        db,
        `users/${userId}/versiculosFavoritos`,
        versiculo.id
      );
      const documento = {
        fecha: new Date().toISOString(),
        texto: versiculo.texto,
        versiculo: versiculo.versiculo,
        timestamp: serverTimestamp(),
      };

   await AsyncStorage.setItem('versiculoFavorito', JSON.stringify(documento.versiculo));


      const docSnapshot = await getDoc(versiculoFavoritoRef);

      if (docSnapshot.exists()) {
        Alert.alert("Favorito", "Este versículo ya está en tus favoritos.");
      } else {
        await setDoc(versiculoFavoritoRef, documento);

        Alert.alert("Guardado", "El versículo se ha guardado con éxito.");
        setVersiculoGuardado(true);
      }
    } catch (error) {
      console.error("Error guardando versículo:", error);
      Alert.alert("Error", "No se pudo guardar el versículo.");
    }
  };
  // verficar si el versiculo ya ha sido guardado
useEffect(() => {
  const checkSavedVersiculo = async () => {
    try {
      const savedVersiculo = await AsyncStorage.getItem('versiculoFavorito');
      if (savedVersiculo) {
        setVersiculoGuardado(true);
      }
    } catch (error) {
      console.error('Error al obtener el versículo guardado:', error);
    }
  };

  checkSavedVersiculo();
  }, []);

  return (
    // Asignamos el ref al ImageBackground para capturar todo (fondo + contenido)
    <ImageBackground
      ref={viewRef}
      collapsable={false} // Asegura que el componente no se optimice y se capture correctamente
      source={require("../../assets/images/bg-versiculo.jpg")}
      style={styles.backgroundImage}
    >
      <View style={styles.card}>
        {/* Muestra la referencia del versículo */}
        <Text style={styles.reference}>{versiculo?.versiculo}</Text>

        {/* Muestra el contenido del versículo */}
        <View style={styles.content}>
          <Text style={styles.text}>{versiculo?.texto}</Text>
       

        {/* Los botones se muestran solo si hideButtons es false */}
        {!hideButtons && (
          <View style={styles.actionsContainer}>
            <Pressable style={styles.actionButton} onPress={copiar}>
              <Feather name="copy" size={15} color="white" />
              <Text style={styles.actionText}>Copiar</Text>
            </Pressable>
            <Pressable style={styles.actionButton} onPress={share}>
              <Feather name="share-2" size={15} color="white" />
              <Text style={styles.actionText}>Compartir</Text>
            </Pressable>
            <Pressable style={styles.actionButton} onPress={guardar}>
              <AntDesign
                name={versiculoGuardado ? "heart" : "hearto"}
                size={15}
                color={versiculoGuardado ? "#e74c3c" : "white"}
              />
              <Text style={styles.actionText}>Guardar</Text>
            </Pressable>
          </View>
        )}
         </View>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  backgroundImage: {
    width: "100%",
    minHeight: 200,
    borderRadius: 20,
    overflow: "hidden",
  },
  container: {
    flexGrow: 1,
    padding: 5,
    backgroundColor: "#f8f9fa",
    justifyContent: "center",
    
  },
  card: {

    borderRadius: 20,
    padding: 15,
    width: "100%",
    shadowColor: "#2f4f4f",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 10,
    marginVertical: 8,
    backgroundColor: "transparent",
  },
  reference: {
    fontSize: 18,
    textAlign: "right",
    color: "white",
    fontWeight: "600",
    fontStyle: "italic",
    letterSpacing: 0.5,
  },
  content: {
    
    minHeight: 150,
    flexDirection: "column",
    alignItems: "center",
    padding: 10,
    justifyContent:'space-between',
  },
  text: {
    flex: 1,
    fontSize: 20,
    color: "white",
    fontWeight: "500",
    },
  actionsContainer: {
    position: "relative",
    right: 60,
    flexDirection: "row",
    
    marginTop: 10,
    
  },
  actionButton: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "flex-start",
    marginRight: 10,
  },
  actionText: {
    color: "white",
    fontSize: 12,
    marginLeft: 2,
    fontWeight: "800",
  },
});

export default VersiculosDiarios;
