import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { auth } from './firebaseConfig'; // Ensure this path is correct
import { onAuthStateChanged } from 'firebase/auth';

function HomeScreen() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    return () => unsubscribe();
  }, []);

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