import { useAlerta } from "@/components/AlertaPersonalizada";
import {
    obtenerMiFamilia,
    type DatosMiFamilia,
    type MiembroFamilia,
} from "@/services/familyService";
import { auth } from "@/services/firebase";
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

export default function MiFamilia() {
  const [familia, setFamilia] = useState<DatosMiFamilia | null>(null);

  const [cargando, setCargando] = useState(true);
  const { mostrarAlerta, alerta } = useAlerta();

  const cargarFamilia = useCallback(async () => {
    setCargando(true);

    try {
      const resultado = await obtenerMiFamilia();
      setFamilia(resultado);
    } catch (error) {
      mostrarAlerta(
        "Error al cargar la familia",
        error instanceof Error
          ? error.message
          : "No se han podido obtener los datos.",
      );
    } finally {
      setCargando(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      cargarFamilia();
    }, [cargarFamilia]),
  );

  const renderMiembro = ({ item }: { item: MiembroFamilia }) => {
    const esMiCuenta = auth.currentUser?.uid === item.uid;

    return (
      <View style={styles.miembro}>
        <View style={styles.avatar}>
          <Text style={styles.avatarTexto}>{item.avatar}</Text>
        </View>

        <View style={styles.infoMiembro}>
          <Text style={styles.nombreMiembro}>
            {item.nombre}
            {esMiCuenta ? " (Tú)" : ""}
          </Text>

          <Text style={styles.rolMiembro}>
            {item.esAdministrador ? "Tutor" : "Hijo"}
          </Text>
        </View>
      </View>
    );
  };

  if (cargando) {
    return (
      <View style={styles.centrado}>
        <ActivityIndicator size="large" color="#5EC287" />
        <Text style={styles.descripcion}>Cargando familia...</Text>
      </View>
    );
  }

  if (!familia) {
    return (
      <View style={styles.centrado}>
        <Text style={styles.titulo}>MI FAMILIA</Text>

        <Text style={styles.descripcion}>
          Todavía no perteneces a ninguna familia.
        </Text>

        <TouchableOpacity
          style={styles.boton}
          onPress={() => router.push("/configurarFamilia")}
        >
          <Text style={styles.textoBoton}>Configurar familia</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={cargarFamilia}>
          <Text style={styles.enlace}>Volver a comprobar</Text>
        </TouchableOpacity>

        {alerta}
      </View>
    );
  }

  const totalAdministradores = familia.miembros.filter(
    (m) => m.esAdministrador,
  ).length;

  return (
    <View style={styles.container}>
      <FlatList
        data={familia.miembros}
        keyExtractor={(item) => item.uid}
        renderItem={renderMiembro}
        contentContainerStyle={styles.contenido}
        ListHeaderComponent={
          <>
            <Text style={styles.titulo}>MI FAMILIA</Text>

            <View style={styles.tarjetaFamilia}>
              <Text style={styles.iconoCasa}>🏡</Text>

              <Text style={styles.nombreFamilia}>{familia.nombre}</Text>

              <Text style={styles.descripcion}>
                {familia.miembros.length} miembros
                {" · "}
                {totalAdministradores} administradores
              </Text>
            </View>

            <Text style={styles.seccion}>Miembros de la familia</Text>
          </>
        }
        ListFooterComponent={
          familia.esAdministrador ? (
            <View style={styles.administracion}>
              <Text style={styles.seccion}>Administración</Text>

              <TouchableOpacity
                style={styles.boton}
                onPress={() => router.push("/invitaciones")}
              >
                <Text style={styles.textoBoton}>Invitar miembros</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.botonSecundario}
                onPress={() => router.push("/solicitudesFamilia")}
              >
                <Text style={styles.textoSecundario}>
                  Solicitudes pendientes
                </Text>
              </TouchableOpacity>
            </View>
          ) : null
        }
      />

      <TouchableOpacity onPress={() => router.back()} style={styles.volver}>
        <Text style={styles.enlace}>Volver</Text>
      </TouchableOpacity>

      {alerta}
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
    backgroundColor: "#FFFFFF",
    padding: 24,
  },
  contenido: {
    padding: 20,
    paddingBottom: 30,
  },
  titulo: {
    fontSize: 25,
    fontWeight: "bold",
    color: "#2E7D32",
    textAlign: "center",
    marginVertical: 20,
  },
  tarjetaFamilia: {
    backgroundColor: "#E8F5E9",
    borderRadius: 18,
    padding: 24,
    alignItems: "center",
    marginBottom: 25,
  },
  iconoCasa: {
    fontSize: 44,
    marginBottom: 10,
  },
  nombreFamilia: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#2E7D32",
    textAlign: "center",
  },
  descripcion: {
    fontSize: 15,
    color: "#666",
    textAlign: "center",
    marginTop: 8,
  },
  seccion: {
    fontSize: 19,
    fontWeight: "bold",
    color: "#2E7D32",
    marginBottom: 15,
  },
  miembro: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F9F6",
    padding: 14,
    borderRadius: 12,
    marginBottom: 10,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#DDF3E5",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  avatarTexto: {
    fontSize: 25,
  },
  infoMiembro: {
    flex: 1,
  },
  nombreMiembro: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  rolMiembro: {
    fontSize: 13,
    color: "#666",
    marginTop: 4,
  },
  administracion: {
    marginTop: 25,
  },
  boton: {
    backgroundColor: "#5EC287",
    borderRadius: 10,
    padding: 15,
    alignItems: "center",
    marginTop: 12,
    width: "100%",
    maxWidth: 370,
  },
  textoBoton: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  botonSecundario: {
    borderColor: "#5EC287",
    borderWidth: 1,
    borderRadius: 10,
    padding: 15,
    alignItems: "center",
    marginTop: 12,
  },
  textoSecundario: {
    color: "#2E7D32",
    fontSize: 16,
    fontWeight: "bold",
  },
  volver: {
    padding: 18,
    alignItems: "center",
  },
  enlace: {
    fontSize: 16,
    color: "#2E7D32",
    textDecorationLine: "underline",
  },
});
