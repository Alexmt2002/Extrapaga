import { useRouter } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import React, { useEffect } from 'react';
import { ActivityIndicator, Image, StyleSheet, View } from 'react-native';
import { auth } from '../services/firebase';

SplashScreen.preventAutoHideAsync();

export default function Splash() {
  const router = useRouter(); // me permite reddirigir a otra pantalla despues del splash

  useEffect(() => {
    const checkAuth = async () => {
      // Espera 2 segundos mínimo para mostrar splash
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Si hay usuario logueado, ir a home/tareas, si no, a login
      if (auth.currentUser) {
        router.replace('/tareas');
      } else {
        router.replace('/login');
      }

      await SplashScreen.hideAsync(); // cierra splash nativo
    };

    checkAuth();
  }, []);

  return (
    <View style={styles.container}>
      <Image source={require('../assets/images/ImagenLogo.png')} style={styles.logo} />
      <ActivityIndicator size="large" color="#000" style={{ marginTop: 20 }} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  logo: {
    width: 300,
    height: 300,
    resizeMode: 'contain',
  },
});