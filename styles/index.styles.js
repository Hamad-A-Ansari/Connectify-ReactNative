import { StyleSheet } from "react-native";

// u can make styles using the StyleSheet propertly of React Native
export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 50,
    fontWeight: '900',
    fontFamily: 'Helvetica ', 
  },
})

// u can create any group of styles and apply it to the components using the style={styles.styleGroup}