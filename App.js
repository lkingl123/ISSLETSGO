import React, { useState, useEffect, useContext } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import LoginScreen from './Screens/LoginScreen';
import RegisterScreen from './Screens/RegisterScreen';
import HomeScreen from './Screens/HomeScreen';
import DrawerNavigator from './DrawerNavigator';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { UserProvider, UserContext } from './UserContext'; // Ensure this path is correct

const Stack = createStackNavigator();
const auth = getAuth();

function AppNavigator() {
  const { user } = useContext(UserContext);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    setIsAuthenticated(!!user);
  }, [user]);

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

function App() {
  return (
    <UserProvider>
      <AppNavigator />
    </UserProvider>
  );
}

export default App;