// HomeScreen.js
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { auth } from './firebaseConfig'; // Ensure this path is correct

function HomeScreen() {
  const user = auth.currentUser;

  return (
    <View style={styles.container}>
      {user ? (
        <View>
          <Text style={styles.title}>Welcome, {user.displayName}!</Text>
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