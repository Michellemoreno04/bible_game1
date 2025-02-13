import { View, Text, Pressable, StyleSheet } from 'react-native'
import React, { useState } from 'react'
import { AntDesign, FontAwesome6 } from '@expo/vector-icons'
/*import {
  GoogleSignin,
  GoogleSigninButton,
  isSuccessResponse,
  statusCodes,
} from '@react-native-google-signin/google-signin';
import { useNavigation } from 'expo-router';
import { auth } from '../firebase/firebaseConfig';
import { signInWithEmailAndPassword,createUserWithEmailAndPassword } from 'firebase/auth';
GoogleSignin.configure({
  webClientId: '1001847642825-lvmjoh7ioi2g8phb6l54slksvuck2nb4.apps.googleusercontent.com', // client ID of type WEB for your server. Required to get the `idToken` on the user object, and for offline access.
  scopes: ['https://www.googleapis.com/auth/drive.readonly'], // what API you want to access on behalf of the user, default is email and profile
  offlineAccess: true, // if you want to access Google API on behalf of the user FROM YOUR SERVER
  forceCodeForRefreshToken: true, // [Android] related to `serverAuthCode`, read the docs link below *.
  //iosClientId: '<FROM DEVELOPER CONSOLE>', // [iOS] if you want to specify the client ID of type iOS (otherwise, it is taken from GoogleService-Info.plist)
  //androidClientId: '485048382200-8amj34c71d7jq5ug18d9s13keruuvhsq.apps.googleusercontent.com', // [Android] if you want to specify the client ID of type Android, you must update GoogleService-Info.xml
});*/

export function SigninComponents() {
 // const navigation = useNavigation();
const [state, setState] = useState({ userInfo: null });

       
  // Somewhere in your code
/*const signIn = async () => {
    
    try {
      await GoogleSignin.hasPlayServices();
      const response = await GoogleSignin.signIn();
      if (isSuccessResponse(response)) {
        setState({ userInfo: response.data });
        console.log('user logged in successfully', response.uid);
        
        navigation.navigate("(tabs)");
        
      } else {
        // sign in was cancelled by user
        console.log('sign in was cancelled by user');
      }
    } catch (error) {
      console.log('el error es:', error)
      if (isErrorWithCode(error)) {
        switch (error.code) {
          case statusCodes.IN_PROGRESS:
            // operation (eg. sign in) already in progress
        
            break;
          case statusCodes.PLAY_SERVICES_NOT_AVAILABLE:
            // Android only, play services not available or outdated
            break;
          default:
          // some other error happened
        }
      } else {
        // an error that's not related to google sign in occurred
      }
    }
  };*/
  
  return (
     <View style={styles.container}>
              <Pressable className='w-full-white p-5 bg-white rounded-full'>
                
                    <AntDesign name="google" size={24} color="black" />
                </Pressable>
       <Pressable className='w-full-white p-5 bg-white rounded-full'>
       <FontAwesome6 name="facebook" size={24} color="black" />
                </Pressable>
       <Pressable className='w-full-white p-5 bg-white rounded-full'>
                    <AntDesign name="apple1" size={24} color="black" />
                </Pressable>
       </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
    marginTop: 20,
  },
})