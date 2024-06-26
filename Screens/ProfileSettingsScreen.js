import React, { useState, useContext } from 'react';
import { View, Text, TextInput, Button, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { updateProfile } from 'firebase/auth';
import { auth } from '../firebaseConfig'; // Ensure this path is correct
import Modal from 'react-native-modal';
import { UserContext } from '../UserContext';

function ProfileSettingsScreen({ navigation }) {
  const { user, setUser } = useContext(UserContext);
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
      setUser({ ...user, displayName: `${firstName} ${lastName}` });
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

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    maxWidth: 400,
    width: '100%',
    alignSelf: 'center',
    marginTop:-230,
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    width: '100%',
    marginBottom: 10,
    padding: 15,
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

export default ProfileSettingsScreen;
