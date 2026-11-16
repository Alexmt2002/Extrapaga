
import { Image, Text, TouchableOpacity, View } from "react-native";

import Button from "@/components/boton";
import { styles } from "./registroStyle";

type PasoAvatarProps = {
  avatar: string | null;
  setAvatar: (value: string | null) => void;

  fotoPerfil: string | null;
  setFotoPerfil: (value: string | null) => void;

  onSeleccionarFoto: () => void;
  onContinuar: () => void;
  onAtras: () => void;
};

const avatares = ["👦", "👧", "👨", "👩", "🧑", "😊"];

export default function PasoAvatar({
  avatar,
  setAvatar,
  fotoPerfil,
  setFotoPerfil,
  onSeleccionarFoto,
  onContinuar,
  onAtras,
}: PasoAvatarProps) {
  return (
    <View style={styles.selectorRol}>
      <Text style={styles.title}>PERSONALIZAR PERFIL</Text>

      <Text style={styles.descripcion}>
        Elige un avatar o sube tu propia fotografía.
      </Text>

      {/* Vista previa de la imagen seleccionada */}
      <View style={styles.avatarPrincipal}>
        {fotoPerfil ? (
          <Image
            source={{ uri: fotoPerfil }}
            style={styles.imagenPerfil}
          />
        ) : (
          <Text style={styles.avatarTexto}>
            {avatar || "👤"}
          </Text>
        )}
      </View>

      <Text style={styles.subtituloAvatar}>Elige un avatar</Text>

      {/* Lista de avatares */}
      <View style={styles.listaAvatares}>
        {avatares.map((item) => (
          <TouchableOpacity
            key={item}
            style={[
              styles.avatarOpcion,
              avatar === item && styles.avatarSeleccionado,
            ]}
            onPress={() => {
              setAvatar(item);
              setFotoPerfil(null);
            }}
          >
            <Text style={styles.avatarEmoji}>{item}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Seleccionar fotografía */}
      <Button
        title="Subir fotografía"
        style={styles.botonFoto}
        onPress={onSeleccionarFoto}
      />

      {/* Utilizar avatar predeterminado */}
      <TouchableOpacity
        onPress={() => {
          setAvatar(null);
          setFotoPerfil(null);
        }}
      >
        <Text style={styles.textoPredeterminado}>
          Utilizar avatar predeterminado
        </Text>
      </TouchableOpacity>

      {/* Navegación */}
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
