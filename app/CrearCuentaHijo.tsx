import Button from "@/components/boton";
import { Colors } from "@/constants/theme";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "@/services/firebase";
import {
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    useWindowDimensions,
    View
} from "react-native";
import { DatePickerModal } from 'react-native-paper-dates';

export default function CrearCuentaHijo() {
    const router = useRouter();
    const { width } = useWindowDimensions();
    const isMobile = width < 600;
    const [username, setUsername] = useState("");
    const [nombreCompleto, setNombreCompleto] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [repeatPassword, setRepeatPassword] = useState("");
    const [open, setOpen] = React.useState(false);
    const [fecha, setFecha] = useState<Date | undefined>(new Date());

    const onConfirm = (params: any) => {
        setOpen(false);
        setFecha(params.date);
    };

    return (
        <View style={styles.container}>

            <View style={[styles.content, { width: isMobile ? '90%' : '50%' }]}>

                <Text style={styles.title}>DATOS HIJO</Text>

                {/* 👤 Username */}
                <TextInput
                    style={styles.input}
                    placeholder="Nombre de usuario"
                    value={username}
                    onChangeText={setUsername}
                />

                {/* 🧑 Nombre completo */}
                <TextInput
                    style={styles.input}
                    placeholder="Nombre completo"
                    value={nombreCompleto}
                    onChangeText={setNombreCompleto}
                />

                {/* 📅 Fecha */}
                {/* 📅 Fecha */}
                <TouchableOpacity
                    style={styles.input}
                    onPress={() => setOpen(true)}
                >
                    <Text>
                        {fecha
                            ? fecha.toLocaleDateString()
                            : "Seleccionar fecha de nacimiento"}
                    </Text>
                </TouchableOpacity>

                <DatePickerModal
                    locale="es"
                    mode="single"
                    visible={open}
                    onDismiss={() => setOpen(false)}
                    date={fecha}
                    onConfirm={onConfirm}
                />

                {/* 📧 Email */}
                <TextInput
                    style={styles.input}
                    placeholder="Correo electrónico"
                    value={email}
                    onChangeText={setEmail}
                />

                {/* 🔒 Contraseña */}
                <TextInput
                    style={styles.input}
                    placeholder="Contraseña"
                    secureTextEntry
                    value={password}
                    onChangeText={setPassword}
                />

                {/* 🔒 Repetir contraseña */}
                <TextInput
                    style={styles.input}
                    placeholder="Repetir contraseña"
                    secureTextEntry
                    value={repeatPassword}
                    onChangeText={setRepeatPassword}
                />

                {/* 🔽 Botón */}
                <Button
                    title="Crear"
                    style={{ marginTop: 20 }}
                    onPress={() => console.log("Crear cuenta hijo")}
                />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: "#fff",
    },

    content: {
        alignItems: 'center',
        maxWidth: 400,

    },

    title: {
        fontSize: 26,
        fontWeight: "bold",
        marginBottom: 30,
        textAlign: "center",
        color: Colors.light.text2
    },

    input: {
        width: "100%",
        height: 50,
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 10,
        marginBottom: 15,
        paddingHorizontal: 10,
        justifyContent: "center", // importante para TouchableOpacity
    },

    dateInput: {
        width: '95%',
        height: 30,
        borderRadius: 10,
        padding: 10,
        marginBottom: 15,
        borderColor: '#ccc',
        borderWidth: 3,
    }
});