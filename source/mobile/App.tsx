import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import HomeScreen from './src/screens/HomeScreen';
import ArtworkListScreen from './src/screens/ArtworkListScreen';
import ArtworkDetailScreen from './src/screens/ArtworkDetailScreen';
import AboutScreen from './src/screens/AboutScreen';
import ContactScreen from './src/screens/ContactScreen';

export type RootStackParamList = {
  Home: undefined;
  ArtworkList: undefined;
  ArtworkDetail: {artworkId: string};
  About: undefined;
  Contact: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();

function App(): React.JSX.Element {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{
          headerStyle: {
            backgroundColor: '#1a1a1a',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: '600',
          },
        }}>
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{title: 'Alexis Anibal Barros Contreras'}}
        />
        <Stack.Screen
          name="ArtworkList"
          component={ArtworkListScreen}
          options={{title: 'Portfolio'}}
        />
        <Stack.Screen
          name="ArtworkDetail"
          component={ArtworkDetailScreen}
          options={{title: 'Obra'}}
        />
        <Stack.Screen
          name="About"
          component={AboutScreen}
          options={{title: 'About'}}
        />
        <Stack.Screen
          name="Contact"
          component={ContactScreen}
          options={{title: 'Contact'}}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default App;

