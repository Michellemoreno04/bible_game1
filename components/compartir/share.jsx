import React, { useRef, useEffect } from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Share, Alert, Animated, SafeAreaView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import LottieView from 'lottie-react-native';

const ShareButton = ({
  message = "¡Mira esta increíble app!",
  url = "https://tudominio.com",
}) => {


  // Función para compartir contenido
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

 

  return (
    <View style={styles.outerContainer}>
      <LinearGradient
        colors={['blue', '#6E8BFA']} 
        style={styles.cardContainer}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        
     

        <Text style={styles.titleText}>¡Comparte la App con tus amigos!</Text>
        
        {/* Descripción para invitar al usuario a compartir */}
        <Text style={styles.descriptionText}>
          Ayuda a tus amigos a descubrir esta aplicación increíble.
        </Text>

        <View  style={styles.lottieContainer}>
        <LottieView
          source={require('../../assets/lottieFiles/shareApp.json')}
          autoPlay
          loop
          style={styles.lottieStyle}
          resizeMode="contain"
        />

        {/* Botón animado para compartir */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={handleShare}
          style={styles.buttonTouchable}
        >
         
            
         
            <LinearGradient
              colors={['#4facfe', '#00f2fe']}
              style={styles.buttonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              
             
                <Animated.View
                  style={
                    styles.iconContainer
                    }
                >
                  <Icon name="share" size={30} color="#fff" />
                </Animated.View>
            
              <Text style={styles.buttonText}>Compartir</Text>
            </LinearGradient>
          
        </TouchableOpacity>
        </View>
      </LinearGradient>
    </View>
   
  );
};

const styles = StyleSheet.create({
  // Contenedor externo para centrar la tarjeta en la pantalla
  outerContainer: {
   marginTop: 10,
    backgroundColor: '#f0f0f0', // Fondo neutro para resaltar la tarjeta
  },
  cardContainer: {
    width: '100%',
    height: 200,
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
    
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 5,
  },
  lottieContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
    bottom: 50, 
    right: 30, 
  },
  lottieStyle: {
    width: 200,
    height: 200,
    
  },
  titleText: {
    textAlign: 'center',
    fontSize: 22,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 10,
  },
  descriptionText: {
    fontSize: 16,
    color: 'white',
  
    
  },
  // Contenedor para centrar el botón
  buttonTouchable: {
   width: 200,
  position: 'relative',
  right: 30,
  },
  
  // Estilo interno del botón con degradado
  buttonGradient: {
    borderRadius: 25,
    paddingVertical: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Texto del botón
  buttonText: {
    color: '#fff',
    fontSize: 18,
    marginLeft: 10,
    fontWeight: '600',
  },
});

export default ShareButton;
