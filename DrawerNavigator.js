import React from 'react';
import { createDrawerNavigator, DrawerItemList } from '@react-navigation/drawer';
import HomeScreen from './Screens/HomeScreen';
import SettingsScreen from './Screens/ProfileSettingsScreen';
import ManualFormScreen from './Screens/ManualFormScreen'; 
import UploadFormScreen from './Screens/UploadFormScreen';
import PaymentScreen from './Screens/PaymentScreen';
import { Button, View, StyleSheet } from 'react-native';
import { signOut } from 'firebase/auth';
import { auth } from './firebaseConfig'; 


const Drawer = createDrawerNavigator();

function CustomDrawerContent(props) {
  const handleLogout = () => {
    signOut(auth)
      .then(() => {

      })
      .catch((error) => {
        console.error('Error signing out: ', error);
      });
  };

  const user = auth.currentUser;

  return (
    <View style={styles.container}>
      <DrawerItemList {...props} />
      {user && (
        <View style={styles.logoutButton}>
          <Button title="Logout" onPress={handleLogout} color="#d11a2a" />
        </View>
      )}
    </View>
  );
}

function DrawerNavigator() {
  return (
    <Drawer.Navigator drawerContent={(props) => <CustomDrawerContent {...props} />}>
      <Drawer.Screen name="Home" component={HomeScreen} />
      <Drawer.Screen name="Manual Form" component={ManualFormScreen} />
      <Drawer.Screen name="Upload Form" component={UploadFormScreen} />
      <Drawer.Screen name="Profile Settings" component={SettingsScreen} />
      <Drawer.Screen name="Payment Settings" component={PaymentScreen} />
    </Drawer.Navigator>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  logoutButton: {
    padding: 20,
    borderTopWidth: 1,
    borderColor: '#ccc',
  },
});

export default DrawerNavigator;