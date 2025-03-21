import { Text, View, TouchableOpacity, Pressable, Image } from "react-native";
import { styles } from "../../styles/auth.styles"
import { Link } from "expo-router";
import { useAuth } from "@clerk/clerk-expo";

// Define the Index component
export default function Index() {
  const { signOut } = useAuth();
  
  return (
    <View
      style={styles.container} //This is imported from the styles function created
    >

      <TouchableOpacity onPress={()=> signOut()}>
        <Text style={{color: "white"}}>Signout</Text>
      </TouchableOpacity>
      
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



