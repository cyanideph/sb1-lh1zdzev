import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

interface ErrorViewProps {
  icon: React.ReactNode;
  title: string;
  message: string;
  actionLabel: string;
  onAction: () => void;
}

export function ErrorView({ icon, title, message, actionLabel, onAction }: ErrorViewProps) {
  return (
    <View style={styles.container}>
      {icon}
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
      <TouchableOpacity style={styles.button} onPress={onAction}>
        <Text style={styles.buttonText}>{actionLabel}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A1A1A',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  title: {
    fontSize: 20,
    color: '#FFF',
    marginTop: 16,
    marginBottom: 8,
    fontFamily: 'Inter-Bold',
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    color: '#888',
    marginBottom: 24,
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#2A2A2A',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  buttonText: {
    color: '#00FF9D',
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
  },
});