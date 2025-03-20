import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { regions } from '@/constants/regions';
import { router } from 'expo-router';

export default function RoomsScreen() {
  const handleProvinceClick = (province: string) => {
    router.push(`/chatroom/${province}`);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Provinces</Text>
      </View>

      <ScrollView contentContainerStyle={styles.listContainer}>
        {Object.entries(regions).map(([region, provinces]) => (
          <View key={region} style={styles.regionContainer}>
            <Text style={styles.regionTitle}>{region}</Text>
            {provinces.map((province) => (
              <TouchableOpacity key={province} style={styles.provinceCard} onPress={() => handleProvinceClick(province)}>
                <Text style={styles.provinceName}>{province}</Text>
              </TouchableOpacity>
            ))}
          </View>
        ))}
      </ScrollView>
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
  regionContainer: {
    marginBottom: 24,
  },
  regionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 12,
    fontFamily: 'Inter-Bold',
  },
  provinceCard: {
    backgroundColor: '#2A2A2A',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  provinceName: {
    fontSize: 18,
    color: '#FFF',
    fontFamily: 'Inter-Regular',
  },
});