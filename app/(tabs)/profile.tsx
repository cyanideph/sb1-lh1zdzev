import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { supabase } from '@/lib/supabase';
import { Database } from '@/types/supabase';
import * as ImagePicker from 'expo-image-picker';

type Profile = Database['public']['Tables']['profiles']['Row'];

export default function ProfileScreen() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      setProfile(data);
      setUsername(data.username);
      setAvatarUrl(data.avatar_url);
    } catch (err) {
      console.error('Error fetching profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const updates = {
        id: user.id,
        username,
        avatar_url: avatarUrl,
      };

      const { error } = await supabase.from('profiles').upsert(updates);
      if (error) throw error;
    } catch (err) {
      console.error('Error updating profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePickAvatar = async () => {
    try {
      setUploading(true);
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.8,
      });

      if (!result.canceled) {
        const { uri } = result.assets[0];
        const { data, error } = await supabase.storage
          .from('avatars')
          .upload(`public/${Date.now()}`, uri, {
            cacheControl: '3600',
            upsert: false,
          });

        if (error) throw error;
        const avatarUrl = supabase.storage.from('avatars').getPublicUrl(data.path).data.publicUrl;
        setAvatarUrl(avatarUrl);
      }
    } catch (err) {
      console.error('Error picking avatar:', err);
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#00FF9D" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={handlePickAvatar}>
        <Image
          source={avatarUrl ? { uri: avatarUrl } : require('@/assets/images/default-avatar.png')}
          style={styles.avatar}
        />
      </TouchableOpacity>
      <TextInput
        style={styles.input}
        value={username}
        onChangeText={setUsername}
        placeholder="Username"
        placeholderTextColor="#666"
      />
      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handleUpdateProfile}
        disabled={loading}>
        <Text style={styles.buttonText}>Update Profile</Text>
      </TouchableOpacity>
      <Text style={styles.status}>
        {profile?.is_online ? 'Online' : `Last seen: ${new Date(profile?.last_seen ?? '').toLocaleString()}`}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A1A1A',
    alignItems: 'center',
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 20,
  },
  input: {
    backgroundColor: '#2A2A2A',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    color: '#FFF',
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    width: '100%',
  },
  button: {
    backgroundColor: '#00FF9D',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
    width: '100%',
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'Inter-Bold',
  },
  status: {
    color: '#FFF',
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    marginTop: 20,
  },
});
