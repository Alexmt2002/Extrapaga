import { Text, View } from "react-native";

import Button from "@/components/boton";
import { styles } from "./registroStyle";

type PasoResumenProps = {
  username: string;
  email: string;
  rol: "parent" | "child" | null;

  cargando: boolean;

  onAtras: () => void;
  onCrearCuenta: () => void;
};

export default function PasoResumen({
  username,
  email,
  rol,
  cargando,
  onAtras,
  onCrearCuenta,
}: PasoResumenProps) {
  return (
    <View style={styles.selectorRol}>
      <Text style={styles.title}>REVISAR DATOS</Text>

      <Text style={styles.descripcion}>
        Comprueba que tu información sea correcta.
      </Text>

      <Text style={styles.textoInformativo}>Usuario: {username}</Text>

      <Text style={styles.textoInformativo}>
        Tipo de cuenta: {rol === "parent" ? "Padre/Tutor" : "Hijo/Hija"}
      </Text>

      <Text style={styles.textoInformativo}>Correo: {email}</Text>

      <View style={styles.botonesNavegacion}>
        <Button
          title="Atrás"
          style={styles.botonAtras}
          textStyle={styles.textoBotonAtras}
          onPress={onAtras}
        />

        <Button
          title={cargando ? "Creando cuenta..." : "Crear cuenta"}
          style={styles.botonContinuar}
          onPress={onCrearCuenta}
          disabled={cargando}
        />
      </View>
    </View>
  );
}
