import { View, Text } from 'react-native'
import React from 'react'
import { Link } from 'expo-router'
export default function Profile() {
  return (
    <View>
      <Text>Profile screen</Text>
      <Link href={"/notifications"}>Go to Notifications Page</Link>

    </View>
  )
}