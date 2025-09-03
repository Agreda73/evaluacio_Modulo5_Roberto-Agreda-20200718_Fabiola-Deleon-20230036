import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';

import LoginScreen from '../screens/Login'; 
import RegisterScreen from '../screens/Register'; 
import Home from '../screens/Home';
import Add from '../screens/Add';

const Stack = createNativeStackNavigator();

const Navigation = () => {
    return (
        <NavigationContainer>
            <Stack.Navigator initialRouteName="Home"> 
                <Stack.Screen 
                    name="Login" 
                    component={LoginScreen} 
                    options={{ headerShown: false }}
                />
                <Stack.Screen 
                    name="Register" 
                    component={RegisterScreen} 
                    options={{ headerShown: false }}
                />
                <Stack.Screen 
                    name="Home" 
                    component={Home} 
                    options={{ 
                        title: 'Panel de Usuarios',
                        headerStyle: {
                            backgroundColor: '#667eea',
                        },
                        headerTintColor: '#fff',
                        headerTitleStyle: {
                            fontWeight: 'bold',
                        },
                    }} 
                />
                <Stack.Screen 
                    name="Add" 
                    component={Add} 
                    options={{ 
                        presentation: 'modal', 
                        title: 'Registrar Usuario',
                        headerStyle: {
                            backgroundColor: '#667eea',
                        },
                        headerTintColor: '#fff',
                        headerTitleStyle: {
                            fontWeight: 'bold',
                        },
                    }}
                />
            </Stack.Navigator>
        </NavigationContainer>
    );
}

export default Navigation;