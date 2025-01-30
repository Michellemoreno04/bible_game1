import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Alert,
  Share,
  Image,
  Dimensions,
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
} from "firebase/firestore";
import useAuth from "@/app/authContext";
import * as Clipboard from "expo-clipboard";
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";

const VersiculosDiarios = () => {
  const { user } = useAuth();
  const navigation = useNavigation();
  const [versiculo, setVersiculo] = useState(null);
  const [versiculoGuardado, setVersiculoGuardado] = useState(false);
  const userId = user?.uid;

  useEffect(() => {
    const verificarVersiculoFavorito = async (versiculoId) => {
      if (!versiculoId) return;

      try {
        const versiculoFavoritoRef = doc(
          db,
          `users/${userId}/versiculosFavoritos`,
          versiculoId
        );
        const docSnapshot = await getDoc(versiculoFavoritoRef);
        setVersiculoGuardado(docSnapshot.exists());
      } catch (error) {
        console.error("Error verificando versículo favorito:", error);
      }
    };

    navigation.addListener("focus", () => {
      verificarVersiculoFavorito(versiculo?.id);
    });
  }, [versiculo?.id]);

  useEffect(() => {
    if (!userId) return;

    const fetchVersiculoDelDia = async () => {
      try {
        const versiculoDocRef = doc(
          db,
          `users/${userId}/versiculoDelDia/current`
        );
        const versiculoDoc = await getDoc(versiculoDocRef);

        if (versiculoDoc.exists()) {
          const data = versiculoDoc.data();
          const storedTimestamp = data.timestamp.toDate();
          const currentTime = new Date();
          const timeDifference = currentTime - storedTimestamp;

          if (timeDifference < 24 * 60 * 60 * 1000) {
            setVersiculo(data.versiculo);
            return;
          }
        }

        const versiculosVistosRef = collection(
          db,
          `users/${userId}/versiculosVistos`
        );
        const vistosSnapshot = await getDocs(versiculosVistosRef);
        const vistos = vistosSnapshot.docs.map((doc) => doc.id);

        const versiculosRef = collection(db, "versiculosDiarios");
        const q =
          vistos.length > 0
            ? query(
                versiculosRef,
                where("__name__", "not-in", vistos),
                limit(1)
              )
            : query(versiculosRef, limit(1));
        const snapshot = await getDocs(q);

        if (!snapshot.empty) {
          const nuevoVersiculo = snapshot.docs[0];
          const data = { id: nuevoVersiculo.id, ...nuevoVersiculo.data() };
          setVersiculo(data);

          const vistoDocRef = doc(
            db,
            `users/${userId}/versiculosVistos`,
            nuevoVersiculo.id
          );
          await setDoc(vistoDocRef, { timestamp: serverTimestamp() });

          await setDoc(versiculoDocRef, {
            versiculo: data,
            timestamp: serverTimestamp(),
          });
        } else {
          console.log("No hay más versículos disponibles.");
        }
      } catch (error) {
        console.error("Error obteniendo los versículos diarios:", error);
      }
    };

    fetchVersiculoDelDia();
  }, [userId]);

  const copiar = async () => {
    const textoCompleto = `${versiculo.texto} \n\n ${versiculo.versiculo}`;
    await Clipboard.setStringAsync(textoCompleto);
    Alert.alert("Texto copiado", "El texto se ha copiado al portapapeles.");
  };

  const share = async () => {
    try {
      await Share.share({
        message: `${versiculo?.texto} - ${versiculo?.versiculo}`,
      });
    } catch (error) {
      console.error("Error al compartir:", error.message);
    }
  };

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

  return (
    <View style={styles.container}>
      <View style={styles.card} >
        <Text style={styles.reference}>{versiculo?.versiculo}</Text>
        <View style={styles.content}>
          <Text style={styles.text}>{versiculo?.texto}</Text>
          <Image
            source={require("../../assets/images/jesus.jpg")}
            style={styles.image}
            resizeMode="cover"
          />
        </View>
      <View style={styles.divider} />
      <View style={styles.actionsContainer}>
        <Pressable style={styles.actionButton} onPress={copiar}>
          <Feather name="copy" size={24} color="gray" />
          <Text style={styles.actionText}>Copiar</Text>
        </Pressable>
        <Pressable style={styles.actionButton} onPress={share}>
          <Feather name="share-2" size={24} color="gray" />
          <Text style={styles.actionText}>Compartir</Text>
        </Pressable>
        <Pressable style={styles.actionButton} onPress={guardar}>
          <AntDesign
            name={versiculoGuardado ? "heart" : "hearto"}
            size={24}
            color={versiculoGuardado ? "red" : "gray"}
          />
          <Text style={styles.actionText}>Guardar</Text>
        </Pressable>
      </View>
      </View>
      
      
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8f8f8", padding: 5 },
  card: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  reference: { fontSize: 18, textAlign: "right", marginBottom: 8 },
  content: { flexDirection: "row", alignItems: "center" },
  text: { flex: 1, fontSize: 20, marginRight: 8 },
  image: { width: 80, height: 80, borderRadius: 40 },
  divider: { height: 0.5, backgroundColor: "#ccc", marginVertical: 16 },
  actionsContainer: { flexDirection: "row", justifyContent: "flex-start",gap: 16 },
  actionButton: { alignItems: "center" },
  actionText: { color: "gray", marginTop: 4 },
});

export default VersiculosDiarios;
