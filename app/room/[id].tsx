import React, { useEffect, useState, useRef } from 'react';
import { View, StyleSheet, FlatList, ActivityIndicator, Text, KeyboardAvoidingView, Platform } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { Database } from '@/types/supabase';
import { ArrowLeft, Send } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { ErrorView } from '@/components/ErrorView';
import { MessageBubble } from '@/components/MessageBubble';
import { ChatInput } from '@/components/ChatInput';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

type Message = Database['public']['Tables']['messages']['Row'] & {
  profiles: {
    username: string;
    avatar_url: string | null;
  };
};

type ChatRoom = Database['public']['Tables']['chatrooms']['Row'];

export default function ChatRoomScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const isOnline = useOnlineStatus();
  const [messages, setMessages] = useState<Message[]>([]);
  const [chatroom, setChatroom] = useState<ChatRoom | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    fetchChatroom();
    fetchMessages();
    const subscription = subscribeToMessages();
    return () => {
      subscription.unsubscribe();
    };
  }, [id]);

  const fetchChatroom = async () => {
    try {
      const { data, error: roomError } = await supabase
        .from('chatrooms')
        .select('*')
        .eq('id', id)
        .single();

      if (roomError) throw roomError;
      setChatroom(data);
    } catch (err) {
      setError('Failed to load chatroom');
      console.error('Error fetching chatroom:', err);
    }
  };

  const fetchMessages = async () => {
    try {
      const { data, error: messagesError } = await supabase
        .from('messages')
        .select(`
          *,
          profiles:user_id(username, avatar_url)
        `)
        .eq('chatroom_id', id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (messagesError) throw messagesError;
      setMessages(data || []);
    } catch (err) {
      setError('Failed to load messages');
      console.error('Error fetching messages:', err);
    } finally {
      setLoading(false);
    }
  };

  const subscribeToMessages = () => {
    return supabase
      .channel(`chatroom:${id}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'messages',
        filter: `chatroom_id=eq.${id}`,
      }, () => {
        fetchMessages();
      })
      .subscribe();
  };

  const handleSend = async (message: string) => {
    try {
      setSending(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error: sendError } = await supabase.from('messages').insert({
        content: message.trim(),
        chatroom_id: id,
        user_id: user.id,
        type: 'text',
      });

      if (sendError) throw sendError;
      flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
    } catch (err) {
      console.error('Error sending message:', err);
    } finally {
      setSending(false);
    }
  };

  const handleImagePick = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.8,
      });

      if (!result.canceled) {
        // Handle image upload to Supabase Storage
        // Then create a message with the image URL
      }
    } catch (err) {
      console.error('Error picking image:', err);
    }
  };

  if (!isOnline) {
    return (
      <ErrorView
        icon={<Send size={48} color="#FF4444" />}
        title="No Internet Connection"
        message="Please check your connection to continue chatting."
        actionLabel="Retry"
        onAction={fetchMessages}
      />
    );
  }

  if (error) {
    return (
      <ErrorView
        icon={<Send size={48} color="#FF4444" />}
        title="Error Loading Chat"
        message={error}
        actionLabel="Try Again"
        onAction={fetchMessages}
      />
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          headerStyle: { backgroundColor: '#1A1A1A' },
          headerTintColor: '#FFF',
          headerTitle: chatroom?.name || 'Chat',
          headerTitleStyle: { fontFamily: 'Inter-SemiBold' },
          headerLeft: () => (
            <ArrowLeft color="#FFF" size={24} onPress={() => router.back()} />
          ),
        }}
      />

      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}>
        {loading ? (
          <Animated.View 
            entering={FadeIn}
            exiting={FadeOut}
            style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#00FF9D" />
            <Text style={styles.loadingText}>Loading messages...</Text>
          </Animated.View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={messages}
            inverted
            renderItem={({ item }) => (
              <MessageBubble message={item} />
            )}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.messageList}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Send size={48} color="#666" />
                <Text style={styles.emptyText}>No messages yet</Text>
                <Text style={styles.emptySubtext}>Be the first to send a message!</Text>
              </View>
            }
          />
        )}

        <ChatInput
          onSend={handleSend}
          onImagePick={handleImagePick}
          sending={sending}
        />
      </KeyboardAvoidingView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A1A1A',
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
  messageList: {
    padding: 16,
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