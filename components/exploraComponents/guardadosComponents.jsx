import {
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { AntDesign, FontAwesome5 } from "@expo/vector-icons";
import { useNavigation } from "expo-router";

export default function GuardadosComponents() {
  const navigation = useNavigation();
  const { width } = Dimensions.get("window");
  const cardWidth = width * 0.43;

  return (
    <View >
      <Text style={styles.title}>Guardados</Text>
      
      <View style={styles.cardsContainer}>
        <TouchableOpacity
          onPress={() => navigation.navigate("versiculosFavoritos")}
          activeOpacity={0.9}
        >
          <LinearGradient
            colors={["#FF7E1F", "#FEB27B"]}
            style={[styles.card, { width: cardWidth }]}
          >
            <View style={styles.iconContainer}>
              <FontAwesome5 name="book" size={24} color="white" />
            </View>
            <Text style={styles.cardTitle}>Versículos Guardados</Text>
            <AntDesign
              name="arrowright"
              size={20}
              color="white"
              style={styles.arrow}
            />
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => navigation.navigate("lecturasVistas")}
          activeOpacity={0.9}
        >
          <LinearGradient
            colors={["#6A65FB", "#8C9EFF"]}
            style={[styles.card, { width: cardWidth }]}
          >
            <View style={styles.iconContainer}>
              <FontAwesome5 name="book-open" size={24} color="white" />
            </View>
            <Text style={styles.cardTitle}>Lecturas Recientes</Text>
            <AntDesign
              name="arrowright"
              size={20}
              color="white"
              style={styles.arrow}
            />
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
 
  title: {
    color: "white",
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 15,
    fontFamily: "Inter-Bold",
  },
  cardsContainer: {
    flexDirection: "row",
    
    gap: 15,
  },
  card: {
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.5)",
    padding: 20,
    aspectRatio: 1,
    justifyContent: "space-between",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  iconContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 15,
  },
  cardTitle: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
    lineHeight: 24,
    fontFamily: "Inter-SemiBold",
  },
  arrow: {
    alignSelf: "flex-end",
    marginTop: 10,
  },
});