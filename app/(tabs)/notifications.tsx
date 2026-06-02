import { View, Text, FlatList, ActivityIndicator } from 'react-native'
import React from 'react'
import { usePaginatedQuery } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { Loader } from '@/components/Loader';
import { styles } from '@/styles/notifications.styles';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '@/constants/theme';
import Notification from '@/components/Notification';

export default function Notifications() {

  const { results, status, loadMore } = usePaginatedQuery(
    api.notifications.getNotifications,
    {},
    { initialNumItems: 20 }
  );

  if (status === "LoadingFirstPage") return <Loader />;
  
  if (results.length === 0) return <NoNotificationsFound />;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Notifications</Text>
      </View>

      <FlatList
        data={results}
        renderItem={({item}) => <Notification notification={item} />}
        keyExtractor={(item) => item._id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
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
    </View>
  )
}



function NoNotificationsFound() {
  return (
    <View style={[styles.container, styles.centered]}>
      <Ionicons name="notifications-outline" size={48} color={COLORS.primary}/>
      <Text style={{fontSize: 20, color: COLORS.grey, paddingTop: 20}}>No Notifications yet</Text>
    </View>
  );
}