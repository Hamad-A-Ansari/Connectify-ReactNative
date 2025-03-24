import { View, Text, TouchableOpacity } from 'react-native'
import React from 'react'
import { styles } from '@/styles/feed.styles'
import { Link } from 'expo-router'
import { Image } from 'expo-image'
import { COLORS } from '@/constants/theme'
import { Ionicons } from '@expo/vector-icons'

export default function Post({post}:{post:any}) {
  return (
    <View style={styles.post}>
      {/* Post Header */}

      <View style={styles.postHeader}>
          <Link href={"/(tabs)/notifications"}>
            <TouchableOpacity style={styles.postHeaderLeft}>
            <Image
              source={post.author.image}
              style={styles.postAvatar}
              contentFit='cover'
              transition={200}
              cachePolicy="memory-disk"
            />
            <Text style={styles.postUsername}>{post.author.username}</Text>
            </TouchableOpacity>
          </Link>


          {/* delete button */}
          {/* <TouchableOpacity>
            <Ionicons name='ellipsis-horizontal' size={20} color={COLORS.white} />
          </TouchableOpacity> */}

          <TouchableOpacity>
            <Ionicons name='trash-outline' size={20} color={COLORS.primary} />
          </TouchableOpacity>
      </View>

      {/* Image */}
      <Image
        source={post.imageUrl}
        style={styles.postImage}
        contentFit='cover'
        transition={200}
        cachePolicy="memory-disk"
      />

      {/* Post Actions */}
      <View style={styles.postActions}>
        <View style={styles.postActionsLeft} >
            <TouchableOpacity>
              <Ionicons name='heart-outline' size={24} color={COLORS.white}/>
            </TouchableOpacity>
            <TouchableOpacity>
              <Ionicons name='chatbubble-outline' size={22} color={COLORS.white}/>
            </TouchableOpacity>
        </View>
        <TouchableOpacity>
          <Ionicons name='bookmark-outline' size={22} color={COLORS.white}/>
        </TouchableOpacity>
      </View>


      {/* Post Info */}
      <View style={styles.postInfo}>
        <Text style={styles.likesText}>Be the first to like</Text>
        {post.caption && (
          <View style={styles.captionContainer}>
            <Text style={styles.captionUsername}>{post.author.username}</Text>
            <Text style={styles.captionText}>{post.caption}</Text>
          </View>
        )}

        <TouchableOpacity>
          <Text style={styles.commentsText}>View all 2 comments</Text>
        </TouchableOpacity>
        <Text style={styles.timeAgo}>2 hours ago</Text>
      </View>
    </View>
  )
}