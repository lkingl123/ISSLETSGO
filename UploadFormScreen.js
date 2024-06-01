import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

function UploadFormScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Upload Form</Text>
      {/* Your form components will go here */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
  },
});

export default UploadFormScreen;