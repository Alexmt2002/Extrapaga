import Button from "@/components/boton";
import { Colors } from "@/constants/theme";
import { useRouter } from "expo-router";
import React from "react";
import { Image, StyleSheet, Text, View, useWindowDimensions } from "react-native";

export default function CrearCuenta() {
    const { width } = useWindowDimensions();
    const isMobile = width < 600;
    const router = useRouter();

    return (
        <View style={styles.container}>


            <View style={[styles.content, { width: isMobile ? '90%' : '50%' }]}>

                <Image source={require('../assets/images/ImagenLogo.png')} style={styles.logo} />


                <Text style={styles.title}>SELECCIONAR PERFIL</Text>

                <Button
                    title="Padre"
                    style={styles.bottom}
                    onPress={() => console.log('Padre')}
                />

                <Button
                    title="Hijo"
                    style={styles.bottom}
                    onPress={() => console.log('Hijo')}
                />

            </View>

        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
    },

    content: {
        alignItems: 'center',
        maxWidth: 400,
    },

    title: {
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 40,
        textAlign: 'center',
        color: Colors.light.text2
    },
    logo: {
        width: 300,
        height: 300,
        resizeMode: 'contain',

    },
    bottom: {
        backgroundColor: Colors.light.button,
        marginBottom: 20
    }
});