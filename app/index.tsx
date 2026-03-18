import { Text, View } from 'react-native';
import { auth } from "../services/firebase";

export default function Home() {
  console.log(auth);
  return (
    <View>
      <Text>Hola</Text>
    </View>
  );
}
