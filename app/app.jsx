import { Text, View, StyleSheet, SafeAreaView, ScrollView, Alert } from 'react-native';
import '../global.css';

import React from 'react';



export default  function Home() {


  return (
    <View className="w-full h-full  flex items-center justify-center ">
    <Text className="text-3xl text-black">hello</Text>
    
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    width: '100%',
    height: '100%',
    padding: 20,
  },
  estudiaContainer: {
    borderRadius: 10,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
  },
  estudia: {
    width: 185,
    height: 185,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ff8a00',
    margin: 10,
  },
});
