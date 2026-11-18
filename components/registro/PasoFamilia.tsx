
import {
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import Button from "@/components/boton";
import { styles } from "./registroStyle";

type PasoFamiliaProps = {
  rol: "parent" | "child" | null;

  opcionFamilia: "crear" | "unirse" | null;
  setOpcionFamilia: (value: "crear" | "unirse") => void;

  nombreFamilia: string;
  setNombreFamilia: (value: string) => void;

  codigoFamilia: string;
  setCodigoFamilia: (value: string) => void;

  onContinuar: () => void;
  onAtras: () => void;
};

export default function PasoFamilia({
  rol,
  opcionFamilia,
  setOpcionFamilia,
  nombreFamilia,
  setNombreFamilia,
  codigoFamilia,
  setCodigoFamilia,
  onContinuar,
  onAtras,
}: PasoFamiliaProps) {
  return (
    <View style={styles.selectorRol}>
      <Text style={styles.title}>CONFIGURAR FAMILIA</Text>

      {rol === "parent" ? (
        <>
          <Text style={styles.descripcion}>
            ¿Quieres crear una familia o unirte a una existente?
          </Text>

          <TouchableOpacity
            style={[
              styles.tarjetaRol,
              opcionFamilia === "crear" && styles.tarjetaSeleccionada,
            ]}
            onPress={() => setOpcionFamilia("crear")}
          >
            <Text style={styles.nombreRol}>Crear familia</Text>
            <Text>Crea una familia y administra sus tareas.</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.tarjetaRol,
              opcionFamilia === "unirse" && styles.tarjetaSeleccionada,
            ]}
            onPress={() => setOpcionFamilia("unirse")}
          >
            <Text style={styles.nombreRol}>Unirme a una familia</Text>
            <Text>
              Únete como tutor a una familia existente.
            </Text>
          </TouchableOpacity>

          {opcionFamilia === "crear" && (
            <TextInput
              style={styles.input}
              placeholder="Nombre de la familia"
              value={nombreFamilia}
              onChangeText={setNombreFamilia}
              maxLength={60}
            />
          )}

          {opcionFamilia === "unirse" && (
            <TextInput
              style={styles.input}
              placeholder="Código de invitación"
              value={codigoFamilia}
              onChangeText={setCodigoFamilia}
              autoCapitalize="characters"
              autoCorrect={false}
            />
          )}

          <Text style={styles.textoInformativo}>
            {opcionFamilia === "crear"
              ? "Podrás invitar a otros miembros cuando tu cuenta esté verificada."
              : opcionFamilia === "unirse"
                ? "Un administrador tendrá que aprobar tu solicitud."
                : "Selecciona una opción para continuar."}
          </Text>
        </>
      ) : (
        <>
          <Text style={styles.descripcion}>
            Introduce el código de invitación que te ha proporcionado
            tu familia.
          </Text>

          <TextInput
            style={styles.input}
            placeholder="Código de invitación"
            value={codigoFamilia}
            onChangeText={setCodigoFamilia}
            autoCapitalize="characters"
            autoCorrect={false}
          />

          <Text style={styles.textoInformativo}>
            Tu solicitud necesitará la aprobación de un administrador
            de la familia.
          </Text>

          <Text style={styles.textoInformativo}>
            Puedes dejar el código vacío y solicitar unirte a una
            familia más adelante.
          </Text>
        </>
      )}

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
    </View>
  );
}
