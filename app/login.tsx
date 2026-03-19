import Button from '@/components/boton';
import React from 'react';
import {
    Image,
    StyleSheet,
    Text,
    TextInput,
    useWindowDimensions,
    View
} from 'react-native';

export default function Login() {
    const { width } = useWindowDimensions();
    const isMobile = width < 600;

    return (
        <View style={styles.container}>

            <View style={[styles.card, { width: isMobile ? '90%' : '50%' }]}>

                <Image source={require('../assets/images/ImagenLogo.png')} style={styles.logo} />
                <Text style={styles.title}>Inicio de Sesión</Text>

                <TextInput
                    style={styles.input}
                    placeholder="Usuario"
                />

                <TextInput
                    style={styles.input}
                    placeholder="Contraseña"
                    secureTextEntry
                />

                <Text style={styles.forgotText}>
                    Recuperar contraseña
                </Text>

            </View>

            <View style={styles.bottomContainer}>
                <Button
                    title="Crear cuenta"
                    onPress={() => console.log('click')}
                />
            </View>

        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'space-between', // separa arriba y abajo
        alignItems: 'center',
        backgroundColor: '#fff',
        paddingVertical: 40,
    },

    card: {
        alignItems: 'center',
        maxWidth: 400,
    },

    title: {
        fontSize: 32,
        fontWeight: 'bold',
        marginBottom: 40,
    },

    input: {
        width: '100%',
        height: 50,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 10,
        marginBottom: 20,
        paddingHorizontal: 10,
    },

    forgotText: {
        alignSelf: 'flex-end',
        color: '#007BFF',
        marginTop: -10,
    },

    bottomContainer: {
        width: '100%',
        alignItems: 'center',
    },
    logo: {
        width: 200,
        height: 200,
        resizeMode: 'contain',
    }
});