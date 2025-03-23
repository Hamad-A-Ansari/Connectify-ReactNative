import { Text, View, TouchableOpacity, Pressable, Image, ScrollView } from "react-native";
import { styles } from "../../styles/feed.styles"
import { Link } from "expo-router";
import { useAuth } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "@/constants/theme";
import { STORIES } from "@/constants/mock-data";
import Story from "@/components/Story";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Loader } from "@/components/Loader";


// Define the Index component
export default function Index() {
  const { signOut } = useAuth();
  
  const posts = useQuery(api.posts.getFeedPosts)

  if(posts === undefined) return <Loader />

  if(posts.length === 0) return <NoPostsFound />

  return (
    <View style={styles.container} >
      

      {/* Header Section */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Mingle</Text>
        <TouchableOpacity onPress={()=> signOut()}>
          <Ionicons name="log-out-outline" size={24} color={COLORS.white}/>
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        horizontal
        style={styles.storiesContainer}
      >


        {/* STORIES Section */}

        {STORIES.map((story) => (
          <Story key={story.id} story={story}/>
        ))}
        

        {/* Post Section */}

      </ScrollView>


    </View>
  );
}



const NoPostsFound = () => (
  <View
    style={{
      flex: 1,
      backgroundColor: COLORS.background,
      justifyContent: "center",
      alignItems: "center",
    }}
  >
    <Text  style={{fontSize: 20, color: COLORS.primary}}>No posts yet</Text>
  </View>
)