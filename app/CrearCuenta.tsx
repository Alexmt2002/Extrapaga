import Button from "@/components/boton";
import React from "react";
import { StyleSheet, Text, View, useWindowDimensions } from "react-native";

export default function CrearCuenta() {
    const { width } = useWindowDimensions();
    const isMobile = width < 600;

    return (
        <View style={styles.container}>


            <View style={[styles.content, { width: isMobile ? '90%' : '50%' }]}>


                <Text style={styles.title}>Seleccionar Perfil</Text>

                <Button
                    title="Padre"
                    style={{ marginBottom: 20 }}
                    onPress={() => console.log('Padre')}
                />

                <Button
                    title="Hijo"
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
    },
});