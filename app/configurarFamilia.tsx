import { router } from "expo-router";
import { reload } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import { ActivityIndicator, Image, ScrollView, View, Text, TouchableOpacity} from "react-native";

import { useAlerta } from "@/components/AlertaPersonalizada";
import PasoFamilia from "@/components/registro/PasoFamilia";
import { styles } from "@/components/registro/registroStyle";
import { crearFamilia, solicitarUnionFamilia } from "@/services/familyService";
import { auth, db } from "@/services/firebase";

type Rol = "parent" | "child";

export default function ConfigurarFamilia() {
  const [rol, setRol] = useState<Rol | null>(null);

  const [opcionFamilia, setOpcionFamilia] = useState<"crear" | "unirse" | null>(
    null,
  );

  const [nombreFamilia, setNombreFamilia] = useState("");
  const [codigoFamilia, setCodigoFamilia] = useState("");

  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);

  const { mostrarAlerta, alerta } = useAlerta();

  const [solicitudEnviada, setSolicitudEnviada] = useState(false);

  // Cargar el rol del usuario desde Firestore
  useEffect(() => {
    const cargarUsuario = async () => {
      try {
        const user = auth.currentUser;

        if (!user) {
          router.replace("/login");
          return;
        }

        await reload(user);

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

        if (datos.role !== "parent" && datos.role !== "child") {
          throw new Error("El rol de tu cuenta no es válido.");
        }

        setRol(datos.role);
      } catch (error) {
        mostrarAlerta(
          "Error",
          error instanceof Error
            ? error.message
            : "No se ha podido cargar tu perfil.",
        );
      } finally {
        setCargando(false);
      }
    };

    cargarUsuario();
  }, []);

  // Crear familia o solicitar unirse
  const continuarFamilia = async () => {
    if (guardando || !rol) return;

    if (rol === "parent") {
      if (!opcionFamilia) {
        mostrarAlerta(
          "Selecciona una opción",
          "Elige entre crear una familia o unirte a una.",
        );
        return;
      }

      if (opcionFamilia === "crear") {
        if (!nombreFamilia.trim()) {
          mostrarAlerta(
            "Nombre obligatorio",
            "Introduce el nombre de tu familia.",
          );
          return;
        }

        setGuardando(true);

        try {
          await crearFamilia(nombreFamilia);
          router.replace("/perfil");
        } catch (error) {
          mostrarAlerta(
            "Error",
            error instanceof Error
              ? error.message
              : "No se ha podido crear la familia.",
          );
        } finally {
          setGuardando(false);
        }

        return;
      }
    }

    // Unión mediante código: se conectará al servicio
    // de invitaciones y solicitudes de aprobación.

    if (codigoFamilia.trim()) {
      setGuardando(true);

      try {
        await solicitarUnionFamilia(codigoFamilia);
        setSolicitudEnviada(true);
      } catch (error) {
        mostrarAlerta(
          "Error al solicitar acceso",
          error instanceof Error
            ? error.message
            : "No se ha podido enviar la solicitud.",
        );
      } finally {
        setGuardando(false);
      }

      return;
    }

    if (rol === "parent") {
      mostrarAlerta("Código obligatorio", "Introduce el código de invitación.");
      return;
    }

    // Los hijos pueden continuar sin familia
    router.replace("/perfil");
  };

  if (cargando || guardando) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#5EC287" />
        {alerta}
      </View>
    );
  }

  if (!rol) {
    return <View style={styles.container}>{alerta}</View>;
  }

if (solicitudEnviada) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        SOLICITUD ENVIADA
      </Text>

      <Text style={styles.descripcion}>
        Tu solicitud se ha enviado correctamente.
        Un administrador de la familia tendrá
        que aprobarla.
      </Text>

      <TouchableOpacity
        onPress={() => router.replace("/perfil")}
      >
        <Text style={{ color: "#2E7D32", fontSize: 16 }}>
          Ir a mi perfil
        </Text>
      </TouchableOpacity>
    </View>
  );
}


  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.scrollContent}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.container}>
        <View style={[styles.content, { width: "100%" }]}>
          <Image
            source={require("../assets/images/ImagenLogo.png")}
            style={styles.logo}
          />

          <PasoFamilia
            rol={rol}
            opcionFamilia={opcionFamilia}
            setOpcionFamilia={setOpcionFamilia}
            nombreFamilia={nombreFamilia}
            setNombreFamilia={setNombreFamilia}
            codigoFamilia={codigoFamilia}
            setCodigoFamilia={setCodigoFamilia}
            onContinuar={continuarFamilia}
          />
        </View>

        {alerta}
      </View>
    </ScrollView>
  );
}
