import { router } from "expo-router";
import { useState } from "react";
import {
    ActivityIndicator,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

import { useAlerta } from "@/components/AlertaPersonalizada";
import { enviarVerificacion } from "@/services/authService";
import { auth } from "@/services/firebase";
import { reload, signOut } from "firebase/auth";

export default function VerificarCorreo() {
  const [cargando, setCargando] = useState(false);
  const { mostrarAlerta, alerta } = useAlerta();

  const comprobarCorreo = async () => {
    const user = auth.currentUser;

    if (!user) {
      router.replace("/login");
      return;
    }

    setCargando(true);

    try {
      await reload(user);

      if (user.emailVerified) {
        mostrarAlerta(
          "Correo verificado",
          "Tu correo se ha verificado correctamente.",
        );

        router.replace("/perfil");
      } else {
        mostrarAlerta(
          "Correo sin verificar",
          "Abre el enlace que hemos enviado a tu correo.",
        );
      }
    } catch (error) {
      mostrarAlerta("Error", "No se ha podido comprobar la verificación.");
    } finally {
      setCargando(false);
    }
  };

  const reenviarCorreo = async () => {
    setCargando(true);

    try {
      await enviarVerificacion();

      mostrarAlerta("Correo enviado", "Revisa tu bandeja de entrada y spam.");
    } catch (error) {
      mostrarAlerta(
        "Error",
        "No se pudo reenviar el correo. Inténtalo más tarde.",
      );
    } finally {
      setCargando(false);
    }
  };

  const volverLogin = async () => {
    await signOut(auth);
    router.replace("/login");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.icono}>✉️</Text>

      <Text style={styles.titulo}>VERIFICA TU CORREO</Text>

      <Text style={styles.descripcion}>
        Hemos intentado enviar un enlace de verificación a:
      </Text>

      <Text style={styles.email}>{auth.currentUser?.email}</Text>

      <Text style={styles.descripcion}>
        Abre el enlace de tu correo y vuelve aquí para comprobar que tu cuenta
        está verificada.
      </Text>

      {cargando && <ActivityIndicator size="large" color="#5EC287" />}

      <TouchableOpacity
        style={styles.boton}
        disabled={cargando}
        onPress={comprobarCorreo}
      >
        <Text style={styles.textoBoton}>Ya he verificado mi correo</Text>
      </TouchableOpacity>

      <TouchableOpacity disabled={cargando} onPress={reenviarCorreo}>
        <Text style={styles.enlace}>Reenviar correo de verificación</Text>
      </TouchableOpacity>

      <TouchableOpacity disabled={cargando} onPress={volverLogin}>
        <Text style={styles.enlace}>Volver al inicio de sesión</Text>
      </TouchableOpacity>

      {alerta}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 25,
    backgroundColor: "#fff",
  },
  icono: {
    fontSize: 65,
    marginBottom: 20,
  },
  titulo: {
    fontSize: 25,
    fontWeight: "bold",
    color: "#2E7D32",
    marginBottom: 20,
    textAlign: "center",
  },
  descripcion: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 15,
    lineHeight: 24,
    color: "#555",
    maxWidth: 400,
  },
  email: {
    fontSize: 17,
    fontWeight: "bold",
    color: "#2E7D32",
    marginBottom: 20,
    textAlign: "center",
  },
  boton: {
    backgroundColor: "#5EC287",
    padding: 15,
    borderRadius: 10,
    width: "100%",
    maxWidth: 350,
    alignItems: "center",
    marginTop: 20,
  },
  textoBoton: {
    fontSize: 16,
    color: "#fff",
    fontWeight: "bold",
  },
  enlace: {
    fontSize: 15,
    color: "#2E7D32",
    marginTop: 25,
    textDecorationLine: "underline",
    textAlign: "center",
  },
});
