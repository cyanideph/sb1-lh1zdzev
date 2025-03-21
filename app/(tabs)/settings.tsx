import React from 'react';
import { View, Text, StyleSheet, Switch } from 'react-native';

export default function SettingsScreen() {
  const [notificationsEnabled, setNotificationsEnabled] = React.useState(false);
  const [darkModeEnabled, setDarkModeEnabled] = React.useState(false);

  const toggleNotifications = () => setNotificationsEnabled((previousState) => !previousState);
  const toggleDarkMode = () => setDarkModeEnabled((previousState) => !previousState);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Settings</Text>
      <View style={styles.settingItem}>
        <Text style={styles.settingText}>Enable Notifications</Text>
        <Switch
          trackColor={{ false: '#767577', true: '#00FF9D' }}
          thumbColor={notificationsEnabled ? '#00FF9D' : '#f4f3f4'}
          onValueChange={toggleNotifications}
          value={notificationsEnabled}
        />
      </View>
      <View style={styles.settingItem}>
        <Text style={styles.settingText}>Enable Dark Mode</Text>
        <Switch
          trackColor={{ false: '#767577', true: '#00FF9D' }}
          thumbColor={darkModeEnabled ? '#00FF9D' : '#f4f3f4'}
          onValueChange={toggleDarkMode}
          value={darkModeEnabled}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A1A1A',
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFF',
    fontFamily: 'Inter-Bold',
    marginBottom: 20,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  settingText: {
    color: '#FFF',
    fontSize: 16,
    fontFamily: 'Inter-Regular',
  },
});
