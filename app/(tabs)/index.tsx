import { Text, View, TouchableOpacity, Pressable, Image } from "react-native";
import { styles } from "../../styles/auth.styles"
import { Link } from "expo-router";

// Define the Index component
export default function Index() {
  return (
    <View
      style={styles.container} //This is imported from the styles function created
    >

      <Link href={"/(tabs)/notifications"}>Go to Notifications Page</Link>
      <Link href={"/(tabs)/profile"}>Go to Profile Page</Link>
      
      {/* <Text style={styles.title}>Hello</Text>
      <TouchableOpacity style={styles.button} onPress={() => alert("you touched me :(")}>
        <Text>Touch me</Text>
      </TouchableOpacity>
      <Pressable style={styles.button} onPress={() => alert("you pressed me :(")}>
        <Text>Pressable</Text>
      </Pressable>
      <Image
        source={require("../assets/images/icon.png")}
        style={{height:100, width:100 }} /> */}
    </View>
  );
}



