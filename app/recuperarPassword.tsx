import { recuperarPassword } from "@/services/authService";
import { router } from "expo-router";
import Button from "@/components/boton";
import { useState } from "react";
import {
    ActivityIndicator,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    useWindowDimensions,
    View,
} from "react-native";

export default function RecuperarPassword() {
  const { width } = useWindowDimensions();
  const isMobile = width < 600;
  const [email, setEmail] = useState("");
  const [cargando, setCargando] = useState(false);
  const [mensaje, setMensaje] = useState("");

  const enviarCorreo = async () => {
    if (cargando) return;

    setCargando(true);
    setMensaje("");

    try {
      await recuperarPassword(email);

      setMensaje(
        "Si existe una cuenta asociada a ese correo, recibirás un enlace para cambiar tu contraseña.",
      );
    } catch (error) {
      setMensaje(
        "No se ha podido procesar la solicitud. Comprueba el correo e inténtalo de nuevo.",
      );
    } finally {
      setCargando(false);
    }
  };

return (
  <View style={styles.container}>
    <View style={[styles.card, { width: isMobile ? "90%" : "50%" }]}>
      <Text style={styles.titulo}>Recuperar contraseña</Text>

      <Text style={styles.descripcion}>
        Introduce tu correo electrónico y te enviaremos un enlace para crear
        una contraseña nueva.
      </Text>

      <TextInput
        style={styles.input}
        placeholder="Correo electrónico"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
      />

      {mensaje !== "" && <Text style={styles.mensaje}>{mensaje}</Text>}

      <TouchableOpacity
        style={styles.boton}
        disabled={cargando}
        onPress={enviarCorreo}
      >
        {cargando ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.textoBoton}>Enviar correo</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.back()}>
        <Text style={styles.enlace}>Volver al inicio de sesión</Text>
      </TouchableOpacity>
    </View>
  </View>
);
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingVertical: 40,
  },

  card: {
    alignItems: "center",
    maxWidth: 400,
  },

  titulo: {
    fontSize: 26,
    fontWeight: "bold",
    textAlign: "center",
    color: "#2E7D32",
    marginBottom: 15,
  },

  descripcion: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 25,
    color: "#666",
  },

  input: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    height: 50,
    paddingHorizontal: 15,
    marginBottom: 20,
  },

  boton: {
    width: "100%",
    backgroundColor: "#5EC287",
    height: 50,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },

  textoBoton: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "bold",
  },

  mensaje: {
    textAlign: "center",
    marginBottom: 20,
    color: "#2E7D32",
  },

  enlace: {
    textAlign: "center",
    color: "#2E7D32",
    marginTop: 25,
    textDecorationLine: "underline",
  },
});