
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { router } from "expo-router";
import { doc, getDoc } from "firebase/firestore";

import { auth, db } from "@/services/firebase";
import { actualizarDatosPerfil } from "@/services/publicProfileService";
import { useAlerta } from "@/components/AlertaPersonalizada";

const avatares = ["👦", "👧", "👨", "👩", "🧑", "😊"];

export default function EditarPerfil() {
  const [nombreCompleto, setNombreCompleto] = useState("");
  const [avatar, setAvatar] = useState("👤");

  const [nombreOriginal, setNombreOriginal] = useState("");
  const [avatarOriginal, setAvatarOriginal] = useState("👤");

  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);

  const { mostrarAlerta, alerta } = useAlerta();

  // Cargar los datos actuales del perfil
  useEffect(() => {
    const cargarPerfil = async () => {
      try {
        const user = auth.currentUser;

        if (!user) {
          router.replace("/login");
          return;
        }

        const usuarioDoc = await getDoc(
          doc(db, "users", user.uid)
        );

        if (!usuarioDoc.exists()) {
          throw new Error("No se ha encontrado tu perfil.");
        }

        const datos = usuarioDoc.data();

        const nombre = datos.nombreCompleto ?? "";
        const avatarActual =
          typeof datos.avatar === "string"
            ? datos.avatar
            : "👤";

        setNombreCompleto(nombre);
        setAvatar(avatarActual);

        setNombreOriginal(nombre);
        setAvatarOriginal(avatarActual);
      } catch (error) {
        mostrarAlerta(
          "Error",
          error instanceof Error
            ? error.message
            : "No se han podido cargar tus datos."
        );
      } finally {
        setCargando(false);
      }
    };

    cargarPerfil();
  }, []);

  // Comprobar si el usuario ha cambiado algo
  const hayCambios =
    nombreCompleto.trim() !== nombreOriginal ||
    avatar !== avatarOriginal;

  const guardarCambios = async () => {
    if (guardando || !hayCambios) return;

    if (!nombreCompleto.trim()) {
      mostrarAlerta(
        "Nombre obligatorio",
        "Introduce tu nombre completo."
      );
      return;
    }

    setGuardando(true);

    try {
      await actualizarDatosPerfil(nombreCompleto, avatar);

      router.replace("/perfil");
    } catch (error) {
      mostrarAlerta(
        "Error al guardar",
        error instanceof Error
          ? error.message
          : "No se pudieron guardar los cambios."
      );
    } finally {
      setGuardando(false);
    }
  };

  if (cargando) {
    return (
      <View style={styles.centrado}>
        <ActivityIndicator size="large" color="#5EC287" />
        <Text>Cargando perfil...</Text>
        {alerta}
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.contenido}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.titulo}>EDITAR PERFIL</Text>

        {/* Vista previa del avatar */}
        <View style={styles.vistaPrevia}>
          <View style={styles.avatarGrande}>
            <Text style={styles.avatarGrandeTexto}>
              {avatar}
            </Text>
          </View>

          <Text style={styles.nombrePrevia}>
            {nombreCompleto.trim() || "Tu nombre"}
          </Text>

          <Text style={styles.descripcion}>
            Así te verá tu familia
          </Text>
        </View>

        {/* Nombre */}
        <Text style={styles.etiqueta}>
          Nombre completo
        </Text>

        <TextInput
          style={styles.input}
          placeholder="Introduce tu nombre completo"
          value={nombreCompleto}
          onChangeText={setNombreCompleto}
          maxLength={100}
          autoCapitalize="words"
          editable={!guardando}
        />

        {/* Avatares */}
        <Text style={styles.etiqueta}>
          Selecciona tu avatar
        </Text>

        <View style={styles.listaAvatares}>
          {avatares.map((opcion) => (
            <TouchableOpacity
              key={opcion}
              disabled={guardando}
              onPress={() => setAvatar(opcion)}
              style={[
                styles.tarjetaAvatar,
                avatar === opcion &&
                  styles.avatarSeleccionado,
              ]}
            >
              <Text style={styles.emoji}>
                {opcion}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Botones */}
        <TouchableOpacity
          style={[
            styles.botonGuardar,
            (!hayCambios || guardando) &&
              styles.botonDesactivado,
          ]}
          onPress={guardarCambios}
          disabled={!hayCambios || guardando}
        >
          {guardando ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.textoGuardar}>
              Guardar cambios
            </Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.back()}
          disabled={guardando}
          style={styles.botonCancelar}
        >
          <Text style={styles.textoCancelar}>
            Cancelar
          </Text>
        </TouchableOpacity>

        {alerta}
      </ScrollView>
    </KeyboardAvoidingView>
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
    gap: 12,
    backgroundColor: "#FFFFFF",
  },
  contenido: {
    padding: 24,
    alignItems: "center",
    paddingBottom: 40,
  },
  titulo: {
    fontSize: 25,
    fontWeight: "bold",
    color: "#2E7D32",
    marginVertical: 20,
  },
  vistaPrevia: {
    alignItems: "center",
    marginBottom: 30,
  },
  avatarGrande: {
    width: 115,
    height: 115,
    borderRadius: 60,
    backgroundColor: "#E8F5E9",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 14,
  },
  avatarGrandeTexto: {
    fontSize: 58,
  },
  nombrePrevia: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  descripcion: {
    fontSize: 14,
    color: "#777",
    marginTop: 6,
  },
  etiqueta: {
    alignSelf: "stretch",
    maxWidth: 400,
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 10,
  },
  input: {
    width: "100%",
    maxWidth: 400,
    height: 52,
    borderWidth: 1,
    borderColor: "#C9D8CE",
    borderRadius: 10,
    paddingHorizontal: 15,
    fontSize: 16,
    marginBottom: 28,
  },
  listaAvatares: {
    width: "100%",
    maxWidth: 400,
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 12,
    marginBottom: 30,
  },
  tarjetaAvatar: {
    width: 65,
    height: 65,
    borderRadius: 12,
    backgroundColor: "#F3F7F4",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "transparent",
  },
  avatarSeleccionado: {
    borderColor: "#5EC287",
    backgroundColor: "#E8F5E9",
  },
  emoji: {
    fontSize: 35,
  },
  botonGuardar: {
    backgroundColor: "#5EC287",
    padding: 16,
    borderRadius: 10,
    width: "100%",
    maxWidth: 400,
    alignItems: "center",
  },
  botonDesactivado: {
    opacity: 0.5,
  },
  textoGuardar: {
    fontSize: 17,
    color: "#FFFFFF",
    fontWeight: "bold",
  },
  botonCancelar: {
    marginTop: 22,
    padding: 10,
  },
  textoCancelar: {
    fontSize: 16,
    color: "#2E7D32",
  },
});
