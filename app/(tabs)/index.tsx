import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { supabase } from '@/lib/supabase';
import { Database } from '@/types/supabase';
import { MessageSquare } from 'lucide-react-native';

type ChatRoom = Database['public']['Tables']['chatrooms']['Row'];

export default function ChatScreen() {
  const [chatrooms, setChatrooms] = useState<ChatRoom[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchChatrooms();
    subscribeToChatrooms();
  }, []);

  const fetchChatrooms = async () => {
    try {
      const { data, error } = await supabase
        .from('chatrooms')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (data) setChatrooms(data);
    } catch (error) {
      console.error('Error fetching chatrooms:', error);
    } finally {
      setLoading(false);
    }
  };

  const subscribeToChatrooms = () => {
    const subscription = supabase
      .channel('chatrooms')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'chatrooms',
      }, () => {
        fetchChatrooms();
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  };

  const renderChatRoom = ({ item }: { item: ChatRoom }) => (
    <TouchableOpacity style={styles.chatroomCard}>
      <View style={styles.chatroomInfo}>
        <Text style={styles.chatroomName}>{item.name}</Text>
        <Text style={styles.chatroomLocation}>
          {item.province}, {item.region}
        </Text>
        {item.description && (
          <Text style={styles.chatroomDescription} numberOfLines={2}>
            {item.description}
          </Text>
        )}
      </View>
      <MessageSquare color="#00FF9D" size={24} />
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading chatrooms...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Chatrooms</Text>
      </View>
      
      <FlatList
        data={chatrooms}
        renderItem={renderChatRoom}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />
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
  listContainer: {
    padding: 16,
  },
  chatroomCard: {
    backgroundColor: '#2A2A2A',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  chatroomInfo: {
    flex: 1,
    marginRight: 16,
  },
  chatroomName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 4,
    fontFamily: 'Inter-Bold',
  },
  chatroomLocation: {
    fontSize: 14,
    color: '#888',
    marginBottom: 4,
    fontFamily: 'Inter-Regular',
  },
  chatroomDescription: {
    fontSize: 14,
    color: '#CCC',
    fontFamily: 'Inter-Regular',
  },
  loadingText: {
    color: '#888',
    textAlign: 'center',
    marginTop: 20,
    fontFamily: 'Inter-Regular',
  },
});