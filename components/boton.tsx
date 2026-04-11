import React from 'react';
import { StyleSheet, Text, TextStyle, TouchableOpacity, ViewStyle } from 'react-native';

type Props = {
    title: string;
    onPress?: () => void;
    style?: ViewStyle;       // para modificar el botón
    textStyle?: TextStyle;   // para modificar el texto
};

export default function Button({ title, onPress, style, textStyle }: Props) {
    return (
        <TouchableOpacity
            style={[styles.button, style]} // 🔥 combinación de estilos
            onPress={onPress}
        >
            <Text style={[styles.buttonText, textStyle]}>
                {title}
            </Text>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    button: {
        width: '90%',
        maxWidth: 370,
        height: 50,
        backgroundColor: '#5ec287ff',
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },

    buttonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
});