import { View, Text, TouchableOpacity, ScrollView, FlatList, Modal, TouchableWithoutFeedback, Keyboard, KeyboardAvoidingView, Platform, TextInput, StyleSheet } from 'react-native'
import React, { useState } from 'react'
import { Link } from 'expo-router'
import { useAuth } from '@clerk/clerk-expo'
import { useMutation, useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Doc } from '@/convex/_generated/dataModel';
import { Loader } from '@/components/Loader';
import { styles } from '@/styles/profile.styles';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '@/constants/theme';
import { Image } from 'expo-image';
import { logger } from '@/lib/logger';
import { formatErrorForUser } from '@/lib/errorFormatter';
import * as WebBrowser from 'expo-web-browser';
import { TOS_URL, PRIVACY_URL, CHILD_SAFETY_URL } from '@/constants/legal';

export default function Profile() {

  const { signOut, userId } = useAuth();
  const [editModal, setEditModal] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);
  const currentUser = useQuery(api.users.getUserByClerkId, userId ? { clerkId: userId } : "skip");
  const [editedProfile, setEditedProfile] = useState({
    fullname: currentUser?.fullname || "",
    bio: currentUser?.bio || "",
    username: currentUser?.username || "",
  });

  const [selectedPost,setSelectedPost] = useState<Doc<"posts"> | null>(null);
  const [settingsVisible, setSettingsVisible] = useState(false);
  const posts = useQuery(api.posts.getPostByUser, {});

  const updateProfile = useMutation(api.users.updateProfile);

  const handleSaveProfile = async () => {
    try {
      setProfileError(null);
      await updateProfile(editedProfile);
      setEditModal(false);
    } catch (error) {
      logger.error("Error updating profile:", error);
      setProfileError(formatErrorForUser(error));
    }
  };

  if(!currentUser || posts === undefined) return <Loader/>;



  return (
    <View style={styles.container}>
     
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.username}>{currentUser.username}</Text>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.headerIcon} onPress={() => setSettingsVisible(true)}>
            <Ionicons name='menu-outline' size={24} color={COLORS.white}/>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.profileInfo}>

          {/* Avatar and Profile Stats */}
          <View style={styles.avatarAndStats}>
            <View style={styles.avatarContainer}>
              <Image 
                source={currentUser.image}
                style={styles.avatar}
                contentFit='cover'
                transition={200}
              />
            </View>

            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{currentUser.posts}</Text>
                <Text style={styles.statLabel}>Posts</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{currentUser.followers}</Text>
                <Text style={styles.statLabel}>Followers</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{currentUser.following}</Text>
                <Text style={styles.statLabel}>Following</Text>
              </View>
            </View>
          </View>
          <Text style={styles.name}>{currentUser.fullname}</Text>
          {currentUser.bio && <Text style={styles.bio}>{currentUser.bio}</Text>}

          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.editButton} onPress={()=> setEditModal(true)}>
              <Text style={styles.editButtonText}>Edit Profile</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.shareButton}>
              <Ionicons name='share-outline' size={20} color={COLORS.white}/>
            </TouchableOpacity>
          </View>
        </View>

        {posts.length === 0 && <NoPostsFound/>}

        <FlatList
          data={posts}
          numColumns={3}
          scrollEnabled={false}
          renderItem={({item}) => (
            <TouchableOpacity style={styles.gridItem} onPress={() => setSelectedPost(item)}>
              <Image
                source={item.imageUrl}
                style={styles.gridImage}
                contentFit='cover'
                transition={200}
              />
            </TouchableOpacity>
          )}
        />

      </ScrollView>

      {/* Edit Profile */}
      
      <Modal
        visible={editModal}
        animationType='slide'
        transparent={true}
        onRequestClose={() => setEditModal(false)}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? "padding" : "height"}
            style={styles.modalContainer}
          >
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}> Edit Profile</Text>
                <TouchableOpacity onPress={() => setEditModal(false)}>
                  <Ionicons name='close' size={24} color={COLORS.white}/>
                </TouchableOpacity>
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Username</Text>
                <TextInput
                  style={styles.input}
                  value={editedProfile.username}
                  onChangeText={(text) => setEditedProfile((prev) => ({...prev, username: text}))}
                  placeholderTextColor={COLORS.grey}
                />
              </View>




              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Name</Text>
                <TextInput
                  style={styles.input}
                  value={editedProfile.fullname}
                  onChangeText={(text) => setEditedProfile((prev) => ({...prev, fullname: text}))}
                  placeholderTextColor={COLORS.grey}
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Bio</Text>
                <TextInput
                  style={[styles.input, styles.bioInput]}
                  value={editedProfile.bio}
                  onChangeText={(text) => setEditedProfile((prev) => ({...prev, bio: text}))}
                  multiline
                  numberOfLines={4}
                  placeholderTextColor={COLORS.grey}
                />
              </View>

              <TouchableOpacity style={styles.saveButton} onPress={handleSaveProfile}>
                <Text style={styles.saveButtonText}>Save Changes</Text>
              </TouchableOpacity>

              {profileError && (
                <Text style={{ color: COLORS.primary, fontSize: 14, marginTop: 12, textAlign: 'center' }}>
                  {profileError}
                </Text>
              )}
            </View>
          </KeyboardAvoidingView>
        </TouchableWithoutFeedback>
      </Modal>

      {/* Edit Image */}
      <Modal
        visible={!!selectedPost}
        animationType='fade'
        transparent={true}
        onRequestClose={() => setSelectedPost(null)}
      >
        <View style={styles.modalBackdrop}>
          {selectedPost && (
            <View style={styles.postDetailContainer}>
            <View style={styles.postDetailHeader}>
              <TouchableOpacity onPress={() => setSelectedPost(null)}>
                <Ionicons name='close' size={24} color={COLORS.white} />
              </TouchableOpacity>
            </View>

            <Image
              source={selectedPost?.imageUrl}
              cachePolicy={"memory-disk"}
              style={styles.postDetailImage}
            />
          </View>
          )}
        </View>
      </Modal>

      {/* Settings Menu */}
      <Modal
        visible={settingsVisible}
        animationType='slide'
        transparent={true}
        onRequestClose={() => setSettingsVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setSettingsVisible(false)}>
          <View style={settingsStyles.overlay}>
            <TouchableWithoutFeedback>
              <View style={settingsStyles.menu}>
                <View style={settingsStyles.menuHeader}>
                  <Text style={settingsStyles.menuTitle}>Settings</Text>
                  <TouchableOpacity onPress={() => setSettingsVisible(false)}>
                    <Ionicons name='close' size={24} color={COLORS.white}/>
                  </TouchableOpacity>
                </View>

                <TouchableOpacity
                  style={settingsStyles.menuItem}
                  onPress={() => { setSettingsVisible(false); WebBrowser.openBrowserAsync(PRIVACY_URL); }}
                >
                  <Ionicons name='shield-checkmark-outline' size={22} color={COLORS.white}/>
                  <Text style={settingsStyles.menuItemText}>Privacy Policy</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={settingsStyles.menuItem}
                  onPress={() => { setSettingsVisible(false); WebBrowser.openBrowserAsync(TOS_URL); }}
                >
                  <Ionicons name='document-text-outline' size={22} color={COLORS.white}/>
                  <Text style={settingsStyles.menuItemText}>Terms of Service</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={settingsStyles.menuItem}
                  onPress={() => { setSettingsVisible(false); WebBrowser.openBrowserAsync(CHILD_SAFETY_URL); }}
                >
                  <Ionicons name='hand-left-outline' size={22} color={COLORS.white}/>
                  <Text style={settingsStyles.menuItemText}>Child Safety Standards</Text>
                </TouchableOpacity>

                <View style={settingsStyles.divider}/>

                <TouchableOpacity
                  style={settingsStyles.menuItem}
                  onPress={() => { setSettingsVisible(false); signOut(); }}
                >
                  <Ionicons name='log-out-outline' size={22} color={COLORS.primary}/>
                  <Text style={[settingsStyles.menuItemText, { color: COLORS.primary }]}>Log Out</Text>
                </TouchableOpacity>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

    </View>
  )
}

const settingsStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  menu: {
    backgroundColor: COLORS.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
    paddingTop: 16,
  },
  menuHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  menuTitle: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: '600',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    gap: 14,
  },
  menuItemText: {
    color: COLORS.white,
    fontSize: 16,
  },
  divider: {
    height: 0.5,
    backgroundColor: COLORS.surface,
    marginVertical: 8,
  },
});

function NoPostsFound() {
  return (
    <View
      style={{
        paddingTop: 60,
        height: "100%",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: COLORS.background,
      }}
    >
      <Ionicons name='images-outline' size={48} color={COLORS.primary}/>
      <Text style={{fontSize: 20, color: COLORS.white}}>No posts yet</Text>
    </View>
  );
}