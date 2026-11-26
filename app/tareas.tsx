import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import {
  obtenerMisTareas,
  type ResultadoTareas,
  type Tarea,
} from "@/services/taskService";

export default function Tareas() {
  const [datos, setDatos] = useState<ResultadoTareas | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  const cargarTareas = useCallback(async () => {
    setCargando(true);
    setError("");

    try {
      const resultado = await obtenerMisTareas();
      setDatos(resultado);
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "No se pudieron cargar las tareas.",
      );
    } finally {
      setCargando(false);
    }
  }, []);

  // Se ejecuta al entrar o volver a esta pantalla
  useFocusEffect(
    useCallback(() => {
      cargarTareas();
    }, [cargarTareas]),
  );

  const renderTarea = ({ item }: { item: Tarea }) => {
    const recompensa = (item.recompensaCentimos / 100)
      .toFixed(2)
      .replace(".", ",");

    return (
      <View style={styles.tarjeta}>
        <View style={styles.fila}>
          <Text style={styles.nombreTarea}>{item.titulo}</Text>

          <Text style={styles.recompensa}>{recompensa} €</Text>
        </View>

        {!!item.descripcion && (
          <Text style={styles.descripcion}>{item.descripcion}</Text>
        )}

        <View style={styles.filaInferior}>
          <Text style={styles.estado}>
            {item.estado === "pending"
              ? "Pendiente"
              : item.estado === "review"
                ? "En revisión"
                : item.estado === "approved"
                  ? "Aprobada"
                  : "Rechazada"}
          </Text>

          {item.createdAt && (
            <Text style={styles.fecha}>
              {item.createdAt.toLocaleDateString("es-ES")}
            </Text>
          )}
        </View>

        {datos?.esAdministrador && (
          <View style={styles.personaAsignada}>
            <Text style={styles.avatarAsignado}>{item.avatarAsignado}</Text>

            <Text style={styles.nombreAsignado}>
              Asignada a: {item.nombreAsignado}
            </Text>
          </View>
        )}
      </View>
    );
  };

  if (cargando) {
    return (
      <View style={styles.centrado}>
        <ActivityIndicator size="large" color="#5EC287" />
        <Text style={styles.descripcion}>Cargando tareas...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centrado}>
        <Text style={styles.error}>{error}</Text>

        <TouchableOpacity style={styles.boton} onPress={cargarTareas}>
          <Text style={styles.textoBoton}>Reintentar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!datos?.tieneFamilia) {
    return (
      <View style={styles.centrado}>
        <Text style={styles.titulo}>MIS TAREAS</Text>

        <Text style={styles.descripcion}>
          Todavía no perteneces a una familia.
        </Text>

        <TouchableOpacity
          style={styles.boton}
          onPress={() => router.push("/configurarFamilia")}
        >
          <Text style={styles.textoBoton}>Configurar familia</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={datos.tareas}
        keyExtractor={(item) => item.id}
        renderItem={renderTarea}
        contentContainerStyle={styles.lista}
        ListHeaderComponent={
          <View style={styles.encabezado}>
            <Text style={styles.titulo}>
              {datos.esAdministrador ? "TAREAS DE MI FAMILIA" : "MIS TAREAS"}
            </Text>

            <Text style={styles.subtitulo}>{datos.tareas.length} tareas</Text>

            {datos.esAdministrador && (
              <TouchableOpacity
                style={styles.boton}
                onPress={() => router.push("/creartareas")}
              >
                <Text style={styles.textoBoton}>+ Crear nueva tarea</Text>
              </TouchableOpacity>
            )}
          </View>
        }
        ListEmptyComponent={
          <Text style={styles.vacio}>
            {datos.esAdministrador
              ? "Todavía no hay tareas en tu familia."
              : "Todavía no tienes tareas asignadas."}
          </Text>
        }
        refreshing={cargando}
        onRefresh={cargarTareas}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  centrado: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 25,
    backgroundColor: "#FFFFFF",
  },
  lista: {
    padding: 20,
    paddingBottom: 40,
    flexGrow: 1,
  },
  encabezado: {
    marginBottom: 25,
    alignItems: "center",
  },
  titulo: {
    color: "#2E7D32",
    fontSize: 25,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 10,
  },
  subtitulo: {
    color: "#777",
    fontSize: 15,
  },
  tarjeta: {
    backgroundColor: "#F1F8F2",
    borderRadius: 14,
    padding: 18,
    marginBottom: 15,
  },
  fila: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 12,
  },
  nombreTarea: {
    flex: 1,
    fontSize: 18,
    fontWeight: "bold",
    color: "#2E7D32",
  },
  recompensa: {
    fontSize: 17,
    fontWeight: "bold",
    color: "#2E7D32",
  },
  descripcion: {
    color: "#666",
    fontSize: 15,
    marginTop: 10,
    lineHeight: 22,
  },
  filaInferior: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 16,
  },
  estado: {
    color: "#357A4A",
    fontSize: 14,
    fontWeight: "600",
  },
  fecha: {
    color: "#888",
    fontSize: 13,
  },
  asignado: {
    color: "#777",
    fontSize: 13,
    marginTop: 12,
  },
  boton: {
    backgroundColor: "#5EC287",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 15,
    minWidth: 180,
  },
  textoBoton: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  vacio: {
    textAlign: "center",
    color: "#777",
    marginTop: 40,
    fontSize: 16,
  },
  error: {
    color: "#C0392B",
    fontSize: 15,
    textAlign: "center",
  },

  personaAsignada: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 15,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#DDEBDD",
  },
  avatarAsignado: {
    fontSize: 25,
    marginRight: 10,
  },
  nombreAsignado: {
    fontSize: 14,
    color: "#555",
    fontWeight: "500",
  },
});
