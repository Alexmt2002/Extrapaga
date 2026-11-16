import { useAlerta } from "@/components/AlertaPersonalizada";
import PasoAvatar from "@/components/registro/PasoAvatar";
import PasoDatos from "@/components/registro/PasoDatos";
import PasoFamilia from "@/components/registro/PasoFamilia";
import PasoResumen from "@/components/registro/PasoResumen";
import PasoRol from "@/components/registro/PasoRol";
import { styles } from "@/components/registro/registroStyle";
import useRegistro from "@/components/registro/useRegistro";
import { registerUser } from "@/services/authService";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  useWindowDimensions,
  View
} from "react-native";

export default function CrearCuenta() {

const { width } = useWindowDimensions();
const isMobile = width < 600;

const {
  username,
  setUsername,
  nombreCompleto,
  setNombreCompleto,
  email,
  setEmail,
  password,
  setPassword,
  repeatPassword,
  setRepeatPassword,
  open,
  setOpen,
  fecha,
  setFecha,
  paso,
  setPaso,
  rol,
  setRol,
  avatar,
  setAvatar,
  fotoPerfil,
  setFotoPerfil,
  nombreFamilia,
  setNombreFamilia,
  codigoFamilia,
  setCodigoFamilia,
  opcionFamilia,
  setOpcionFamilia,
  tieneLongitudValida,
  tieneMayuscula,
  tieneNumero,
} = useRegistro();
 
  const { mostrarAlerta, alerta } = useAlerta();
  

  const onConfirm = (params: { date?: Date }) => {
    setOpen(false);
    setFecha(params.date);
  };

 

  const continuarDatosPersonales = () => {
    // Comprobar los campos obligatorios
    if (!username.trim() || !nombreCompleto.trim() || !email.trim()) {
      mostrarAlerta(
        "Campos obligatorios",
        "Completa todos los datos personales.",
      );
      return;
    }

    // Comprobar la fecha de nacimiento
    if (!fecha || fecha > new Date()) {
      mostrarAlerta(
        "Fecha no válida",
        "Selecciona una fecha de nacimiento válida.",
      );
      return;
    }

    // Comprobar el formato del correo
    const emailValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

    if (!emailValido) {
      mostrarAlerta(
        "Correo no válido",
        "Introduce un correo electrónico válido.",
      );
      return;
    }

    // Comprobar los requisitos de la contraseña
    if (!tieneLongitudValida || !tieneMayuscula || !tieneNumero) {
      mostrarAlerta(
        "Contraseña no válida",
        "La contraseña debe tener más de 8 caracteres, una mayúscula y un número.",
      );
      return;
    }

    // Comprobar que las contraseñas coinciden
    if (password !== repeatPassword) {
      mostrarAlerta("Error", "Las contraseñas no coinciden.");
      return;
    }

    // Si todo es correcto, avanzar al siguiente paso
    setPaso(3);
  };
  const continuarRol = () => {
    if (!rol) {
      mostrarAlerta("Selecciona un rol", "Debes elegir el tipo de cuenta.");
      return;
    }

    setPaso(2);
  };

  const crearCuenta = async () => {
    if (!username.trim() || !nombreCompleto.trim() || !email.trim()) {
      mostrarAlerta(
        "Campos obligatorios",
        "Completa todos los datos personales.",
      );
      return;
    }

    if (!fecha) {
      mostrarAlerta("Fecha obligatoria", "Selecciona tu fecha de nacimiento.");
      return;
    }

    if (!tieneLongitudValida || !tieneMayuscula || !tieneNumero) {
      mostrarAlerta(
        "Contraseña no válida",
        [
          !tieneLongitudValida ? "• Debe tener más de 8 caracteres." : "",
          !tieneMayuscula ? "• Debe incluir una letra mayúscula." : "",
          !tieneNumero ? "• Debe incluir al menos un número." : "",
        ]
          .filter(Boolean)
          .join("\n"),
      );
      return;
    }

    if (password !== repeatPassword) {
      mostrarAlerta("Error", "Las contraseñas no coinciden.");
      return;
    }

    try {
      await registerUser({
        username,
        nombreCompleto,
        fecha,
        email,
        password,
        role: rol!,
      });

      mostrarAlerta("Éxito", "Tu cuenta se ha creado correctamente.");

      router.push("/perfil");
    } catch (error) {
      mostrarAlerta(
        "Error",
        error instanceof Error
          ? error.message
          : "No se ha podido crear la cuenta.",
      );
    }
  };
  const seleccionarFoto = async () => {
    try {
      const resultado = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!resultado.canceled && resultado.assets.length > 0) {
        setFotoPerfil(resultado.assets[0].uri);
        setAvatar(null);
      }
    } catch (error) {
      mostrarAlerta("Error", "No se ha podido seleccionar la fotografía.");
    }
  };

  const continuarFamilia = () => {
    if (rol === "parent") {
      if (!opcionFamilia) {
        mostrarAlerta(
          "Selecciona una opción",
          "Debes elegir entre crear una familia o unirte a una.",
        );
        return;
      }

      if (opcionFamilia === "crear" && !nombreFamilia.trim()) {
        mostrarAlerta(
          "Nombre obligatorio",
          "Introduce el nombre de tu familia.",
        );
        return;
      }

      if (opcionFamilia === "unirse" && !codigoFamilia.trim()) {
        mostrarAlerta(
          "Código obligatorio",
          "Introduce el código de invitación.",
        );
        return;
      }
    }

    setPaso(5);
  };

  return (
    <KeyboardAvoidingView
      style={styles.keyboardContainer}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
      >
        <View style={styles.container}>
          <View style={[styles.content, { width: isMobile ? "100%" : "50%" }]}>
            <Image
              source={require("../assets/images/ImagenLogo.png")}
              style={styles.logo}
            />

            {paso === 1 ? (
              <PasoRol rol={rol} setRol={setRol} onContinuar={continuarRol} />
            ) : paso === 2 ? (
              <PasoDatos
                username={username}
                setUsername={setUsername}
                nombreCompleto={nombreCompleto}
                setNombreCompleto={setNombreCompleto}
                email={email}
                setEmail={setEmail}
                password={password}
                setPassword={setPassword}
                repeatPassword={repeatPassword}
                setRepeatPassword={setRepeatPassword}
                fecha={fecha}
                open={open}
                setOpen={setOpen}
                onConfirm={onConfirm}
                tieneLongitudValida={tieneLongitudValida}
                tieneMayuscula={tieneMayuscula}
                tieneNumero={tieneNumero}
                onContinuar={continuarDatosPersonales}
                onAtras={() => setPaso(1)}
              />
            ) : paso === 3 ? (
              <PasoAvatar
                avatar={avatar}
                setAvatar={setAvatar}
                fotoPerfil={fotoPerfil}
                setFotoPerfil={setFotoPerfil}
                onSeleccionarFoto={seleccionarFoto}
                onAtras={() => setPaso(2)}
                onContinuar={() => setPaso(4)}
              />
            ) : paso === 4 ? (
              <PasoFamilia
                rol={rol}
                opcionFamilia={opcionFamilia}
                setOpcionFamilia={setOpcionFamilia}
                nombreFamilia={nombreFamilia}
                setNombreFamilia={setNombreFamilia}
                codigoFamilia={codigoFamilia}
                setCodigoFamilia={setCodigoFamilia}
                onAtras={() => setPaso(3)}
                onContinuar={continuarFamilia}
              />
            ) : (
              <PasoResumen
                username={username}
                email={email}
                rol={rol}
                opcionFamilia={opcionFamilia}
                nombreFamilia={nombreFamilia}
                codigoFamilia={codigoFamilia}
                onAtras={() => setPaso(4)}
                onCrearCuenta={crearCuenta}
              />
            )}
          </View>
          {alerta}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
