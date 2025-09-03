import React, { useState, useEffect } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../config/firebase';

import OceanSplashScreen from '../screens/OceanSplashScreen';
import LoginScreen from '../screens/Login'; 
import RegisterScreen from '../screens/Register'; 
import Home from '../screens/Home';
import Add from '../screens/Add';

const Stack = createNativeStackNavigator();

const Navigation = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [showSplash, setShowSplash] = useState(true);
    const [user, setUser] = useState(null);

    useEffect(() => {
        // Configurar listener de autenticación
        const unsubscribe = onAuthStateChanged(auth, (authUser) => {
            console.log('Auth state changed:', authUser ? 'User logged in' : 'User logged out');
            setUser(authUser);
            setIsLoading(false);
        });

        return unsubscribe;
    }, []);

    // Función para finalizar splash screen
    const handleSplashFinish = () => {
        console.log('Splash screen finished');
        setShowSplash(false);
    };

    // Mostrar splash screen
    if (showSplash) {
        return <OceanSplashScreen onFinish={handleSplashFinish} />;
    }

    return (
        <NavigationContainer>
            <Stack.Navigator 
                screenOptions={{ 
                    headerShown: false,
                    animation: 'slide_from_right'
                }}
            >
                {user ? (
                    // Usuario autenticado - mostrar pantallas principales
                    <>
                        <Stack.Screen 
                            name="Home" 
                            component={Home} 
                            options={{ 
                                headerShown: true,
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
                                headerShown: true,
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
                    </>
                ) : (
                    // Usuario no autenticado - mostrar pantallas de auth
                    <>
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
                    </>
                )}
            </Stack.Navigator>
        </NavigationContainer>
    );
}

export default Navigation;