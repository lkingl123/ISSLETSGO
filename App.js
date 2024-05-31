import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import LoginScreen from './LoginScreen';
import RegisterScreen from './RegisterScreen';
import HomeScreen from './HomeScreen';
import DrawerNavigator from './DrawerNavigator';
import { getAuth, onAuthStateChanged } from 'firebase/auth';

const Stack = createStackNavigator();
const auth = getAuth();

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, user => {
      setIsAuthenticated(!!user);
    });
    return () => unsubscribe();
  }, []);

  return (
    <NavigationContainer>
      <Stack.Navigator>
        {isAuthenticated ? (
          <Stack.Screen 
            name="Drawer" 
            component={DrawerNavigator} 
            options={{ headerShown: false }} // Drawer navigation typically does not have a header
          />
        ) : (
          <>
            <Stack.Screen 
              name="Login" 
              component={LoginScreen} 
              options={{ headerShown: true, title: 'Login' }} // Header shown with title 'Login'
            />
            <Stack.Screen 
              name="Register" 
              component={RegisterScreen} 
              options={{ headerShown: true, title: 'Register' }} // Header shown with title 'Register'
            />
            <Stack.Screen 
              name="Home" 
              component={HomeScreen} 
              options={{ headerShown: true, title: 'Home' }} // Header shown with title 'Home'
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default App;