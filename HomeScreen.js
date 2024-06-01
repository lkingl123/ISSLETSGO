import React, { useContext } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { UserContext } from './UserContext';

function HomeScreen() {
  const { user } = useContext(UserContext);

  return (
    <View style={styles.container}>
      {user ? (
        <View>
          <Text style={styles.title}>Welcome {user.displayName}!</Text>
        </View>
      ) : (
        <Text>No user information</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center', // Center the content vertically
    marginTop: -5, //this is where i move the screen viewing 
    },
  title: {
    fontSize: 24,
    marginBottom: 20,
  },
});

export default HomeScreen;