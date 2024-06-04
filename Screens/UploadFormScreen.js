import React, { useState } from 'react';
import { View, Text, ScrollView, ActivityIndicator, Button, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import ExcelJS from 'exceljs';
import Modal from 'react-native-modal';
import { initiateCall } from '../Service';

const UploadFormScreen = () => {
  const [excelData, setExcelData] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [callingIndex, setCallingIndex] = useState(null);

  const toggleModal = (message) => {
    setModalMessage(message);
    setIsModalVisible(!isModalVisible);
  };

  const handleFilePick = async () => {
    setLoading(true);
    let result = await DocumentPicker.getDocumentAsync({
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const fileUri = result.assets[0].uri;
      const response = await fetch(fileUri);
      const fileBlob = await response.blob();
      const reader = new FileReader();

      reader.onload = async (e) => {
        const arrayBuffer = e.target.result;
        const workbook = new ExcelJS.Workbook();
        try {
          await workbook.xlsx.load(arrayBuffer);
          const worksheet = workbook.worksheets[0];

          const jsonData = [];
          worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
            if (rowNumber > 1) { // Skip header row
              const rowValues = row.values;
              jsonData.push({
                first_name: rowValues[1],
                last_name: rowValues[2],
                email: rowValues[3],
                phone_number: rowValues[4]
              });
            }
          });

          if (jsonData.length === 0) {
            throw new Error('The uploaded file is empty or incorrectly formatted.');
          }

          setExcelData(jsonData);
          toggleModal("File uploaded successfully!");
        } catch (error) {
          toggleModal(`Error: ${error.message}`);
        } finally {
          setLoading(false);
        }
      };

      reader.readAsArrayBuffer(fileBlob);
    } else {
      setLoading(false);
    }
  };

  const handleCall = async (index) => {
    const data = excelData[index];
    const payload = {
      firstName: data.first_name,
      lastName: data.last_name,
      email: data.email,
      phoneNumber: data.phone_number,
    };

    setCallingIndex(index);
    try {
      const response = await initiateCall(payload);
      console.log("Call initiated successfully:", response);
      toggleModal('Call initiated successfully');
    } catch (error) {
      console.error("Failed to initiate call:", error);
      toggleModal('Failed to initiate call');
    } finally {
      setCallingIndex(null);
    }
  };

  const handleCancel = (index) => {
    const newData = [...excelData];
    newData.splice(index, 1);
    setExcelData(newData);
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollViewContent}>
      <View style={styles.container}>
        <Button title="Pick an Excel file" onPress={handleFilePick} />
        {loading && <ActivityIndicator size="large" color="#0000ff" marginTop="20" />}
        <ScrollView style={styles.dataContainer}>
          {excelData.map((item, index) => (
            <View key={index} style={styles.dataItem}>
              <Text style={styles.dataText}>First Name: {item.first_name}</Text>
              <Text style={styles.dataText}>Last Name: {item.last_name}</Text>
              <Text style={styles.dataText}>Email: {item.email}</Text>
              <Text style={styles.dataText}>Phone Number: {item.phone_number}</Text>
              <View style={styles.buttonContainer}>
                <Button
                  title={callingIndex === index ? 'Calling...' : 'Call'}
                  onPress={() => handleCall(index)}
                  disabled={callingIndex === index}
                />
                <Button
                  title="Cancel"
                  onPress={() => handleCancel(index)}
                />
              </View>
            </View>
          ))}
        </ScrollView>
        <Modal isVisible={isModalVisible}>
          <View style={styles.modalContent}>
            <Text>{modalMessage}</Text>
            <TouchableOpacity onPress={() => setIsModalVisible(false)}>
              <Text style={styles.closeModal}>Close</Text>
            </TouchableOpacity>
          </View>
        </Modal>
      </View>
    </ScrollView>
  );
};

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
  scrollViewContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
    maxWidth: 400,
    width: '100%',
    alignSelf: 'center',
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
  },
  dataContainer: {
    width: '100%',
    marginTop: 10,
  },
  dataItem: {
    marginBottom: 10,
    padding: 15,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    backgroundColor: '#f9f9f9',
  },
  dataText: {
    fontSize: 16,
    marginBottom: 5,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
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

export default UploadFormScreen;
