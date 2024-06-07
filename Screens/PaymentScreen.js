// PaymentScreen.js
import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Alert } from 'react-native';
import { PayPalButtons, PayPalScriptProvider } from '@paypal/react-paypal-js';

const CLIENT_ID = 'AeTWExkh_wQIt1Sm91ml0NTAJ2YR77araovottV1fI-2lNYVOsSkYqeG6wTI_aGsljMs2-Iv_coOiMuQ'; // Replace with your actual Client ID

export default function PaymentScreen() {
  const [amountOwed, setAmountOwed] = useState('10.00'); // Example amount owed

  const createOrder = (data, actions) => {
    return actions.order.create({
      purchase_units: [{
        amount: {
          currency_code: 'USD',
          value: amountOwed
        }
      }]
    });
  };

  const onApprove = (data, actions) => {
    return actions.order.capture().then(details => {
      Alert.alert('Payment Successful', `Transaction completed by ${details.payer.name.given_name}`);
      // Update amount owed or perform other actions as needed
    }).catch(error => {
      Alert.alert('Payment Error', error.message);
    });
  };

  return (
    <PayPalScriptProvider options={{ "client-id": CLIENT_ID, locale: 'en_US', "disable-funding": "paylater,venmo" }}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.amountOwed}>Amount Owed: ${amountOwed}</Text>
        <View style={styles.paypalContainer}>
          <PayPalButtons
            fundingSource="card"
            createOrder={createOrder}
            onApprove={onApprove}
            style={{ layout: 'vertical' }}
          />
        </View>
      </ScrollView>
    </PayPalScriptProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    padding: 16,
    alignItems: 'center',
  },
  amountOwed: {
    fontSize: 24,
    textAlign: 'center',
  },
  paypalContainer: {
    width: '100%',
    maxWidth: 600,
    alignItems: 'center',
    marginTop: 20,
  },
});

