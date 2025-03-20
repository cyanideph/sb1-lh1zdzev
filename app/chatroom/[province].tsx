import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, FlatList } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { supabase } from '@/lib/supabase';
import { Database } from '@/types/supabase';

type Message = Database['public']['Tables']['messages']['Row'];

export default function ChatroomScreen() {
  const route = useRoute();
  const { province } = route.params as { province: string };
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const getUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUserId(session?.user?.id || null);
    };
    getUser();
  }, []);

  const handleSendMessage = async () => {
    if (message.trim() && userId) {
      const newMessage: Message = {
        id: '',
        created_at: new Date().toISOString(),
        content: message,
        user_id: userId,
        chatroom_id: province,
        type: 'text',
        image_url: undefined,
      };
      setMessages([...messages, newMessage]);
      setMessage('');
      // Save message to the database
      await supabase.from('messages').insert(newMessage);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Chatroom UI</Text>
      <FlatList
        data={messages}
        renderItem={({ item }) => (
          <View style={styles.message}>
            <Text style={styles.messageText}>{item.content}</Text>
          </View>
        )}
        keyExtractor={(item) => item.id}
        style={styles.chatContainer}
      />
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Type a message"
          placeholderTextColor="#666"
          value={message}
          onChangeText={setMessage}
        />
        <TouchableOpacity style={styles.sendButton} onPress={handleSendMessage}>
          <Text style={styles.sendButtonText}>Send</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A1A1A',
  },
  title: {
    fontSize: 24,
    color: '#FFF',
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 20,
  },
  chatContainer: {
    flex: 1,
    paddingHorizontal: 10,
  },
  message: {
    backgroundColor: '#2A2A2A',
    borderRadius: 10,
    padding: 10,
    marginVertical: 5,
  },
  messageText: {
    color: '#FFF',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
  input: {
    flex: 1,
    backgroundColor: '#2A2A2A',
    borderRadius: 10,
    padding: 10,
    color: '#FFF',
  },
  sendButton: {
    marginLeft: 10,
    backgroundColor: '#00FF9D',
    borderRadius: 10,
    padding: 10,
  },
  sendButtonText: {
    color: '#000',
    fontWeight: 'bold',
  },
});
