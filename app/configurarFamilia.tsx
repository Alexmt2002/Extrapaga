
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { router } from "expo-router";
import { doc, getDoc } from "firebase/firestore";

import { auth, db } from "@/services/firebase";
import { crearFamilia } from "@/services/familyService";
import { useAlerta } from "@/components/AlertaPersonalizada";

type ConfiguracionPendiente = {
  opcion: "crear" | "unirse" | null;
  nombre: string | null;
  codigo: string | null;
  
};

export default function ConfigurarFamilia() {
  const [configuracion, setConfiguracion] =
    useState<ConfiguracionPendiente | null>(null);

  const [nombre, setNombre] = useState("");
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);

  const { mostrarAlerta, alerta } = useAlerta();

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const user = auth.currentUser;

        if (!user) {
          router.replace("/login");
          return;
        }

        if (!user.emailVerified) {
          router.replace("/verificarCorreo");
          return;
        }

        const usuarioDoc = await getDoc(doc(db, "users", user.uid));

        if (!usuarioDoc.exists()) {
          throw new Error("No se ha encontrado tu perfil.");
        }

        const datos = usuarioDoc.data();

        if (datos.familyId) {
          router.replace("/perfil");
          return;
        }

        const pendiente =
          datos.configuracionFamiliaPendiente as
            | ConfiguracionPendiente
            | undefined;

        setConfiguracion(
          pendiente ?? {
            opcion: null,
            nombre: null,
            codigo: null,
          }
        );

        setNombre(pendiente?.nombre ?? "");
      } catch (error) {
        mostrarAlerta(
          "Error",
          error instanceof Error
            ? error.message
            : "No se han podido cargar los datos."
        );
      } finally {
        setCargando(false);
      }
    };

    cargarDatos();
  }, []);

  const guardarFamilia = async () => {
    if (guardando) return;

    setGuardando(true);

    try {
      await crearFamilia(nombre);

      router.replace("/perfil");
    } catch (error) {
      mostrarAlerta(
        "Error",
        error instanceof Error
          ? error.message
          : "No se ha podido crear la familia."
      );
    } finally {
      setGuardando(false);
    }
  };

  if (cargando) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#5EC287" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>CONFIGURAR FAMILIA</Text>

      {configuracion?.opcion === "crear" ? (
        <>
          <Text style={styles.descripcion}>
            Introduce el nombre de la familia que quieres crear.
          </Text>

          <TextInput
            style={styles.input}
            placeholder="Nombre de la familia"
            value={nombre}
            onChangeText={setNombre}
            maxLength={60}
          />

          <TouchableOpacity
            style={styles.boton}
            disabled={guardando}
            onPress={guardarFamilia}
          >
            {guardando ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.textoBoton}>
                Crear familia
              </Text>
            )}
          </TouchableOpacity>
        </>
      ) : (
        <>
          <Text style={styles.descripcion}>
            Tu cuenta está verificada. Próximamente podrás
            solicitar unirte a una familia existente.
          </Text>

          <Text style={styles.descripcion}>
            {configuracion?.codigo
              ? `Código introducido: ${configuracion.codigo}`
              : "Todavía no has introducido un código familiar."}
          </Text>
        </>
      )}

      <TouchableOpacity onPress={() => router.replace("/perfil")}>
        <Text style={styles.enlace}>Ir a mi perfil</Text>
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
  titulo: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#2E7D32",
    marginBottom: 20,
    textAlign: "center",
  },
  descripcion: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 20,
  },
  input: {
    width: "100%",
    maxWidth: 400,
    height: 50,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 20,
  },
  boton: {
    backgroundColor: "#5EC287",
    borderRadius: 10,
    padding: 15,
    width: "100%",
    maxWidth: 350,
    alignItems: "center",
  },
  textoBoton: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "bold",
  },
  enlace: {
    color: "#2E7D32",
    marginTop: 25,
    textDecorationLine: "underline",
  },
});
