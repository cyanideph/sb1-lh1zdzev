import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView } from 'react-native';
import { Plus } from 'lucide-react-native';
import { supabase } from '@/lib/supabase';
import { regions } from '@/constants/regions';

export default function RoomsScreen() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('');
  const [selectedProvince, setSelectedProvince] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleCreateRoom = async () => {
    if (!name || !selectedRegion || !selectedProvince) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { error: roomError } = await supabase.from('chatrooms').insert({
        name,
        description,
        region: selectedRegion,
        province: selectedProvince,
        created_by: user.id,
      });

      if (roomError) throw roomError;

      setShowCreateModal(false);
      setName('');
      setDescription('');
      setSelectedRegion('');
      setSelectedProvince('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Create Room</Text>
        <TouchableOpacity
          style={styles.createButton}
          onPress={() => setShowCreateModal(true)}>
          <Plus color="#00FF9D" size={24} />
        </TouchableOpacity>
      </View>

      {showCreateModal && (
        <ScrollView style={styles.modal}>
          {error && <Text style={styles.error}>{error}</Text>}

          <Text style={styles.label}>Room Name *</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Enter room name"
            placeholderTextColor="#666"
          />

          <Text style={styles.label}>Description</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={description}
            onChangeText={setDescription}
            placeholder="Enter room description"
            placeholderTextColor="#666"
            multiline
            numberOfLines={4}
          />

          <Text style={styles.label}>Region *</Text>
          <ScrollView style={styles.pickerContainer} horizontal showsHorizontalScrollIndicator={false}>
            {Object.keys(regions).map((region) => (
              <TouchableOpacity
                key={region}
                style={[
                  styles.regionButton,
                  selectedRegion === region && styles.regionButtonActive,
                ]}
                onPress={() => {
                  setSelectedRegion(region);
                  setSelectedProvince('');
                }}>
                <Text
                  style={[
                    styles.regionButtonText,
                    selectedRegion === region && styles.regionButtonTextActive,
                  ]}>
                  {region}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {selectedRegion && (
            <>
              <Text style={styles.label}>Province *</Text>
              <ScrollView style={styles.pickerContainer} horizontal showsHorizontalScrollIndicator={false}>
                {regions[selectedRegion].map((province) => (
                  <TouchableOpacity
                    key={province}
                    style={[
                      styles.regionButton,
                      selectedProvince === province && styles.regionButtonActive,
                    ]}
                    onPress={() => setSelectedProvince(province)}>
                    <Text
                      style={[
                        styles.regionButtonText,
                        selectedProvince === province && styles.regionButtonTextActive,
                      ]}>
                      {province}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </>
          )}

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setShowCreateModal(false)}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.submitButton, loading && styles.buttonDisabled]}
              onPress={handleCreateRoom}
              disabled={loading}>
              <Text style={styles.submitButtonText}>
                {loading ? 'Creating...' : 'Create Room'}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFF',
    fontFamily: 'Inter-Bold',
  },
  createButton: {
    backgroundColor: '#2A2A2A',
    padding: 12,
    borderRadius: 12,
  },
  modal: {
    flex: 1,
    padding: 20,
  },
  label: {
    color: '#FFF',
    fontSize: 16,
    marginBottom: 8,
    fontFamily: 'Inter-SemiBold',
  },
  input: {
    backgroundColor: '#2A2A2A',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    color: '#FFF',
    fontSize: 16,
    fontFamily: 'Inter-Regular',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  pickerContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  regionButton: {
    backgroundColor: '#2A2A2A',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginRight: 8,
  },
  regionButtonActive: {
    backgroundColor: '#00FF9D',
  },
  regionButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontFamily: 'Inter-Regular',
  },
  regionButtonTextActive: {
    color: '#000',
    fontFamily: 'Inter-SemiBold',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
  },
  cancelButton: {
    flex: 1,
    padding: 16,
    marginRight: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#444',
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontFamily: 'Inter-Regular',
  },
  submitButton: {
    flex: 1,
    backgroundColor: '#00FF9D',
    padding: 16,
    marginLeft: 8,
    borderRadius: 12,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'Inter-Bold',
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  error: {
    color: '#FF4444',
    marginBottom: 16,
    textAlign: 'center',
    fontFamily: 'Inter-Regular',
  },
});