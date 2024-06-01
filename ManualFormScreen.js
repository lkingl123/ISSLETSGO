import React, { useState, useEffect } from 'react';
import { ScrollView, View, Text, Image, TextInput, Button, ActivityIndicator, TouchableOpacity, StyleSheet } from 'react-native';
import Modal from 'react-native-modal';
import useCall from './useCall'; // Ensure this path is correct
import { auth } from './firebaseConfig'; // Ensure this path is correct

const ManualFormScreen = ({ navigation }) => {
  const {
    isSingleCall,
    singleCallData,
    multipleCallsData,
    isMakingCall,
    toggleCallMode,
    handleSingleCallInputChange,
    handleMultipleCallsInputChange,
    handleMakeSingleCall,
    handleMakeMultipleCalls,
    handleAddForm,
    callSuccess,
    errorMessage,
  } = useCall();

  const formStyle = [styles.form, isSingleCall ? styles.singleCallForm : styles.multipleCallForm];
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalMessage, setModalMessage] = useState('');

  useEffect(() => {
    if (callSuccess) {
      setModalMessage("Call successful!");
      setIsModalVisible(true);
    }
  }, [callSuccess]);

  useEffect(() => {
    if (errorMessage) {
      setModalMessage(errorMessage);
      setIsModalVisible(true);
    }
  }, [errorMessage]);

  const toggleModal = () => {
    setIsModalVisible(!isModalVisible);
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollViewContent}>
      <View style={styles.container}>
        <View style={[styles.headerContainer, styles.logoContainer]}>
        </View>
        <View style={styles.body}>
          <View style={styles.options}>
            <Button title={isSingleCall ? 'Single Call' : 'Multiple Calls'} onPress={toggleCallMode} />
          </View>
          <View style={formStyle}>
            {isSingleCall ? (
              <>
                <TextInput
                  placeholder="First Name"
                  value={singleCallData.firstName}
                  onChangeText={(text) => handleSingleCallInputChange('firstName', text)}
                  style={styles.input}
                />
                <TextInput
                  placeholder="Last Name"
                  value={singleCallData.lastName}
                  onChangeText={(text) => handleSingleCallInputChange('lastName', text)}
                  style={styles.input}
                />
                <TextInput
                  placeholder="Email"
                  value={singleCallData.email}
                  onChangeText={(text) => handleSingleCallInputChange('email', text)}
                  style={styles.input}
                />
                <TextInput
                  placeholder="Phone Number"
                  value={singleCallData.phoneNumber}
                  onChangeText={(text) => handleSingleCallInputChange('phoneNumber', text)}
                  style={styles.input}
                />
                <View style={styles.buttonContainer}>
                  <Button title={isMakingCall ? 'Making Call...' : 'Make Call'} onPress={handleMakeSingleCall} disabled={isMakingCall} />
                </View>
                {isMakingCall && <ActivityIndicator size="large" color="#0000ff" />}
              </>
            ) : (
              <>
                {multipleCallsData.map((data, index) => (
                  <View key={index}>
                    <TextInput
                      placeholder="First Name"
                      value={data.firstName}
                      onChangeText={(text) => handleMultipleCallsInputChange(index, 'firstName', text)}
                      style={styles.input}
                    />
                    <TextInput
                      placeholder="Last Name"
                      value={data.lastName}
                      onChangeText={(text) => handleMultipleCallsInputChange(index, 'lastName', text)}
                      style={styles.input}
                    />
                    <TextInput
                      placeholder="Email"
                      value={data.email}
                      onChangeText={(text) => handleMultipleCallsInputChange(index, 'email', text)}
                      style={styles.input}
                    />
                    <TextInput
                      placeholder="Phone Number"
                      value={data.phoneNumber}
                      onChangeText={(text) => handleMultipleCallsInputChange(index, 'phoneNumber', text)}
                      style={styles.input}
                    />
                    {index !== multipleCallsData.length - 1 && <View style={styles.separator} />}
                  </View>
                ))}
                <Button title="Add Form" onPress={handleAddForm} />
                <View style={styles.buttonContainer}>
                  <Button title={isMakingCall ? 'Making Call...' : 'Make Call'} onPress={handleMakeMultipleCalls} disabled={isMakingCall} />
                </View>
                {isMakingCall && <ActivityIndicator size="large" color="#0000ff" />}
              </>
            )}
          </View>
        </View>
        <Modal isVisible={isModalVisible}>
          <View style={styles.modalContent}>
            <Text>{modalMessage}</Text>
            <TouchableOpacity onPress={toggleModal}>
              <Text style={styles.closeModal}>Close</Text>
            </TouchableOpacity>
          </View>
        </Modal>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollViewContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center', // Center the content vertically
    marginTop: -150, //this is where i move the screen viewing 
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  logoContainer: {
    alignItems: 'center',
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 20,
  },
  body: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center', // Center the content vertically
  },
  options: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 20,
  },
  form: {
    width: '100%',
  },
  singleCallForm: {
    // Custom styles for single call form
  },
  multipleCallForm: {
    // Custom styles for multiple call form
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
    marginTop: 10,
  },
  separator: {
    height: 1,
    backgroundColor: '#ccc',
    marginVertical: 10,
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
  uploadButton: {
    marginTop: 20,
  },
});

export default ManualFormScreen;
