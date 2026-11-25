import { router } from "expo-router";
import { Text, TouchableOpacity, View } from "react-native";

export default function Perfil() {
  return (
    <View style={{ padding: 20 }}>
      <TouchableOpacity
        style={{
          backgroundColor: "#5EC287",
          padding: 15,
          borderRadius: 10,
          alignItems: "center",
          marginTop: 20,
        }}
        onPress={() => router.push("/miFamilia")}
      >
        <Text
          style={{
            color: "#FFFFFF",
            fontSize: 16,
            fontWeight: "bold",
          }}
        >
          🏡 Mi familia
        </Text>
     
      </TouchableOpacity>
         <TouchableOpacity
          style={{
            backgroundColor: "#E8F5E9",
            padding: 15,
            borderRadius: 10,
            alignItems: "center",
            marginTop: 15,
          }}
          onPress={() => router.push("/editarPerfil")}
        >
          <Text
            style={{
              color: "#2E7D32",
              fontSize: 16,
              fontWeight: "bold",
            }}
          >
            ✏️ Editar perfil
          </Text>
        </TouchableOpacity>
    </View>
  );
}
