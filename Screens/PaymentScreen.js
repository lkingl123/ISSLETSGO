// PaymentScreen.js
import React from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { PayPalButtons, PayPalScriptProvider } from '@paypal/react-paypal-js';

const CLIENT_ID = 'AeTWExkh_wQIt1Sm91ml0NTAJ2YR77araovottV1fI-2lNYVOsSkYqeG6wTI_aGsljMs2-Iv_coOiMuQ'; // Replace with your actual Client ID

export default function PaymentScreen() {
  const createOrder = (data, actions) => {
    return actions.order.create({
      purchase_units: [{
        amount: {
          currency_code: 'USD',
          value: '10.00' // Example amount
        }
      }]
    });
  };

  const onApprove = (data, actions) => {
    return actions.order.capture().then(details => {
      Alert.alert('Payment Successful', `Transaction completed by ${details.payer.name.given_name}`);
    }).catch(error => {
      Alert.alert('Payment Error', error.message);
    });
  };

  return (
    <PayPalScriptProvider options={{ "client-id": CLIENT_ID, locale: 'en_US', "disable-funding": "paylater" }}>
      <View style={styles.container}>
        <PayPalButtons
          createOrder={createOrder}
          onApprove={onApprove}
          style={{ layout: 'vertical' }}
        />
      </View>
    </PayPalScriptProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    alignSelf: 'center',
    justifyContent: 'center',
    padding: 16,
  }
});
