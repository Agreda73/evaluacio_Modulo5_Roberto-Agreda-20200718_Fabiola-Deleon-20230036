// screens/Home.js - FIXED VERSION
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList } from 'react-native';
import { db } from '../config/firebase'; // ✅ CORRECTED: Changed from 'database' to 'db'
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore';
import CardProductos from '../components/CardProductos';

// Definición del componente principal Home
const Home = ({ navigation }) => {
    // Definición del estado local para almacenar los productos
    const [productos, setProductos] = useState([]);

    // useEffect se ejecuta cuando el componente se monta
    useEffect(() => {
        console.log(' Home component mounted');
        console.log(' DB object:', db);
        
        // Verify db exists before using it
        if (!db) {
            console.error('❌ Database object is not available');
            return;
        }

        try {
            // Define una consulta a la colección 'productos' en Firestore, ordenada por el campo 'creado' en orden descendente
            const q = query(collection(db, 'productos'), orderBy('creado', 'desc')); // ✅ CORRECTED: Changed from 'database' to 'db'
            
            console.log(' Setting up Firestore listener for productos collection');
            
            // Escucha cambios en la consulta de Firestore en tiempo real
            const unsubscribe = onSnapshot(q, 
                (querySnapshot) => {
                    const docs = [];
                    querySnapshot.forEach((doc) => {
                        // Empuja cada documento con su ID a la lista de docs
                        docs.push({ id: doc.id, ...doc.data() });
                    });
                    // Actualiza el estado de productos con los datos recibidos
                    setProductos(docs);
                    console.log(`📊 Found ${docs.length} productos`);
                },
                (error) => {
                    console.error('❌ Error in productos listener:', error);
                }
            );

            // Limpieza de la suscripción al desmontar el componente
            return () => {
                console.log('🧹 Cleaning up productos listener');
                unsubscribe();
            };
        } catch (error) {
            console.error('❌ Error setting up productos listener:', error);
        }
    }, []);

    // Función para navegar a la pantalla 'Add'
    const goToAdd = () => { 
        console.log('➕ Navigating to Add screen');
        navigation.navigate('Add');
    }

    // Función que renderiza cada item de la lista
    const renderItem = ({ item }) => (
        <CardProductos
            id={item.id}
            nombre={item.nombre}
            precio={item.precio}
            vendido={item.vendido}
            imagen={item.imagen}
        />
    );

    // Renderiza la interfaz del componente Home
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Productos Disponibles</Text>

            {/* Muestra la lista de productos si hay elementos, de lo contrario muestra un mensaje */}
            {
                productos.length !== 0 ?
                <FlatList
                    data={productos}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.list}
                />
                : 
                <Text style={styles.Subtitle}>No hay productos disponibles</Text>
            }

            {/* Botón para navegar a la pantalla de agregar productos */}
            <TouchableOpacity
                style={styles.Button}
                onPress={goToAdd}>
                <Text style={styles.ButtonText}>Agregar Producto</Text>
            </TouchableOpacity>
        </View>
    );
};

// Exporta el componente Home como predeterminado
export default Home;

// Estilos para el componente Home
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FEFEFE',
        justifyContent: 'center',
        padding: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 20,
    },
    Subtitle: {
        fontSize: 20,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 10,
        color:'#ff9800'
    },
    Button: {
        backgroundColor: '#0288d1',
        padding: 10,
        borderRadius: 5,
        marginTop: 20,
        marginHorizontal: 50,
        paddingVertical: 20,
    },
    ButtonText: {
        color: 'white',
        fontWeight: 'bold',
        textAlign: 'center',
    },
    list: {
        flexGrow: 1,
    },
});