import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, TouchableOpacity } from 'react-native';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth } from './firebaseConfig'; // Ensure this path is correct
import Modal from 'react-native-modal';

function RegisterScreen({ navigation }) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalMessage, setModalMessage] = useState('');

  const toggleModal = (message) => {
    setModalMessage(message);
    setIsModalVisible(!isModalVisible);
  };

  const handleRegister = () => {
    console.log("Register button pressed");
    if (!firstName || !lastName || !email || !password || !confirmPassword) {
      toggleModal("Please fill in all fields.");
      return;
    }
    if (password !== confirmPassword) {
      toggleModal("Passwords do not match. Please try again.");
      return;
    }

    createUserWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        const user = userCredential.user;
        return updateProfile(user, {
          displayName: `${firstName} ${lastName}`,
        });
      })
      .then(() => {
        toggleModal("Registration Successful. You have registered successfully.");
        setTimeout(() => {
          setIsModalVisible(false);
          navigation.navigate('Home');
        }, 2000); // Close modal after 2 seconds and navigate to Home
      })
      .catch((error) => {
        console.log("Error during registration", error);
        const errorMessage = error.message;
        toggleModal(`Registration Failed: ${errorMessage}`);
      });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Register</Text>
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
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        secureTextEntry={true}
        value={password}
        onChangeText={setPassword}
      />
      <TextInput
        style={styles.input}
        placeholder="Confirm Password"
        secureTextEntry={true}
        value={confirmPassword}
        onChangeText={setConfirmPassword}
      />
      <View style={styles.buttonContainer}>
      <View style={[styles.buttonWrapper, styles.button]}>
          <Button title="Register" onPress={handleRegister} />
        </View>
        <View style={[styles.buttonWrapper, styles.button]}>
          <Button title="Back to Login" onPress={() => navigation.navigate('Login')} />
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

export default RegisterScreen;