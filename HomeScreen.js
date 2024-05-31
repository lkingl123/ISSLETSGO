import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';
import { getAuth, signOut, onAuthStateChanged } from 'firebase/auth';
import { useNavigation } from '@react-navigation/native';

function HomeScreen() {
  const navigation = useNavigation();
  const auth = getAuth();
  const user = auth.currentUser;

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) {
        // Redirect to the login screen if not logged in
        navigation.replace('Login');
      }
    });
    return unsubscribe; // Cleanup subscription
  }, [navigation]);

  const handleLogout = () => {
    signOut(auth).then(() => {
      // Navigation to login screen handled by onAuthStateChanged listener
    }).catch((error) => {
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
