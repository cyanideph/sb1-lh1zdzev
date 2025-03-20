import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, FlatList, KeyboardAvoidingView, Platform, Modal } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { supabase } from '@/lib/supabase';
import { Database } from '@/types/supabase';
import { Ionicons } from '@expo/vector-icons';
import EmojiSelector from 'react-native-emoji-selector';

type Message = Database['public']['Tables']['messages']['Row'];

export default function ChatroomScreen() {
  const route = useRoute();
  const { province } = route.params as { province: string };
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [isEmojiPickerVisible, setIsEmojiPickerVisible] = useState(false);

  useEffect(() => {
    const getUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUserId(session?.user?.id || null);
    };
    getUser();
  }, []);

  useEffect(() => {
    const fetchMessages = async () => {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('chatroom_id', province)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching messages:', error);
      } else {
        setMessages(data);
      }
    };

    fetchMessages();
  }, [province]);

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
      setMessages([newMessage, ...messages]);
      setMessage('');
      // Save message to the database
      await supabase.from('messages').insert(newMessage);
    }
  };

  const handleEmojiSelect = (emoji: string) => {
    setMessage(message + emoji);
    setIsEmojiPickerVisible(false);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{province} Chatroom</Text>
      </View>
      <FlatList
        data={messages}
        renderItem={({ item }) => (
          <View style={styles.message}>
            <Text style={styles.messageText}>{item.content}</Text>
          </View>
        )}
        keyExtractor={(item) => item.id}
        style={styles.chatContainer}
        inverted
      />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.inputContainer}
      >
        <TextInput
          style={styles.input}
          placeholder="Type a message"
          placeholderTextColor="#666"
          value={message}
          onChangeText={setMessage}
        />
        <TouchableOpacity style={styles.emojiButton} onPress={() => setIsEmojiPickerVisible(true)}>
          <Ionicons name="happy-outline" size={24} color="#FFF" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.sendButton} onPress={handleSendMessage}>
          <Ionicons name="send" size={24} color="#000" />
        </TouchableOpacity>
      </KeyboardAvoidingView>
      <Modal visible={isEmojiPickerVisible} animationType="slide" transparent>
        <View style={styles.modalContainer}>
          <View style={styles.emojiPickerContainer}>
            <EmojiSelector onEmojiSelected={handleEmojiSelect} showSearchBar={false} />
            <TouchableOpacity style={styles.closeButton} onPress={() => setIsEmojiPickerVisible(false)}>
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
    backgroundColor: '#2A2A2A',
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  title: {
    fontSize: 24,
    color: '#FFF',
    fontWeight: 'bold',
    textAlign: 'center',
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
    backgroundColor: '#1A1A1A',
  },
  input: {
    flex: 1,
    backgroundColor: '#2A2A2A',
    borderRadius: 10,
    padding: 10,
    color: '#FFF',
  },
  emojiButton: {
    marginLeft: 10,
    marginRight: 10,
  },
  sendButton: {
    backgroundColor: '#00FF9D',
    borderRadius: 10,
    padding: 10,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  emojiPickerContainer: {
    width: '90%',
    backgroundColor: '#FFF',
    borderRadius: 10,
    padding: 10,
  },
  closeButton: {
    padding: 10,
    backgroundColor: '#00FF9D',
    alignItems: 'center',
    borderRadius: 10,
    marginTop: 10,
  },
  closeButtonText: {
    color: '#000',
    fontWeight: 'bold',
  },
});
