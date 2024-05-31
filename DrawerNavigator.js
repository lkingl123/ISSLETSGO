import React from 'react';
import { createDrawerNavigator, DrawerItemList } from '@react-navigation/drawer';
import HomeScreen from './HomeScreen';
import SettingsScreen from './SettingsScreen';
import { Button, View } from 'react-native';
import { getAuth, signOut } from 'firebase/auth';

const Drawer = createDrawerNavigator();
const auth = getAuth();

function CustomDrawerContent(props) {
  const handleLogout = () => {
    signOut(auth).then(() => {
      props.navigation.navigate('Login'); // Make sure 'Login' is accessible globally or adjust navigation
    }).catch((error) => {
      console.error('Error signing out: ', error);
    });
  };

  return (
    <View>
      <DrawerItemList {...props} />
      <Button title="Logout" onPress={handleLogout} color="#d11a2a" />
    </View>
  );
}

function DrawerNavigator() {
  return (
    <Drawer.Navigator drawerContent={(props) => <CustomDrawerContent {...props} />}>
      <Drawer.Screen name="Home" component={HomeScreen} />
      <Drawer.Screen name="Settings" component={SettingsScreen} />
    </Drawer.Navigator>
  );
}

export default DrawerNavigator;