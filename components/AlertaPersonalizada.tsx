
import { useState } from "react";
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

export const useAlerta = () => {
  const [visible, setVisible] = useState(false);
  const [titulo, setTitulo] = useState("");
  const [mensaje, setMensaje] = useState("");

  const mostrarAlerta = (nuevoTitulo: string, nuevoMensaje: string) => {
    setTitulo(nuevoTitulo);
    setMensaje(nuevoMensaje);
    setVisible(true);
  };

  const cerrarAlerta = () => {
    setVisible(false);
  };

  const alerta = (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={cerrarAlerta}
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        <View style={styles.contenedor}>
          <View style={styles.icono}>
            <Text style={styles.iconoTexto}>!</Text>
          </View>

          <Text style={styles.titulo}>{titulo}</Text>

          <Text style={styles.mensaje}>{mensaje}</Text>

          <Pressable
            style={({ pressed }) => [
              styles.boton,
              pressed && styles.botonPresionado,
            ]}
            onPress={cerrarAlerta}
          >
            <Text style={styles.textoBoton}>Entendido</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );

  return { mostrarAlerta, alerta };
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.50)",
    justifyContent: "center",
    alignItems: "center",
    padding: 25,
  },

  contenedor: {
    width: "100%",
    maxWidth: 380,
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    padding: 25,
    alignItems: "center",
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.20,
    shadowRadius: 15,
  },

  icono: {
    width: 55,
    height: 55,
    borderRadius: 28,
    backgroundColor: "#E8F5ED",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 18,
  },

  iconoTexto: {
    fontSize: 30,
    fontWeight: "bold",
    color: "#36A269",
  },

  titulo: {
    fontSize: 21,
    fontWeight: "700",
    color: "#202A35",
    textAlign: "center",
    marginBottom: 10,
  },

  mensaje: {
    fontSize: 15,
    color: "#697586",
    textAlign: "center",
    lineHeight: 23,
    marginBottom: 25,
  },

  boton: {
    width: "100%",
    backgroundColor: "#36A269",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },

  botonPresionado: {
    opacity: 0.8,
  },

  textoBoton: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
});
