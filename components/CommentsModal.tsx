import { View, Text, Modal, KeyboardAvoidingView, Platform, TouchableOpacity, FlatList, TextInput, ActivityIndicator } from 'react-native'
import React, { useState } from 'react'
import { Id } from '@/convex/_generated/dataModel'
import { useMutation } from 'convex/react';
import { usePaginatedQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { styles } from '@/styles/feed.styles';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '@/constants/theme';
import { Loader } from './Loader';
import Comment from './Comment';
import { logger } from '@/lib/logger';
import { useToast } from '@/hooks/useToast';
import { formatErrorForUser } from '@/lib/errorFormatter';

type CommentsModal = {
  postId: Id<"posts">;
  visible: boolean;
  onClose: () => void;
}

export default function CommentsModal({onClose, postId, visible}: CommentsModal) {

  const [newComment, setNewComment] = useState("");
  const { showToast } = useToast();
  const { results: comments, status, loadMore } = usePaginatedQuery(
    api.comments.getComments,
    { postId },
    { initialNumItems: 20 }
  );
  const addComment = useMutation(api.comments.addComment);

  const handleAddComment = async () => {
    if(!newComment.trim()) return;

    try {
      await addComment({
        content: newComment,
        postId,
      })

      setNewComment("");
    } catch (error) {
      logger.error("Error adding comment", error);
      showToast(formatErrorForUser(error), 'error');
    }
  }

  return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose} >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios'? 'padding' : 'height'}
        style={styles.modalContainer}
      >
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={24} color={COLORS.white}/>
          </TouchableOpacity>
          <Text style={styles.modalTitle} >Comments</Text>
          <View style={{width: 24}} />
        </View>

        {status === "LoadingFirstPage" ? (
          <Loader />
        ) : (
          <FlatList 
            data={comments}
            keyExtractor={(item) => item._id}
            renderItem={({item}) => <Comment comment={item} /> }
            contentContainerStyle={styles.commentsList}
            ListFooterComponent={
              status === "LoadingMore" ? (
                <ActivityIndicator size="small" color={COLORS.primary} style={{ paddingVertical: 16 }} />
              ) : null
            }
            onEndReached={() => {
              if (status === "CanLoadMore") {
                loadMore(20);
              }
            }}
            onEndReachedThreshold={0.5}
          />
        )}

        <View style={styles.commentInput}>
          <TextInput 
            style={styles.input}
            placeholder='Add a comment...'
            placeholderTextColor={COLORS.grey}
            value={newComment}
            onChangeText={setNewComment}
            multiline
          />

          <TouchableOpacity onPress={handleAddComment} disabled={!newComment.trim()}>
            <Text style={[styles.postButton, !newComment.trim() && styles.postButtonDisabled]}>
              Post
            </Text>
          </TouchableOpacity>
        </View>

      </KeyboardAvoidingView>
    </Modal>
  )
}