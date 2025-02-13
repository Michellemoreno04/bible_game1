import React, { useRef } from 'react';
import { View, Text, SafeAreaView, StyleSheet, TouchableOpacity, Dimensions, ScrollView, Animated } from 'react-native';
import LottieView from 'lottie-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';

const WelcomeScreen = () => {
  const navigation = useNavigation();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const buttonScale = useRef(new Animated.Value(1)).current;

  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  const features = [
    { icon: '📖', title: 'Planes Estructurados', desc: 'Seguimiento progresivo de estudios bíblicos' },
    { icon: '✝️', title: 'Análisis Profundo', desc: 'Desglose detallado de versículos clave' },
    { icon: '🕊️', title: 'Devocionales', desc: 'Crea reflexiones personalizadas' },
    { icon: '🎓', title: 'Cuestionarios', desc: 'Refuerza tu aprendizaje interactivo' },
  ];

  const handlePressIn = () => {
    Animated.spring(buttonScale, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(buttonScale, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  return (
    <LinearGradient
      colors={['#f8fbff', '#e1f3ff']}
      style={styles.container}
    >
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={{ opacity: fadeAnim }}>
          <LottieView
            source={require('../assets/lottieFiles/greeting.json')}
            autoPlay
            loop
            style={styles.animation}
          />
        </Animated.View>

        <Animated.View style={{ opacity: fadeAnim }}>
          <Text style={styles.title}>Sumérgete en las Escrituras</Text>
          <Text style={styles.subtitle}>
            Tu camino hacia una comprensión más profunda de la Palabra de Dios
          </Text>
        </Animated.View>

        <View style={styles.divider} />

        <View style={styles.featuresContainer}>
          {features.map((item, index) => (
            <Animated.View 
              key={index} 
              style={[styles.featureCard, { 
                opacity: fadeAnim,
                transform: [{
                  translateY: fadeAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [50, 0]
                  })
                }]
              }]}
            >
              <View style={styles.iconContainer}>
                <Text style={styles.featureIcon}>{item.icon}</Text>
              </View>
              <Text style={styles.featureTitle}>{item.title}</Text>
              <Text style={styles.featureDesc}>{item.desc}</Text>
            </Animated.View>
          ))}
        </View>

        <Animated.View 
          style={{ 
            transform: [{ scale: buttonScale }],
            opacity: fadeAnim
          }}
        >
          <TouchableOpacity 
            onPress={() => navigation.navigate('(tabs)')}
            activeOpacity={0.9}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
          >
            <LinearGradient
              colors={['#5D9DE6', '#3B71C3']}
              style={styles.button}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text style={styles.buttonText}>Empezar Ahora</Text>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>

        <Text style={styles.footerText}>Únete a miles de creyentes en esta jornada espiritual</Text>
      </ScrollView>
    </LinearGradient>
  );
};

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 25,
    paddingTop: height * 0.02,
  },
  animation: {
    width: width * 0.9,
    height: 280,
    alignSelf: 'center',
    marginBottom: 10,
  },
  title: {
    fontSize: 34,
    fontWeight: '800',
    color: '#1A3E5A',
    textAlign: 'center',
    fontFamily: 'Poppins-Bold',
    lineHeight: 40,
    marginBottom: 15,
    textShadowColor: 'rgba(26, 62, 90, 0.1)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  subtitle: {
    fontSize: 18,
    color: '#5A7C95',
    textAlign: 'center',
    marginBottom: 30,
    fontFamily: 'Poppins-Medium',
    lineHeight: 26,
    paddingHorizontal: 20,
  },
  divider: {
    height: 3,
    width: 60,
    backgroundColor: '#5D9DE6',
    alignSelf: 'center',
    marginBottom: 35,
    borderRadius: 5,
  },
  featuresContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  featureCard: {
    width: '48%',
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    marginBottom: 15,
    shadowColor: '#3B71C3',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 5,
    alignItems: 'center',
  },
  iconContainer: {
    backgroundColor: '#EFF6FF',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  featureIcon: {
    fontSize: 30,
  },
  featureTitle: {
    fontSize: 17,
    color: '#1A3E5A',
    fontFamily: 'Poppins-SemiBold',
    marginBottom: 8,
    textAlign: 'center',
  },
  featureDesc: {
    fontSize: 14,
    color: '#6A889C',
    fontFamily: 'Poppins-Regular',
    lineHeight: 20,
    textAlign: 'center',
  },
  button: {
    paddingVertical: 20,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#1A5F97',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    marginHorizontal: 20,
  },
  buttonText: {
    color: 'white',
    fontSize: 19,
    fontFamily: 'Poppins-Bold',
    letterSpacing: 0.8,
    includeFontPadding: false,
  },
  footerText: {
    fontSize: 13,
    color: '#8FA8B7',
    textAlign: 'center',
    marginTop: 25,
    marginBottom: 20,
    fontFamily: 'Poppins-Italic',
  },
});

export default WelcomeScreen;