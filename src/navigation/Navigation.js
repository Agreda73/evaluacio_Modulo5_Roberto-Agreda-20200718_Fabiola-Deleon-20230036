import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';

import LoginScreen from '../screens/Login'; 
import Home from '../screens/Home';
import Add from '../screens/Add';

const Stack = createNativeStackNavigator();

const Navigation = () => {
    return (
        <NavigationContainer>
            <Stack.Navigator initialRouteName="Login"> 
                <Stack.Screen 
                    name="Login" 
                    component={LoginScreen} 
                    options={{ headerShown: false }} // Oculta el header si quieres
                />
                <Stack.Screen 
                    name="Home" 
                    component={Home} 
                    options={{ title: 'Home' }} 
                />
                <Stack.Screen 
                    name="Add" 
                    component={Add} 
                    options={{ presentation: 'modal', title: 'Agregar productos' }}
                />
            </Stack.Navigator>
        </NavigationContainer>
    );
}

export default Navigation;
