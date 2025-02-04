import React, { useRef, useEffect } from 'react';
import { View, TouchableWithoutFeedback, Text, StyleSheet, Share, Alert, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import LottieView from 'lottie-react-native';

const ShareButton = ({
  message = "¡Mira esta increíble app!",
  url = "https://tudominio.com",
}) => {
  // Valor para animación al presionar
  const scaleValue = useRef(new Animated.Value(1)).current;
  // Valor para animación de latido
  const heartbeat = useRef(new Animated.Value(1)).current;

  // Animación de latido (heartbeat) en bucle
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(heartbeat, {
          toValue: 1.1, // Escala máxima del latido
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(heartbeat, {
          toValue: 1, // Vuelve a la escala original
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [heartbeat]);

  const handleShare = async () => {
    try {
      await Share.share({
        message: `${message}\n${url}`,
        url: url,
      });
    } catch (error) {
      Alert.alert('Error', 'No se pudo compartir la aplicación');
    }
  };

  // Animación al presionar el botón
  const animatePressIn = () => {
    Animated.timing(scaleValue, {
      toValue: 1.30,
      duration: 100,
      useNativeDriver: true,
    }).start();
  };

  const animatePressOut = () => {
    Animated.timing(scaleValue, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start();
  };

  return (
    <LinearGradient
            colors={['blue', '#6E8BFA']}
            style={styles.gradientConainer}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
    <View style={styles.container}>
      <Text style={styles.promptText}>
        ¡Comparte esta app con tus amigos y ayuda a tu progimo a estudiar la Biblia!
      </Text>
     <View style={styles.lottieContainer}>
     <LottieView 
        source={require('../../assets/lottieFiles/shareApp.json')}
        autoPlay
        loop
        style={{ width: 200, height: 200 }}
      />
      
      <TouchableWithoutFeedback
        onPressIn={animatePressIn}
        onPressOut={animatePressOut}
        onPress={handleShare}
      >
        {/* Aquí combinamos la animación del botón y el latido */}
        <Animated.View
          style={[
            styles.buttonContainer,
            { transform: [{ scale: Animated.multiply(scaleValue, heartbeat) }] },
          ]}
        >
          <LinearGradient
            colors={['#6E8BFA', '#4FACFE']}
            style={styles.gradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            {/* Ícono sin animación individual */}
            <Icon name="share-variant" size={28} color="white" />
            <Text style={styles.buttonText}>Compartir</Text>
          </LinearGradient>
        </Animated.View>
      </TouchableWithoutFeedback>
     </View>
    </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradientConainer: {
    height:200,
    flexDirection: 'column',
    alignItems: 'center',
    
    borderRadius: 10,
    marginVertical: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  container: {
    alignItems: 'center',
    padding: 20,
    
    borderRadius: 10,
    margin: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  promptText: {
    fontSize: 16,
    color: 'white',
    textAlign: 'center',
    
    lineHeight: 24,
    paddingHorizontal: 20,
    fontStyle: 'italic',
  },
  buttonContainer: {
    borderRadius: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
    position: 'relative',
    right: 10,
    
  },
  gradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 35,
    borderRadius: 30,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 12,
    letterSpacing: 0.5,
  },
  lottieContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: 40,
    position: 'relative',
    bottom: 40,
  },
});

export default ShareButton;
