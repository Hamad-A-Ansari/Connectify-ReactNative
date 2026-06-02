import { View, Text, TouchableOpacity, Alert } from 'react-native'
import React, { useState } from 'react'
import { styles } from '@/styles/feed.styles'
import { Link } from 'expo-router'
import { Image } from 'expo-image'
import { COLORS } from '@/constants/theme'
import { Ionicons } from '@expo/vector-icons'
import { Id } from '@/convex/_generated/dataModel'
import { toggleLike } from '@/convex/posts'
import { useMutation, useQuery } from 'convex/react'
import { api } from '@/convex/_generated/api'
import CommentsModal from './CommentsModal'
import ReportModal from './ReportModal'
import { formatDistanceToNow } from 'date-fns'
import { useUser } from '@clerk/clerk-expo'
import { logger } from '@/lib/logger'
import { useToast } from '@/hooks/useToast'
import { formatErrorForUser } from '@/lib/errorFormatter'

type PostProps = {
  post: {
    _id: Id<"posts">;
    imageUrl: string;
    caption?: string;
    likes: number;
    comments: number;
    _creationTime: number;
    isLiked: boolean;
    isBookmarked: boolean;
    author: {
      _id: string;
      username: string;
      image: string;
    };
  },
}

export default function Post({post}: PostProps) {
  const [isLiked, setIsLiked] = useState(post.isLiked);
  const [isBookmarked, setIsBookmarked] = useState(post.isBookmarked);
  // const [likesCount, setLikesCount] = useState(post.likes);
  // const [commentsCount, setCommentsCount] = useState(post.comments);
  const [showComments, setShowComments] = useState(false);
  const [showReport, setShowReport] = useState(false);


  const { user } = useUser();
  const { showToast } = useToast();
  const currentUser = useQuery(api.users.getUserByClerkId, user ? {clerkId: user.id} : "skip");


  const toggleLike = useMutation(api.posts.toggleLike);
  const toggleBookmark = useMutation(api.bookmarks.toggleBookmark);
  const deletePost = useMutation(api.posts.deletePost);
  const blockUser = useMutation(api.blocks.blockUser);

  const handleLike = async ()=> {
    try {
      const newIsLiked = await toggleLike({postId: post._id});
      setIsLiked(newIsLiked);
    } catch (error) {
      logger.error('Error toggling like: ', error);
      showToast(formatErrorForUser(error), 'error');
    }
  };

  const handleBookmark = async ()=> {
    try {
      const newIsBookmarked = await toggleBookmark({postId: post._id});
      setIsBookmarked(newIsBookmarked);
    } catch (error) {
      logger.error('Error toggling bookmark: ', error);
      showToast(formatErrorForUser(error), 'error');
    }
  };

  const handleDelete = async ()=> {
    try {
      await deletePost({postId: post._id});
    } catch (error) {
      logger.error("Error deleting post:", error);
      showToast(formatErrorForUser(error), 'error');
    }
  };

  const handleBlock = async () => {
    try {
      await blockUser({ userId: post.author._id as Id<"users"> });
      showToast('User blocked', 'success');
    } catch (error) {
      logger.error('Error blocking user:', error);
      showToast(formatErrorForUser(error), 'error');
    }
  };

  const handleOptionsPress = () => {
    Alert.alert(
      '',
      '',
      [
        {
          text: 'Report',
          onPress: () => setShowReport(true),
        },
        {
          text: 'Block',
          style: 'destructive',
          onPress: () => {
            Alert.alert(
              'Block User',
              `Are you sure you want to block ${post.author.username}? You will no longer see their posts.`,
              [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Block', style: 'destructive', onPress: handleBlock },
              ]
            );
          },
        },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };


  return (
    <View style={styles.post}>
      {/* Post Header */}

      <View style={styles.postHeader}>
          <Link href={
            currentUser?._id === post.author._id ? "/(tabs)/profile" : `/user/${post.author._id}`
          } asChild>
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


          {/* delete button - Shown only if the user is owner of a post*/}
          
          {post.author._id === currentUser?._id ? (
            <TouchableOpacity onPress={handleDelete}>
            <Ionicons name='trash-outline' size={20} color={COLORS.primary} />
          </TouchableOpacity>
          ) : (
            <TouchableOpacity onPress={handleOptionsPress}>
            <Ionicons name='ellipsis-horizontal' size={20} color={COLORS.white} />
          </TouchableOpacity>
          )}
          

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
            <TouchableOpacity onPress={handleLike}>
              <Ionicons name={isLiked ? "heart" : "heart-outline"} size={24} color={isLiked ? COLORS.primary : COLORS.white}/>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setShowComments(true)}>
              <Ionicons name='chatbubble-outline' size={22} color={COLORS.white}/>
            </TouchableOpacity>
        </View>

        <TouchableOpacity onPress={handleBookmark}>
          <Ionicons name={isBookmarked ? 'bookmark' :'bookmark-outline'} size={22} color={COLORS.white}/>
        </TouchableOpacity>
      </View>


      {/* Post Info */}
      <View style={styles.postInfo}>
        <Text style={styles.likesText}>
          {post.likes > 0 ? `${post.likes.toLocaleString()} likes` : "0 likes"}
        </Text>
        {post.caption && (
          <View style={styles.captionContainer}>
            <Text style={styles.captionUsername}>{post.author.username}</Text>
            <Text style={styles.captionText}>{post.caption}</Text>
          </View>
        )}

        {post.comments > 0 && (
          <TouchableOpacity onPress={() => setShowComments(true)}>
          <Text style={styles.commentsText}>View all {post.comments} comments</Text>
        </TouchableOpacity>
        )}

        <Text style={styles.timeAgo}>
          {formatDistanceToNow(post._creationTime, { addSuffix: true})}
        </Text>
      </View>

      <CommentsModal
        postId = {post._id}
        visible={showComments}
        onClose={()=> setShowComments(false)}
      />

      <ReportModal
        visible={showReport}
        onClose={() => setShowReport(false)}
        targetId={post._id}
        targetType="post"
      />
    </View>
  );
}