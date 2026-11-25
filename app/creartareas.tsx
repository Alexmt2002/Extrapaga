
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { router } from "expo-router";

import {
  crearTarea,
  obtenerHijosFamilia,
  type HijoAsignable,
} from "@/services/taskService";

export default function CrearTareas() {
  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [recompensa, setRecompensa] = useState("");

  const [hijos, setHijos] = useState<HijoAsignable[]>([]);
  const [hijoSeleccionado, setHijoSeleccionado] = useState("");

  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const cargar = async () => {
      try {
        const resultado = await obtenerHijosFamilia();
        setHijos(resultado);
      } catch (e) {
        setError(
          e instanceof Error ? e.message : "No se pudieron cargar los hijos."
        );
      } finally {
        setCargando(false);
      }
    };

    cargar();
  }, []);

  const guardarTarea = async () => {
    if (guardando) return;

    setError("");

    if (!titulo.trim()) {
      setError("Introduce el título de la tarea.");
      return;
    }

    if (!hijoSeleccionado) {
      setError("Selecciona a quién asignar la tarea.");
      return;
    }

    // Aceptamos, por ejemplo, 2,50 o 2.50
    const texto = recompensa.trim().replace(",", ".");

    if (!/^\d+(\.\d{1,2})?$/.test(texto)) {
      setError("Introduce una recompensa válida, por ejemplo 2,50.");
      return;
    }

    const [euros, centimos = ""] = texto.split(".");
    const recompensaCentimos =
      Number(euros) * 100 + Number(centimos.padEnd(2, "0"));

    setGuardando(true);

    try {
      await crearTarea({
        titulo,
        descripcion,
        assignedTo: hijoSeleccionado,
        recompensaCentimos,
      });

      router.replace("/tareas");
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "No se pudo crear la tarea."
      );
    } finally {
      setGuardando(false);
    }
  };

  if (cargando) {
    return (
      <View style={styles.centrado}>
        <ActivityIndicator size="large" color="#5EC287" />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contenido}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.titulo}>CREAR TAREA</Text>

      <Text style={styles.etiqueta}>Nombre de la tarea</Text>
      <TextInput
        style={styles.input}
        value={titulo}
        onChangeText={setTitulo}
        placeholder="Ej: Limpiar la habitación"
        maxLength={100}
      />

      <Text style={styles.etiqueta}>Descripción</Text>
      <TextInput
        style={[styles.input, styles.descripcion]}
        value={descripcion}
        onChangeText={setDescripcion}
        placeholder="¿Qué tiene que hacer?"
        multiline
        maxLength={1000}
      />

      <Text style={styles.etiqueta}>Recompensa (€)</Text>
      <TextInput
        style={styles.input}
        value={recompensa}
        onChangeText={setRecompensa}
        keyboardType="decimal-pad"
        placeholder="Ej: 2,50"
      />

      <Text style={styles.etiqueta}>Asignar a</Text>

      {hijos.length === 0 ? (
        <Text style={styles.aviso}>
          No tienes hijos asociados a tu familia.
        </Text>
      ) : (
        hijos.map((hijo) => (
          <TouchableOpacity
            key={hijo.uid}
            onPress={() => setHijoSeleccionado(hijo.uid)}
            style={[
              styles.tarjetaHijo,
              hijoSeleccionado === hijo.uid &&
                styles.tarjetaSeleccionada,
            ]}
          >
            <Text style={styles.avatar}>{hijo.avatar}</Text>
            <Text style={styles.nombreHijo}>{hijo.nombre}</Text>
            <Text style={styles.marca}>
              {hijoSeleccionado === hijo.uid ? "✓" : ""}
            </Text>
          </TouchableOpacity>
        ))
      )}

      {!!error && <Text style={styles.error}>{error}</Text>}

      <TouchableOpacity
        style={[
          styles.boton,
          (guardando || hijos.length === 0) &&
            styles.desactivado,
        ]}
        disabled={guardando || hijos.length === 0}
        onPress={guardarTarea}
      >
        {guardando ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.textoBoton}>Guardar tarea</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => router.back()}
        disabled={guardando}
      >
        <Text style={styles.volver}>Cancelar</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  centrado: {
    flex: 1, justifyContent: "center", alignItems: "center",
  },
  contenido: {
    padding: 24, paddingBottom: 50, alignItems: "center",
  },
  titulo: {
    fontSize: 25, fontWeight: "bold", color: "#2E7D32",
    marginBottom: 25,
  },
  etiqueta: {
    fontSize: 16, fontWeight: "600", color: "#333",
    alignSelf: "stretch", maxWidth: 400, marginBottom: 8,
  },
  input: {
    width: "100%", maxWidth: 400, borderWidth: 1,
    borderColor: "#C9D8CE", borderRadius: 10,
    padding: 13, fontSize: 16, marginBottom: 20,
  },
  descripcion: {
    minHeight: 100, textAlignVertical: "top",
  },
  tarjetaHijo: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: "#F5F9F6", borderRadius: 12,
    borderWidth: 2, borderColor: "transparent",
    padding: 12, marginBottom: 10, width: "100%", maxWidth: 400,
  },
  tarjetaSeleccionada: {
    backgroundColor: "#E8F5E9", borderColor: "#5EC287",
  },
  avatar: { fontSize: 28, marginRight: 12 },
  nombreHijo: { flex: 1, fontSize: 16, color: "#333" },
  marca: { fontSize: 22, color: "#2E7D32" },
  aviso: { color: "#777", marginVertical: 15 },
  error: { color: "#C0392B", marginVertical: 15, textAlign: "center" },
  boton: {
    backgroundColor: "#5EC287", borderRadius: 10,
    padding: 16, width: "100%", maxWidth: 400,
    alignItems: "center", marginTop: 20,
  },
  desactivado: { opacity: 0.5 },
  textoBoton: {
    color: "#fff", fontSize: 17, fontWeight: "bold",
  },
  volver: { color: "#2E7D32", marginTop: 25, fontSize: 16 },
});
