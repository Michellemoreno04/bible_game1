import { AntDesign } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {View, Text, Button, StyleSheet, Pressable } from 'react-native';
import Modal from 'react-native-modal';


export default function NivelModal({userInfo,isVisible,onClose}) {




  return (
    <Modal
      animationType="slide"
      transparent={true}
      isVisible={isVisible}
     // onRequestClose={onClose}
     
    >
      

      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {/* Icono de celebración */}
          <AntDesign name="star" size={80} color="#FFD700" style={styles.icon} />
          
          {/* Título */}
          <Text style={styles.modalTitle}>¡Felicidades!</Text>
          
          {/* Mensaje */}
          <Text style={styles.modalText}>
            Has alcanzado el nivel <Text style={styles.highlight}>{userInfo}</Text> de
          </Text>
          <Text style={styles.insignia}>{'insignia'}</Text>

          {/* Botón de cerrar */}
          <Pressable style={styles.button} onPress={onClose} >
            <Text style={styles.buttonText}>¡Gracias!</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    width: '100%',
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
   // backgroundColor: 'rgba(0, 0, 0, 0.5)',
    
  },
  modalContent: {
    width: 320,
    padding: 25,
    backgroundColor: '#222831',
    borderRadius: 15,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 10,
  },
  confetti: {
    
    flex: 1,
  
  },
  icon: {
    marginBottom: 10,
  },
  modalTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFD700',
    textAlign: 'center',
    marginBottom: 10,
  },
  modalText: {
    fontSize: 18,
    color: '#EEEEEE',
    textAlign: 'center',
    marginBottom: 5,
  },
  highlight: {
    color: '#00ADB5',
    fontWeight: 'bold',
  },
  insignia: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFD700',
    textAlign: 'center',
    padding: 10,
  },
  image: {
    width: 100,
    height: 100,
    marginVertical: 15,
  },
  button: {
    backgroundColor: '#00ADB5',
    paddingVertical: 10,
    paddingHorizontal: 25,
    borderRadius: 25,
    
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
});