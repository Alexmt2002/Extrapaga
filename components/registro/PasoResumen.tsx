
import { Text, View } from "react-native";

import Button from "@/components/boton";
import { styles } from "./registroStyle";

type PasoResumenProps = {
  username: string;
  email: string;
  rol: "parent" | "child" | null;

  opcionFamilia: "crear" | "unirse" | null;
  nombreFamilia: string;
  codigoFamilia: string;

  onAtras: () => void;
  onCrearCuenta: () => void;
};

export default function PasoResumen({
  username,
  email,
  rol,
  opcionFamilia,
  nombreFamilia,
  codigoFamilia,
  onAtras,
  onCrearCuenta,
}: PasoResumenProps) {
  return (
    <View style={styles.selectorRol}>
      <Text style={styles.title}>REVISAR DATOS</Text>

      <Text style={styles.descripcion}>
        Comprueba que tu información sea correcta.
      </Text>

      <Text style={styles.textoInformativo}>
        Usuario: {username}
      </Text>

      <Text style={styles.textoInformativo}>
        Tipo de cuenta:{" "}
        {rol === "parent" ? "Padre/Tutor" : "Hijo/Hija"}
      </Text>

      <Text style={styles.textoInformativo}>
        Correo: {email}
      </Text>

      <Text style={styles.textoInformativo}>
        {rol === "parent"
          ? opcionFamilia === "crear"
            ? `Crear familia: ${nombreFamilia}`
            : `Unirse como Padre/Tutor. Código: ${codigoFamilia}`
          : codigoFamilia.trim()
            ? `Unirse como Hijo/Hija. Código: ${codigoFamilia}`
            : "Sin familia por ahora"}
      </Text>

      <View style={styles.botonesNavegacion}>
        <Button
          title="Atrás"
          style={styles.botonAtras}
          textStyle={styles.textoBotonAtras}
          onPress={onAtras}
        />

        <Button
          title="Crear cuenta"
          style={styles.botonContinuar}
          onPress={onCrearCuenta}
        />
      </View>
    </View>
  );
}
