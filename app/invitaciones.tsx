
import { useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import * as Clipboard from "expo-clipboard";
import { router } from "expo-router";

import { generarCodigoInvitacion } from "@/services/familyService";
import { useAlerta } from "@/components/AlertaPersonalizada";

export default function Invitaciones() {
  const [codigo, setCodigo] = useState("");
  const [cargando, setCargando] = useState(false);

  const { mostrarAlerta, alerta } = useAlerta();

  const generarCodigo = async () => {
    if (cargando) return;

    setCargando(true);

    try {
      const nuevoCodigo = await generarCodigoInvitacion();
      setCodigo(nuevoCodigo);
    } catch (error) {
      mostrarAlerta(
        "Error",
        error instanceof Error
          ? error.message
          : "No se ha podido generar el código."
      );
    } finally {
      setCargando(false);
    }
  };

  const copiarCodigo = async () => {
    await Clipboard.setStringAsync(codigo);

    mostrarAlerta(
      "Código copiado",
      "Ya puedes compartirlo con tu familia."
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>
        INVITAR MIEMBROS
      </Text>

      <Text style={styles.descripcion}>
        Genera un código para que otros padres
        o hijos soliciten unirse a tu familia.
      </Text>

      {codigo !== "" && (
        <View style={styles.tarjeta}>
          <Text selectable style={styles.codigo}>
            {codigo}
          </Text>

          <Text style={styles.aviso}>
            Este código caduca dentro de 7 días.
          </Text>

          <TouchableOpacity
            style={styles.boton}
            onPress={copiarCodigo}
          >
            <Text style={styles.textoBoton}>
              Copiar código
            </Text>
          </TouchableOpacity>
        </View>
      )}

      <TouchableOpacity
        style={styles.boton}
        disabled={cargando}
        onPress={generarCodigo}
      >
        {cargando ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.textoBoton}>
            Generar código de invitación
          </Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.back()}>
        <Text style={styles.enlace}>Volver</Text>
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
    backgroundColor: "#fff",
    padding: 20,
  },
  titulo: {
    fontSize: 25,
    fontWeight: "bold",
    color: "#2E7D32",
    marginBottom: 15,
  },
  descripcion: {
    fontSize: 16,
    textAlign: "center",
    color: "#666",
    marginBottom: 25,
    maxWidth: 400,
  },
  tarjeta: {
    width: "100%",
    maxWidth: 400,
    backgroundColor: "#E8F5E9",
    padding: 20,
    borderRadius: 15,
    alignItems: "center",
    marginBottom: 20,
  },
  codigo: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#2E7D32",
    textAlign: "center",
    marginBottom: 12,
  },
  aviso: {
    color: "#666",
    marginBottom: 15,
  },
  boton: {
    backgroundColor: "#5EC287",
    padding: 15,
    borderRadius: 10,
    width: "100%",
    maxWidth: 350,
    alignItems: "center",
    marginBottom: 12,
  },
  textoBoton: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  enlace: {
    color: "#2E7D32",
    marginTop: 15,
    textDecorationLine: "underline",
  },
});
