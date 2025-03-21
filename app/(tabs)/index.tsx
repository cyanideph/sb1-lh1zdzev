import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Image, ActivityIndicator, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { Database } from '@/types/supabase';
import { MessageSquare, Users } from 'lucide-react-native';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import { ErrorView } from '@/components/ErrorView';
import { ChatroomCard } from '@/components/ChatroomCard';

type ChatRoom = Database['public']['Tables']['chatrooms']['Row'];

export default function ChatScreen() {
  const router = useRouter();
  const isOnline = useOnlineStatus();
  const [chatrooms, setChatrooms] = useState<ChatRoom[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchChatrooms();
    const subscription = subscribeToChatrooms();
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchChatrooms = async () => {
    try {
      setError(null);
      const { data, error: fetchError } = await supabase
        .from('chatrooms')
        .select(`
          *,
          profiles:created_by(username, avatar_url),
          messages:messages(count)
        `)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;
      if (data) setChatrooms(data);
    } catch (err) {
      setError('Failed to load chatrooms. Please try again.');
      console.error('Error fetching chatrooms:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const subscribeToChatrooms = () => {
    return supabase
      .channel('chatrooms')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'chatrooms',
      }, () => {
        fetchChatrooms();
      })
      .subscribe();
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchChatrooms();
  };

  const handleChatroomPress = (chatroom: ChatRoom) => {
    router.push(`/room/${chatroom.id}`);
  };

  if (!isOnline) {
    return (
      <ErrorView
        icon={<Users size={48} color="#FF4444" />}
        title="No Internet Connection"
        message="Please check your connection and try again."
        actionLabel="Retry"
        onAction={fetchChatrooms}
      />
    );
  }

  if (error) {
    return (
      <ErrorView
        icon={<MessageSquare size={48} color="#FF4444" />}
        title="Error Loading Chatrooms"
        message={error}
        actionLabel="Try Again"
        onAction={fetchChatrooms}
      />
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Chatrooms</Text>
        <Text style={styles.subtitle}>Join conversations across the Philippines</Text>
      </View>
      
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#00FF9D" />
          <Text style={styles.loadingText}>Loading chatrooms...</Text>
        </View>
      ) : (
        <FlatList
          data={chatrooms}
          renderItem={({ item }) => (
            <ChatroomCard
              chatroom={item}
              onPress={() => handleChatroomPress(item)}
            />
          )}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor="#00FF9D"
              colors={['#00FF9D']}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <MessageSquare size={48} color="#666" />
              <Text style={styles.emptyText}>No chatrooms available</Text>
              <Text style={styles.emptySubtext}>Be the first to create one!</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A1A1A',
  },
  header: {
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#1A1A1A',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFF',
    fontFamily: 'Inter-Bold',
  },
  subtitle: {
    fontSize: 16,
    color: '#888',
    marginTop: 4,
    fontFamily: 'Inter-Regular',
  },
  listContainer: {
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#888',
    marginTop: 12,
    fontFamily: 'Inter-Regular',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyText: {
    color: '#888',
    fontSize: 18,
    marginTop: 16,
    fontFamily: 'Inter-SemiBold',
  },
  emptySubtext: {
    color: '#666',
    fontSize: 14,
    marginTop: 8,
    fontFamily: 'Inter-Regular',
  },
});