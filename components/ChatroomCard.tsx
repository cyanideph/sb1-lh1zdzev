import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { MessageSquare, Users } from 'lucide-react-native';
import { Database } from '@/types/supabase';

type ChatRoom = Database['public']['Tables']['chatrooms']['Row'] & {
  profiles: {
    username: string;
    avatar_url: string | null;
  } | null;
  messages: {
    count: number;
  }[];
};

interface ChatroomCardProps {
  chatroom: ChatRoom;
  onPress: () => void;
}

export function ChatroomCard({ chatroom, onPress }: ChatroomCardProps) {
  const messageCount = chatroom.messages?.[0]?.count || 0;

  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.name}>{chatroom.name}</Text>
          <View style={styles.stats}>
            <View style={styles.statItem}>
              <MessageSquare size={16} color="#00FF9D" />
              <Text style={styles.statText}>{messageCount}</Text>
            </View>
            <View style={styles.statItem}>
              <Users size={16} color="#00FF9D" />
              <Text style={styles.statText}>0</Text>
            </View>
          </View>
        </View>

        <Text style={styles.location}>
          {chatroom.province}, {chatroom.region}
        </Text>

        {chatroom.description && (
          <Text style={styles.description} numberOfLines={2}>
            {chatroom.description}
          </Text>
        )}

        {chatroom.profiles && (
          <View style={styles.creator}>
            <Image
              source={
                chatroom.profiles.avatar_url
                  ? { uri: chatroom.profiles.avatar_url }
                  : { uri: 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y' }
              }
              style={styles.avatar}
            />
            <Text style={styles.creatorName}>
              Created by {chatroom.profiles.username}
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#2A2A2A',
    borderRadius: 16,
    marginBottom: 12,
    overflow: 'hidden',
  },
  content: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  name: {
    fontSize: 18,
    color: '#FFF',
    fontFamily: 'Inter-Bold',
    flex: 1,
  },
  stats: {
    flexDirection: 'row',
    gap: 12,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    color: '#00FF9D',
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
  },
  location: {
    fontSize: 14,
    color: '#888',
    marginBottom: 8,
    fontFamily: 'Inter-Regular',
  },
  description: {
    fontSize: 14,
    color: '#CCC',
    marginBottom: 12,
    fontFamily: 'Inter-Regular',
  },
  creator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  avatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: 8,
  },
  creatorName: {
    fontSize: 12,
    color: '#888',
    fontFamily: 'Inter-Regular',
  },
});