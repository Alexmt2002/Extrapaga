import { useAlerta } from "@/components/AlertaPersonalizada";
import Button from "@/components/boton";
import { Colors } from "@/constants/theme";
import { loginUser } from "@/services/authService";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Image,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from "react-native";

export default function Login() {
  const { width } = useWindowDimensions();
  const isMobile = width < 600;
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { mostrarAlerta, alerta } = useAlerta();

  const logearte = async () => {
    if (!email.trim() || !password) {
      mostrarAlerta("Campos obligatorios", "Introduce tu Gmail y contraseña.");
      return;
    }

    try {
      await loginUser({ email, password });
      mostrarAlerta("Felicidades", "Has iniciado sesión correctamente.");
      router.replace("/perfil");
    } catch (error) {
      mostrarAlerta(
        "No se pudo iniciar sesión",
        error instanceof Error
          ? error.message
          : "Inténtalo de nuevo más tarde.",
      );
    }
  };

  return (
    <View style={styles.container}>
      <View style={[styles.card, { width: isMobile ? "90%" : "50%" }]}>
        <Image
          source={require("../assets/images/ImagenLogo.png")}
          style={styles.logo}
        />
        <Text style={styles.title}>INICIO DE SESIÓN</Text>

        <TextInput
          style={styles.input}
          placeholder="Gmail"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
        />

        <TextInput
          style={styles.input}
          placeholder="Contraseña"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        <Text style={styles.forgotText}>Recuperar contraseña</Text>

        <View style={styles.bottomContainer}>
          <Button
            style={styles.bottom}
            title="Iniciar sesión"
            onPress={logearte}
          />
        </View>

        <View style={[styles.bottomContainer, styles.bottomContainersecond]}>
          <Button
            style={styles.bottom}
            title="Crear cuenta"
            onPress={() => router.push("/CrearCuenta")}
          />
        </View>
      </View>
      {alerta}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "space-between", // separa arriba y abajo
    alignItems: "center",
    backgroundColor: "#fff",
    paddingVertical: 40,
  },

  card: {
    alignItems: "center",
    maxWidth: 400,
  },

  title: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 40,
    color: Colors.light.text2,
  },

  input: {
    width: "91%",
    height: 50,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    marginBottom: 20,
    paddingHorizontal: 10,
  },

  forgotText: {
    alignSelf: "flex-end",
    color: Colors.light.text2,
    marginTop: -10,
  },

  bottomContainer: {
    width: "100%",
    alignItems: "center",
    marginTop: 20,
  },
  bottomContainersecond: {
    marginTop: "40%",
  },
  bottom: {
    backgroundColor: Colors.light.button,
  },
  logo: {
    width: 180,
    height: 180,
    resizeMode: "contain",
  },
});
