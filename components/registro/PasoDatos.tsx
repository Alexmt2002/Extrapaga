
import {
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { DatePickerModal } from "react-native-paper-dates";
import Button from "@/components/boton";

import { styles } from "./registroStyle";

type PasoDatosProps = {
  username: string;
  setUsername: (value: string) => void;

  nombreCompleto: string;
  setNombreCompleto: (value: string) => void;

  email: string;
  setEmail: (value: string) => void;

  password: string;
  setPassword: (value: string) => void;

  repeatPassword: string;
  setRepeatPassword: (value: string) => void;

  fecha: Date | undefined;
  open: boolean;
  setOpen: (value: boolean) => void;
  onConfirm: (params: { date?: Date }) => void;

  tieneLongitudValida: boolean;
  tieneMayuscula: boolean;
  tieneNumero: boolean;

  onContinuar: () => void;
  onAtras: () => void;
};

export default function PasoDatos({
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
  fecha,
  open,
  setOpen,
  onConfirm,
  tieneLongitudValida,
  tieneMayuscula,
  tieneNumero,
  onContinuar,
  onAtras,
}: PasoDatosProps) {
  return (
    <>
      <Text style={styles.title}>DATOS PERSONALES</Text>

      {/* Nombre de usuario */}
      <TextInput
        style={styles.input}
        placeholder="Nombre de usuario"
        value={username}
        onChangeText={setUsername}
        autoCapitalize="none"
      />

      {/* Nombre completo */}
      <TextInput
        style={styles.input}
        placeholder="Nombre completo"
        value={nombreCompleto}
        onChangeText={setNombreCompleto}
      />

      {/* Fecha de nacimiento */}
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

      {/* Correo electrónico */}
      <TextInput
        style={styles.input}
        placeholder="Correo electrónico"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      {/* Contraseña */}
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

      {/* Repetir contraseña */}
      <TextInput
        style={styles.input}
        placeholder="Repetir contraseña"
        secureTextEntry
        value={repeatPassword}
        onChangeText={setRepeatPassword}
        autoCapitalize="none"
      />

      {/* Comprobar si coinciden */}
      {repeatPassword.length > 0 && (
        <Text
          style={{
            color:
              password === repeatPassword ? "green" : "red",
            marginBottom: 12,
            alignSelf: "flex-start",
          }}
        >
          {password === repeatPassword
            ? "✓ Las contraseñas coinciden"
            : "✗ Las contraseñas no coinciden"}
        </Text>
      )}

      {/* Botones de navegación */}
      <View style={styles.botonesNavegacion}>
        <Button
          title="Atrás"
          style={styles.botonAtras}
          textStyle={styles.textoBotonAtras}
          onPress={onAtras}
        />

        <Button
          title="Continuar"
          style={styles.botonContinuar}
          onPress={onContinuar}
        />
      </View>
    </>
  );
}
