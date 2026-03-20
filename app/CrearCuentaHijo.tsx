import React from "react";
import { StyleSheet, Text, View } from "react-native";

export default function CrearCuentaPadre() {
    return (
        <View style={styles.container}>
            <Text>CrearCuentaPadre</Text>
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
});