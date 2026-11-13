import { useAlerta } from "@/components/AlertaPersonalizada";
import Button from "@/components/boton";
import { Colors } from "@/constants/theme";
import { registerUser } from "@/services/authService";
import { router } from "expo-router";
import { useState } from "react";
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import { DatePickerModal } from "react-native-paper-dates";

export default function CrearCuenta() {
  const { width } = useWindowDimensions();
  const isMobile = width < 600;

  const [username, setUsername] = useState("");
  const [nombreCompleto, setNombreCompleto] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [open, setOpen] = useState(false);
  const [fecha, setFecha] = useState<Date | undefined>(new Date());

  const [paso, setPaso] = useState(1);
  const [rol, setRol] = useState<"parent" | "child" | null>(null);

  const { mostrarAlerta, alerta } = useAlerta();

  const onConfirm = (params: { date?: Date }) => {
    setOpen(false);
    setFecha(params.date);
  };

  const tieneLongitudValida = password.length > 8;
  const tieneMayuscula = /[A-Z]/.test(password);
  const tieneNumero = /[0-9]/.test(password);

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
              <View style={styles.selectorRol}>
                <Text style={styles.title}>¿QUIÉN ERES?</Text>

                <Text style={styles.descripcion}>
                  Selecciona el tipo de cuenta que quieres crear.
                </Text>

                <TouchableOpacity
                  style={[
                    styles.tarjetaRol,
                    rol === "parent" && styles.tarjetaSeleccionada,
                  ]}
                  onPress={() => setRol("parent")}
                >
                  <Text style={styles.nombreRol}>Padre / Tutor</Text>
                  <Text>Gestiona las tareas y recompensas de tu familia.</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.tarjetaRol,
                    rol === "child" && styles.tarjetaSeleccionada,
                  ]}
                  onPress={() => setRol("child")}
                >
                  <Text style={styles.nombreRol}>Hijo / Hija</Text>
                  <Text>Completa tareas y consigue recompensas.</Text>
                </TouchableOpacity>

                <Button
                  title="Continuar"
                  onPress={() => {
                    if (!rol) {
                      mostrarAlerta(
                        "Selecciona un rol",
                        "Debes elegir el tipo de cuenta.",
                      );
                      return;
                    }

                    setPaso(2);
                  }}
                />
              </View>
            ) : (
              <>
                <Text style={styles.title}>DATOS PERSONALES</Text>

                <TextInput
                  style={styles.input}
                  placeholder="Nombre de usuario"
                  value={username}
                  onChangeText={setUsername}
                  autoCapitalize="none"
                />

                <TextInput
                  style={styles.input}
                  placeholder="Nombre completo"
                  value={nombreCompleto}
                  onChangeText={setNombreCompleto}
                />

                <TouchableOpacity
                  style={styles.input}
                  onPress={() => setOpen(true)}
                >
                  <Text>
                    {fecha
                      ? fecha.toLocaleDateString()
                      : "Seleccionar fecha de nacimiento"}
                  </Text>
                </TouchableOpacity>

                <DatePickerModal
                  locale="es"
                  mode="single"
                  visible={open}
                  onDismiss={() => setOpen(false)}
                  date={fecha}
                  onConfirm={onConfirm}
                />

                <TextInput
                  style={styles.input}
                  placeholder="Correo electrónico"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />

                <TextInput
                  style={styles.input}
                  placeholder="Contraseña"
                  secureTextEntry
                  value={password}
                  onChangeText={setPassword}
                  autoCapitalize="none"
                />

                {/* Requisitos de la contraseña */}
                {password.length > 0 && (
                  <View style={styles.passwordRequirements}>
                    <Text
                      style={{
                        color: tieneLongitudValida ? "green" : "red",
                      }}
                    >
                      {tieneLongitudValida ? "✓" : "✗"} Más de 8 caracteres
                    </Text>

                    <Text
                      style={{
                        color: tieneMayuscula ? "green" : "red",
                      }}
                    >
                      {tieneMayuscula ? "✓" : "✗"} Una letra mayúscula
                    </Text>

                    <Text
                      style={{
                        color: tieneNumero ? "green" : "red",
                      }}
                    >
                      {tieneNumero ? "✓" : "✗"} Un número
                    </Text>
                  </View>
                )}

                <TextInput
                  style={styles.input}
                  placeholder="Repetir contraseña"
                  secureTextEntry
                  value={repeatPassword}
                  onChangeText={setRepeatPassword}
                  autoCapitalize="none"
                />

                {repeatPassword.length > 0 && (
                  <Text
                    style={{
                      color: password === repeatPassword ? "green" : "red",
                      marginBottom: 12,
                      alignSelf: "flex-start",
                    }}
                  >
                    {password === repeatPassword
                      ? "✓ Las contraseñas coinciden"
                      : "✗ Las contraseñas no coinciden"}
                  </Text>
                )}

                <Button
                  title="Crear"
                  style={styles.createButton}
                  onPress={crearCuenta}
                />
              </>
            )}
          </View>
          {alerta}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboardContainer: {
    flex: 1,
  },

  scroll: {
    flex: 1,
  },

  scrollContent: {
    flexGrow: 1,
    paddingBottom: 40,
  },

  container: {
    flexGrow: 1,
    padding: 20,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },

  content: {
    alignItems: "center",
    maxWidth: 400,
  },

  title: {
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 30,
    textAlign: "center",
    color: Colors.light.text2,
  },

  input: {
    width: "100%",
    minHeight: 50,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    marginBottom: 15,
    paddingHorizontal: 10,
    justifyContent: "center",
  },

  passwordRequirements: {
    width: "100%",
    marginTop: -5,
    marginBottom: 15,
    gap: 5,
  },

  createButton: {
    marginTop: 20,
    marginBottom: 20,
  },

  logo: {
    width: 200,
    height: 200,
    resizeMode: "contain",
  },

  selectorRol: {
    width: "100%",
    alignItems: "center",
  },

  descripcion: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 25,
    color: "#666",
  },

  tarjetaRol: {
    width: "100%",
    padding: 20,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: "#ddd",
    marginBottom: 20,
    backgroundColor: "#F4FAF4",
  },

  tarjetaSeleccionada: {
    borderColor: "#66BB6A",
    backgroundColor: "#E8F5E9",
  },

  nombreRol: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#2E7D32",
  },
});
