import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, TouchableOpacity } from 'react-native';
import { updateProfile } from 'firebase/auth';
import { auth } from './firebaseConfig'; // Ensure this path is correct
import Modal from 'react-native-modal';

function SettingsScreen({ navigation }) {
  const user = auth.currentUser;
  const [firstName, setFirstName] = useState(user ? user.displayName.split(' ')[0] : '');
  const [lastName, setLastName] = useState(user ? user.displayName.split(' ')[1] : '');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalMessage, setModalMessage] = useState('');

  const toggleModal = (message) => {
    setModalMessage(message);
    setIsModalVisible(!isModalVisible);
  };

  const handleUpdateProfile = () => {
    if (!firstName || !lastName) {
      toggleModal("Please enter both first name and last name.");
      return;
    }

    updateProfile(user, {
      displayName: `${firstName} ${lastName}`,
    }).then(() => {
      toggleModal("Profile updated successfully.");
      // Force re-render of HomeScreen
      onAuthStateChanged(auth, (updatedUser) => {
        if (updatedUser) {
          auth.currentUser = updatedUser;
        }
      });
    }).catch((error) => {
      toggleModal(`Error: ${error.message}`);
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Profile Settings</Text>
      <TextInput
        style={styles.input}
        placeholder="First Name"
        value={firstName}
        onChangeText={setFirstName}
      />
      <TextInput
        style={styles.input}
        placeholder="Last Name"
        value={lastName}
        onChangeText={setLastName}
      />
      <View style={styles.buttonContainer}>
        <View style={[styles.buttonWrapper, styles.button]}>
          <Button title="Update Profile" onPress={handleUpdateProfile} />
        </View>
        <View style={[styles.buttonWrapper, styles.button]}>
          <Button title="Back to Home" onPress={() => navigation.navigate('Home')} />
        </View>
      </View>
      <Modal isVisible={isModalVisible}>
        <View style={styles.modalContent}>
          <Text>{modalMessage}</Text>
          <TouchableOpacity onPress={() => setIsModalVisible(false)}>
            <Text style={styles.closeModal}>Close</Text>
          </TouchableOpacity>
        </View>
      </Modal>
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
  input: {
    width: '100%',
    marginBottom: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  buttonWrapper: {
    flex: 1,
    marginHorizontal: 5,
  },
  button: {
    borderRadius: 10,
    overflow: 'hidden',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 22,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 4,
    borderColor: 'rgba(0, 0, 0, 0.1)',
  },
  closeModal: {
    marginTop: 10,
    color: 'blue',
  },
});

export default SettingsScreen;