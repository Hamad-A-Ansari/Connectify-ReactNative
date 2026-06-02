import { View, Text, TouchableOpacity, ScrollView, Pressable, FlatList } from 'react-native'
import React from 'react'
import { useMutation, useQuery } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { Id } from '@/convex/_generated/dataModel'
import { Loader } from '@/components/Loader'
import { styles } from '@/styles/profile.styles'
import { Ionicons } from '@expo/vector-icons'
import { COLORS } from '@/constants/theme'
import { Image } from 'expo-image'
import { useToast } from '@/hooks/useToast'
import { formatErrorForUser } from '@/lib/errorFormatter'

export default function UserProfileScreen() {

  const router = useRouter();
  const {id} = useLocalSearchParams();
  const profile = useQuery(api.users.getUserProfile, {id: id as Id<"users">})
  const posts = useQuery(api.posts.getPostByUser, {userId: id as Id<"users">})
  const isFollowing = useQuery(api.users.isFollowing, {followingId: id as Id<"users">})
  const isBlockedByMe = useQuery(api.blocks.isBlocked, {userId: id as Id<"users">})

  const toggleFollow = useMutation(api.users.toggleFollow);
  const unblockUser = useMutation(api.blocks.unblockUser);
  const { showToast } = useToast();

  const handleBack = () => {
    if(router.canGoBack()) router.back();
    else router.replace("/(tabs)")
  }

  const handleUnblock = async () => {
    try {
      await unblockUser({ userId: id as Id<"users"> });
      showToast("User unblocked", "success");
    } catch (error) {
      showToast(formatErrorForUser(error), "error");
    }
  };

  if(profile === undefined || posts === undefined || isFollowing === undefined || isBlockedByMe === undefined) return <Loader/>;

  return (    
    <View style={styles.container}>
      {/* Profile Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack}>
          <Ionicons name='arrow-back' size={24} color={COLORS.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{profile.username}</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* User Profile */}
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.profileInfo}>
          <View style={styles.avatarAndStats}>
            {/* Avatar */}
            <Image
              source={profile.image}
              style={styles.avatar}
              contentFit='cover'
              cachePolicy="memory-disk"
            />

            {/* Stats */}
            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{profile.posts}</Text>
                <Text style={styles.statLabel}>Posts</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{profile.followers}</Text>
                <Text style={styles.statLabel}>Followers</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{profile.following}</Text>
                <Text style={styles.statLabel}>Following</Text>
              </View>
            </View>
          </View>

          {/* Name / Bio */}
          <Text style={styles.name}>{profile.fullname}</Text>
          {profile.bio && <Text style={styles.bio}>{profile.bio}</Text>}

          {/* Follow / Unblock Button */}
          {isBlockedByMe ? (
            <Pressable
              style={[styles.followButton, { backgroundColor: COLORS.primary }]}
              onPress={handleUnblock}
            >
              <Text style={[styles.followButtonText, { color: COLORS.background }]}>
                Unblock
              </Text>
            </Pressable>
          ) : (
            <Pressable
              style={[styles.followButton, isFollowing && styles.followingButton]}
              onPress={()=> toggleFollow({followingId: id as Id<"users">})}
            >
              <Text style={[styles.followButtonText, isFollowing && styles.followingButtonText]}>
                {isFollowing ? "Following" : "Follow"}
              </Text>
            </Pressable>
          )}
        </View>
        <View style={styles.postsGrid}>
          {posts.length === 0 ? (
            <View style={styles.noPostsContainer}>
              <Ionicons name='images-outline' size={48} color={COLORS.grey} style={{paddingTop: 110}} />
              <Text style={styles.noPostsText}>No posts yet</Text>
            </View>
          ) : (
            <FlatList 
              data={posts}
              numColumns={3}
              scrollEnabled={false}
              renderItem={({item}) => (
                <TouchableOpacity style={styles.gridItem}>
                  <Image 
                    source={item.imageUrl}
                    style={styles.gridImage}
                    contentFit='cover'
                    cachePolicy="memory-disk"
                    transition={200}
                  />
                </TouchableOpacity>
              )}
            />
          )}
        </View>

      </ScrollView>

    </View>
  )
}