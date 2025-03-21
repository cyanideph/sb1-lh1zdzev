import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Image as ImageIcon, Send, Smile } from 'lucide-react-native';
import Animated, { 
  useAnimatedStyle, 
  withSpring, 
  withSequence 
} from 'react-native-reanimated';

interface ChatInputProps {
  onSend: (message: string) => Promise<void>;
  onImagePick: () => Promise<void>;
  sending: boolean;
}

const AnimatedSend = Animated.createAnimatedComponent(Send);

export function ChatInput({ onSend, onImagePick, sending }: ChatInputProps) {
  const [message, setMessage] = useState('');
  const [height, setHeight] = useState(0);

  const handleSend = async () => {
    if (!message.trim() || sending) return;
    await onSend(message);
    setMessage('');
  };

  const sendButtonStyle = useAnimatedStyle(() => {
    const isActive = message.trim().length > 0 && !sending;
    return {
      transform: [
        { scale: withSpring(isActive ? 1 : 0.8) },
        { rotate: withSpring(isActive ? '0deg' : '-45deg') }
      ],
      opacity: withSpring(isActive ? 1 : 0.5),
    };
  });

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.iconButton} onPress={onImagePick}>
        <ImageIcon size={24} color="#00FF9D" />
      </TouchableOpacity>

      <View style={styles.inputWrapper}>
        <TextInput
          style={[styles.input, { height: Math.max(40, height) }]}
          value={message}
          onChangeText={setMessage}
          placeholder="Type a message..."
          placeholderTextColor="#666"
          multiline
          onContentSizeChange={(e) => 
            setHeight(e.nativeEvent.contentSize.height)
          }
        />
        <TouchableOpacity style={styles.emojiButton}>
          <Smile size={20} color="#666" />
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={[
          styles.sendButton,
          (!message.trim() || sending) && styles.sendButtonDisabled
        ]}
        onPress={handleSend}
        disabled={!message.trim() || sending}>
        <AnimatedSend
          size={24}
          style={sendButtonStyle}
          color={!message.trim() || sending ? '#666' : '#00FF9D'}
        />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#2A2A2A',
    backgroundColor: '#1A1A1A',
  },
  iconButton: {
    padding: 8,
    backgroundColor: '#2A2A2A',
    borderRadius: 20,
    marginRight: 8,
  },
  inputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: '#2A2A2A',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
  },
  input: {
    flex: 1,
    color: '#FFF',
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    maxHeight: 100,
    marginRight: 8,
    paddingTop: Platform.OS === 'ios' ? 8 : 0,
  },
  emojiButton: {
    padding: 4,
  },
  sendButton: {
    padding: 8,
    backgroundColor: '#2A2A2A',
    borderRadius: 20,
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
});