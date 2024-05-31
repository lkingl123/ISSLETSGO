// HomeScreen.js
import React from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';
import { getAuth, signOut } from 'firebase/auth';
import { auth } from './firebaseConfig'; // Ensure this path is correct

function HomeScreen() {
  const user = auth.currentUser;

  const handleLogout = () => {
    signOut(auth).catch((error) => {
      console.error('Error signing out: ', error);
    });
  };

  return (
    <View style={styles.container}>
      {user ? (
        <View>
          <Text style={styles.title}>Welcome, {user.email}!</Text>
          <Button title="Logout" onPress={handleLogout} />
        </View>
      ) : (
        <Text>No user information</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
  },
});

export default HomeScreen;