import React, { useContext } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { UserContext } from './UserContext';

function HomeScreen() {
  const { user } = useContext(UserContext);

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