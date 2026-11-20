
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useFocusEffect, router } from "expo-router";
import { doc, getDoc } from "firebase/firestore";

import { auth, db } from "@/services/firebase";
import {
  obtenerSolicitudesPendientes,
  responderSolicitudFamilia,
  type SolicitudFamilia,
} from "@/services/familyService";
import { useAlerta } from "@/components/AlertaPersonalizada";


export default function SolicitudesFamilia() {
  const [solicitudes, setSolicitudes] = useState<SolicitudFamilia[]>([]);
  const [cargando, setCargando] = useState(true);
  const [procesando, setProcesando] = useState<string | null>(null);

  const { mostrarAlerta, alerta } = useAlerta();

  const cargarSolicitudes = async () => {
    setCargando(true);

    try {
      const user = auth.currentUser;

      if (!user || !user.emailVerified) {
        router.replace("/login");
        return;
      }

      const usuarioDoc = await getDoc(
        doc(db, "users", user.uid)
      );

      const familyId = usuarioDoc.data()?.familyId;

      if (!familyId) {
        throw new Error("No perteneces a ninguna familia.");
      }

      const familiaDoc = await getDoc(
        doc(db, "families", familyId)
      );

      if (!familiaDoc.exists()) {
        throw new Error("No se ha encontrado la familia.");
      }

      const adminIds = familiaDoc.data().adminIds as string[];

      if (!adminIds.includes(user.uid)) {
        throw new Error(
          "Solo los administradores pueden ver las solicitudes."
        );
      }

      const resultado = await obtenerSolicitudesPendientes(familyId);

      setSolicitudes(resultado);
    } catch (error) {
      mostrarAlerta(
        "Error",
        error instanceof Error
          ? error.message
          : "No se pudieron cargar las solicitudes."
      );
    } finally {
      setCargando(false);
    }
  };

  // Recargar al entrar o volver a la pantalla
  useFocusEffect(
    useCallback(() => {
      cargarSolicitudes();
    }, [])
  );

  const gestionarSolicitud = async (
    solicitudId: string,
    aceptar: boolean
  ) => {
    if (procesando) return;

    setProcesando(solicitudId);

    try {
      await responderSolicitudFamilia(solicitudId, aceptar);

      setSolicitudes((anteriores) =>
        anteriores.filter((s) => s.id !== solicitudId)
      );

      mostrarAlerta(
        aceptar ? "Solicitud aceptada" : "Solicitud rechazada",
        aceptar
          ? "El usuario ya pertenece a tu familia."
          : "La solicitud ha sido rechazada."
      );
    } catch (error) {
      mostrarAlerta(
        "Error",
        error instanceof Error
          ? error.message
          : "No se pudo gestionar la solicitud."
      );
    } finally {
      setProcesando(null);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>
        SOLICITUDES PENDIENTES
      </Text>

      {cargando ? (
        <ActivityIndicator size="large" color="#5EC287" />
      ) : (
        <FlatList
          data={solicitudes}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.lista}
          ListEmptyComponent={
            <Text style={styles.vacio}>
              No tienes solicitudes pendientes.
            </Text>
          }
          renderItem={({ item }) => (
            <View style={styles.tarjeta}>
              <Text style={styles.nombre}>
                {item.nombreSolicitante ||
                  `Usuario ${item.userId.slice(0, 8)}`}
              </Text>

              <Text style={styles.rol}>
                {item.role === "parent"
                  ? "Padre/Tutor"
                  : "Hijo/Hija"}
              </Text>

              <Text style={styles.descripcion}>
                Quiere unirse a tu familia.
              </Text>

              <View style={styles.botones}>
                <TouchableOpacity
                  style={[styles.boton, styles.aceptar]}
                  disabled={procesando !== null}
                  onPress={() =>
                    gestionarSolicitud(item.id, true)
                  }
                >
                  <Text style={styles.textoBoton}>
                    Aceptar
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.boton, styles.rechazar]}
                  disabled={procesando !== null}
                  onPress={() =>
                    gestionarSolicitud(item.id, false)
                  }
                >
                  <Text style={styles.textoBoton}>
                    Rechazar
                  </Text>
                </TouchableOpacity>
              </View>

              {procesando === item.id && (
                <ActivityIndicator
                  size="small"
                  color="#5EC287"
                />
              )}
            </View>
          )}
        />
      )}

      <TouchableOpacity
        onPress={() => router.back()}
        style={styles.volver}
      >
        <Text style={styles.textoVolver}>Volver</Text>
      </TouchableOpacity>

      {alerta}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 20,
  },
  titulo: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#2E7D32",
    textAlign: "center",
    marginTop: 30,
    marginBottom: 25,
  },
  lista: {
    paddingBottom: 20,
    flexGrow: 1,
  },
  tarjeta: {
    backgroundColor: "#F1F8F2",
    padding: 18,
    borderRadius: 14,
    marginBottom: 15,
  },
  nombre: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2E7D32",
  },
  rol: {
    fontSize: 14,
    fontWeight: "600",
    marginTop: 5,
  },
  descripcion: {
    fontSize: 14,
    color: "#666",
    marginVertical: 10,
  },
  botones: {
    flexDirection: "row",
    gap: 10,
    marginTop: 10,
  },
  boton: {
    flex: 1,
    borderRadius: 8,
    padding: 12,
    alignItems: "center",
  },
  aceptar: {
    backgroundColor: "#5EC287",
  },
  rechazar: {
    backgroundColor: "#C75B5B",
  },
  textoBoton: {
    color: "#fff",
    fontWeight: "bold",
  },
  vacio: {
    textAlign: "center",
    color: "#666",
    marginTop: 60,
    fontSize: 16,
  },
  volver: {
    padding: 15,
    alignItems: "center",
  },
  textoVolver: {
    color: "#2E7D32",
    fontSize: 16,
  },
});
