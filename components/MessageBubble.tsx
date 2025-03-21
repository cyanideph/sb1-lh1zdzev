import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Pressable } from 'react-native';
import { formatDistanceToNow } from 'date-fns';
import { supabase } from '@/lib/supabase';
import { Heart, Smile, Share2, Reply } from 'lucide-react-native';
import Animated, { 
  useAnimatedStyle, 
  withSpring,
  withSequence,
  withTiming,
  runOnJS
} from 'react-native-reanimated';

interface MessageBubbleProps {
  message: {
    id: string;
    content: string;
    created_at: string;
    type: 'text' | 'image';
    image_url?: string | null;
    user_id: string;
    profiles: {
      username: string;
      avatar_url: string | null;
    };
  };
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function MessageBubble({ message }: MessageBubbleProps) {
  const [isCurrentUser, setIsCurrentUser] = React.useState(false);
  const [showActions, setShowActions] = useState(false);
  const [liked, setLiked] = useState(false);

  React.useEffect(() => {
    checkCurrentUser();
  }, []);

  const checkCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setIsCurrentUser(user?.id === message.user_id);
  };

  const bubbleScale = useAnimatedStyle(() => ({
    transform: [
      { scale: withSpring(showActions ? 1.02 : 1) }
    ]
  }));

  const actionsStyle = useAnimatedStyle(() => ({
    opacity: withTiming(showActions ? 1 : 0),
    transform: [
      { translateY: withTiming(showActions ? 0 : 20) }
    ]
  }));

  const handleLongPress = () => {
    setShowActions(true);
  };

  const handleLike = () => {
    setLiked(!liked);
    // Animate heart
    // TODO: Update like in database
  };

  const handleShare = () => {
    // Implement share functionality
  };

  const handleReply = () => {
    // Implement reply functionality
  };

  return (
    <View style={[styles.container, isCurrentUser && styles.containerRight]}>
      {!isCurrentUser && (
        <Image
          source={
            message.profiles.avatar_url
              ? { uri: message.profiles.avatar_url }
              : { uri: 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y' }
          }
          style={styles.avatar}
        />
      )}

      <View style={[styles.bubbleContainer, isCurrentUser && styles.bubbleContainerRight]}>
        {!isCurrentUser && (
          <Text style={styles.username}>{message.profiles.username}</Text>
        )}

        <AnimatedPressable 
          onLongPress={handleLongPress}
          onPress={() => setShowActions(false)}
          style={[styles.bubbleWrapper, bubbleScale]}>
          <View style={[styles.bubble, isCurrentUser && styles.bubbleRight]}>
            {message.type === 'image' && message.image_url ? (
              <Image
                source={{ uri: message.image_url }}
                style={styles.imageContent}
                resizeMode="cover"
              />
            ) : (
              <Text style={[
                styles.content,
                isCurrentUser && styles.contentRight
              ]}>
                {message.content}
              </Text>
            )}
            
            <Text style={[
              styles.timestamp,
              isCurrentUser && styles.timestampRight
            ]}>
              {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
            </Text>
          </View>

          <Animated.View style={[styles.actions, actionsStyle]}>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={handleLike}>
              <Heart 
                size={20} 
                color={liked ? '#FF4B4B' : '#666'} 
                fill={liked ? '#FF4B4B' : 'none'}
              />
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={handleReply}>
              <Reply size={20} color="#666" />
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={handleShare}>
              <Share2 size={20} color="#666" />
            </TouchableOpacity>
          </Animated.View>
        </AnimatedPressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    marginBottom: 16,
    alignItems: 'flex-end',
  },
  containerRight: {
    flexDirection: 'row-reverse',
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 8,
  },
  bubbleContainer: {
    flex: 1,
    maxWidth: '80%',
  },
  bubbleContainerRight: {
    alignItems: 'flex-end',
  },
  bubbleWrapper: {
    alignSelf: 'flex-start',
  },
  username: {
    color: '#888',
    fontSize: 12,
    marginBottom: 4,
    marginLeft: 12,
    fontFamily: 'Inter-Regular',
  },
  bubble: {
    backgroundColor: '#2A2A2A',
    borderRadius: 20,
    padding: 12,
    borderTopLeftRadius: 4,
  },
  bubbleRight: {
    backgroundColor: '#00FF9D',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 4,
  },
  content: {
    color: '#FFF',
    fontSize: 16,
    fontFamily: 'Inter-Regular',
  },
  contentRight: {
    color: '#000',
  },
  imageContent: {
    width: '100%',
    height: 200,
    borderRadius: 12,
  },
  timestamp: {
    color: '#666',
    fontSize: 10,
    marginTop: 4,
    fontFamily: 'Inter-Regular',
  },
  timestampRight: {
    color: '#1A1A1A',
  },
  actions: {
    flexDirection: 'row',
    marginTop: 8,
    backgroundColor: '#2A2A2A',
    borderRadius: 20,
    padding: 4,
    gap: 8,
  },
  actionButton: {
    padding: 8,
    borderRadius: 16,
    backgroundColor: '#1A1A1A',
  },
});