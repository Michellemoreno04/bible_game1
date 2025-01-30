import { View, Text, Pressable } from 'react-native'
import React, { useState,useEffect } from 'react'
import { AntDesign, FontAwesome6 } from '@expo/vector-icons'
//import { GoogleSignin } from "@react-native-google-signin/google-signin";
//import { useIdTokenAuthRequest as useGoogleIdTokenAuthRequest } from "expo-auth-session/providers/google";



export function SigninComponents() {
/*useEffect(() => {
    GoogleSignin.configure({
      // client ID that is on google-services.json / GoogleService-Info.plist
      webClientId:
        "4928746886-rssa8l1c26jl45m41nlu1k8nvr1le5ee.apps.googleusercontent.com",

      iosClientId:
        "4928746886-32ikg1kol2clnimjjmk1ek1eat2n385f.apps.googleusercontent.com",
      scopes: ["https://www.googleapis.com/auth/userinfo.profile"],
    });
  }, []);*/

  /* const [, googleResponse, promptAsyncGoogle] = useGoogleIdTokenAuthRequest({
      selectAccount: true,

     scopes: ["https://www.googleapis.com/auth/userinfo.profile"],
     androidClientId:'4928746886-v7b5nq4bic8hrgkvmer6hq2taojjjkku.apps.googleusercontent.com',
      iosClientId:'4928746886-32ikg1kol2clnimjjmk1ek1eat2n385f.apps.googleusercontent.com',
   });
    
      const handleGoogleLogin = async () => {
        console.log("Google login");
         await promptAsyncGoogle();
        await GoogleSignin.signIn()
          .then((response) => {
            console.log(response, "RESPONSEE");
          })
          .catch((error) => console.log(error));
      };*/
  return (
     <View className='w-full flex flex-row items-center justify-center gap-4 mt-5'>
              <Pressable
              // onPress={handleGoogleLogin}
              className='w-full-white p-5 bg-white rounded-full'>
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