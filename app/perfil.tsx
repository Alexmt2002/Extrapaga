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
    </View>
  );
}
