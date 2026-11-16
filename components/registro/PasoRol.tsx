
import { Text, TouchableOpacity, View } from "react-native";

import Button from "@/components/boton";
import { styles } from "./registroStyle";

type PasoRolProps = {
  rol: "parent" | "child" | null;
  setRol: (rol: "parent" | "child") => void;
  onContinuar: () => void;
};

export default function PasoRol({
  rol,
  setRol,
  onContinuar,
}: PasoRolProps) {
  return (
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
        <Text style={styles.nombreRol}>Padre / Madre </Text>
        <Text>
          Gestiona las tareas y recompensas de tu familia.
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.tarjetaRol,
          rol === "child" && styles.tarjetaSeleccionada,
        ]}
        onPress={() => setRol("child")}
      >
        <Text style={styles.nombreRol}>Hijo / Hija</Text>
        <Text>
          Completa tareas y consigue recompensas.
        </Text>
      </TouchableOpacity>

      <Button
        title="Continuar"
        onPress={onContinuar}
      />
    </View>
  );
}
