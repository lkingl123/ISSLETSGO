import React, { useContext } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { UserContext } from '../UserContext';

function HomeScreen() {
  const { user } = useContext(UserContext);

  return (
    <View style={styles.container}>
      {user ? (
        <View>
          <Text style={styles.title}>Welcome {user.displayName}!</Text>
        </View>
      ) : (
        <Text style={styles.noUserText}>No user information</Text>
      )}
    </View>
  );
}

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    maxWidth: 400,
    width: '100%',
    alignSelf: 'center',
    marginTop: -450,
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    textAlign: 'center',
  },
  noUserText: {
    fontSize: 18,
    color: 'gray',
    textAlign: 'center',
  },
});

export default HomeScreen;
