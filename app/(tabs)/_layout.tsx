import { View, Text } from 'react-native'
import React from 'react'
import { Tabs } from 'expo-router'
import { Ionicons } from "@expo/vector-icons"
import { COLORS } from '@/constants/theme'

export default function TabLayout() {
  return (
    <Tabs
    screenOptions={{
      tabBarShowLabel: false,
      headerShown: false,
      tabBarActiveTintColor: COLORS.primary,
      tabBarInactiveTintColor: COLORS.grey,
      tabBarStyle: {
        backgroundColor: 'black',
        borderTopWidth: 0.5,
        position: 'absolute',
        elevation: 0,
        height: 48,
        paddingBottom: 8,
        paddingTop: 4,
        borderColor: COLORS.surface,
      }
    }}
    >
      <Tabs.Screen name="index"
      options={{
        tabBarIcon: ({size, color}) => <Ionicons name='home'  size={size} color={color} />,

      }}/>
      <Tabs.Screen name="bookmarks"
      options={{
        tabBarIcon: ({size, color}) => <Ionicons name='bookmarks'  size={size} color={color} />,

      }}/>
      <Tabs.Screen name="create"
      options={{
        tabBarIcon: ({size, color}) => <Ionicons name='add-circle'  size={size} color={COLORS.primary} />,

      }}/>
      <Tabs.Screen name="notifications"
      options={{
        tabBarIcon: ({size, color}) => <Ionicons name='heart'  size={size} color={color} />,

      }}/>
      <Tabs.Screen name="profile"
      options={{
        tabBarIcon: ({size, color}) => <Ionicons name='person'  size={size} color={color} />,

      }}/>
    </Tabs>
  )
}