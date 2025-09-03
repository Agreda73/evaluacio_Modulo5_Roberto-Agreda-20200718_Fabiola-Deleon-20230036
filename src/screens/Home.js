import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList } from 'react-native';
import { db } from '../config/firebase';
import { collection, onSnapshot, getDocs } from 'firebase/firestore';
import CardUsuarios from '../components/CardUsuarios';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';

// Definición del componente principal Home
const Home = ({ navigation }) => {
    // Definición del estado local para almacenar los usuarios
    const [usuarios, setUsuarios] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Función para probar la conexión directamente
    const testFirebaseConnection = async () => {
        try {
            console.log('🔍 Testing Firebase connection...');
            // CAMBIO: Usar 'users' en lugar de 'usuarios'
            const usuariosRef = collection(db, 'users');
            const snapshot = await getDocs(usuariosRef);
            
            console.log('📊 Collection size:', snapshot.size);
            console.log('📊 Collection empty:', snapshot.empty);
            
            snapshot.forEach((doc) => {
                console.log('📄 Document ID:', doc.id);
                console.log('📄 Document data:', doc.data());
            });
            
            return snapshot.size;
        } catch (error) {
            console.error('❌ Firebase test error:', error);
            setError(error.message);
            return 0;
        }
    };

    // useEffect se ejecuta cuando el componente se monta
    useEffect(() => {
        console.log('🏠 Home component mounted');
        console.log('📊 DB object:', db);
        
        // Verify db exists before using it
        if (!db) {
            console.error('❌ Database object is not available');
            setError('Database not available');
            setLoading(false);
            return;
        }

        // Función para cargar usuarios
        const loadUsuarios = async () => {
            try {
                setLoading(true);
                setError(null);
                
                // Primero probamos la conexión directamente
                const count = await testFirebaseConnection();
                console.log(`🧮 Direct fetch found ${count} users`);

                // Ahora configuramos el listener en tiempo real
                console.log('📄 Setting up real-time listener...');
                
                const unsubscribe = onSnapshot(
                    // CAMBIO: Usar 'users' en lugar de 'usuarios'
                    collection(db, 'users'), 
                    (querySnapshot) => {
                        console.log('📄 Snapshot received');
                        console.log('📊 Snapshot size:', querySnapshot.size);
                        console.log('📊 Snapshot empty:', querySnapshot.empty);
                        
                        const docs = [];
                        querySnapshot.forEach((doc) => {
                            console.log('📄 Processing doc:', doc.id, doc.data());
                            const data = doc.data();
                            // Adaptación de datos para compatibilidad con CardUsuarios
                            docs.push({ 
                                id: doc.id, 
                                // Mapear los campos del nuevo formato al formato esperado por CardUsuarios
                                nombre: data.name || data.nombre,
                                correo: data.email || data.correo,
                                edad: data.age || data.edad,
                                especialidad: data.specialty || data.especialidad,
                                contraseña: data.password || data.contraseña,
                                ...data
                            });
                        });
                        
                        // Actualiza el estado de usuarios con los datos recibidos
                        setUsuarios(docs);
                        setLoading(false);
                        setError(null);
                        console.log(`👥 Successfully loaded ${docs.length} usuarios`);
                        
                        if (docs.length > 0) {
                            console.log('📋 First user sample:', docs[0]);
                        }
                    },
                    (error) => {
                        console.error('❌ Snapshot error:', error);
                        setError(`Error loading users: ${error.message}`);
                        setLoading(false);
                    }
                );

                // Limpieza de la suscripción al desmontar el componente
                return () => {
                    console.log('🧹 Cleaning up listener');
                    unsubscribe();
                };
            } catch (error) {
                console.error('❌ Setup error:', error);
                setError(`Setup error: ${error.message}`);
                setLoading(false);
            }
        };

        loadUsuarios();
    }, []);

    // Función para navegar a la pantalla 'Add'
    const goToAdd = () => { 
        console.log('➕ Navigating to Add screen');
        navigation.navigate('Add');
    };

    // Función para refrescar manualmente
    const handleRefresh = async () => {
        console.log('🔄 Manual refresh requested');
        await testFirebaseConnection();
    };

    // Función que renderiza cada item de la lista
    const renderItem = ({ item }) => {
        console.log('🎨 Rendering item:', item.id, item.nombre);
        return (
            <CardUsuarios
                id={item.id}
                nombre={item.nombre}
                correo={item.correo}
                edad={item.edad}
                especialidad={item.especialidad}
                contraseña={item.contraseña}
            />
        );
    };

    // Si hay un error, mostrar mensaje de error
    if (error) {
        return (
            <View style={[styles.container, styles.centerContent]}>
                <LinearGradient
                    colors={['#ff6b6b', '#ff5252']}
                    style={styles.errorCard}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                >
                    <Icon name="error" size={50} color="#fff" />
                    <Text style={styles.errorTitle}>Error de Conexión</Text>
                    <Text style={styles.errorText}>{error}</Text>
                    <TouchableOpacity 
                        style={styles.retryButton}
                        onPress={handleRefresh}
                    >
                        <Text style={styles.retryButtonText}>Reintentar</Text>
                    </TouchableOpacity>
                </LinearGradient>
            </View>
        );
    }

    if (loading) {
        return (
            <View style={[styles.container, styles.centerContent]}>
                <LinearGradient
                    colors={['#667eea', '#764ba2']}
                    style={styles.loadingCard}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                >
                    <Icon name="hourglass-empty" size={50} color="#fff" />
                    <Text style={styles.loadingText}>Cargando usuarios...</Text>
                </LinearGradient>
            </View>
        );
    }

    // Renderiza la interfaz del componente Home
    return (
        <View style={styles.container}>
            {/* Header simplificado con contador */}
            <LinearGradient
                colors={['#667eea', '#764ba2']}
                style={styles.headerCard}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
            >
                <View style={styles.headerContent}>
                    <View style={styles.titleContainer}>
                        <Icon name="people" size={32} color="#fff" />
                        <Text style={styles.headerTitle}>Panel de Usuarios</Text>
                        <TouchableOpacity 
                            style={styles.refreshButton}
                            onPress={handleRefresh}
                        >
                            <Icon name="refresh" size={24} color="#fff" />
                        </TouchableOpacity>
                    </View>
                    
                    <View style={styles.statsContainer}>
                        <View style={styles.statItem}>
                            <Text style={styles.statNumber}>{usuarios.length}</Text>
                            <Text style={styles.statLabel}>Total de Usuarios</Text>
                        </View>
                    </View>
                </View>
            </LinearGradient>

            {/* Lista de usuarios o mensaje si no hay */}
            {usuarios.length !== 0 ? (
                <FlatList
                    data={usuarios}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.list}
                    showsVerticalScrollIndicator={false}
                    refreshing={loading}
                    onRefresh={handleRefresh}
                />
            ) : (
                <View style={styles.emptyContainer}>
                    <LinearGradient
                        colors={['#f8f9fa', '#ffffff']}
                        style={styles.emptyCard}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                    >
                        <Icon name="group-add" size={80} color="#ccc" />
                        <Text style={styles.emptyTitle}>No hay usuarios registrados</Text>
                        <Text style={styles.emptySubtitle}>
                            Comienza registrando el primer usuario
                        </Text>
                        
                        <TouchableOpacity
                            style={styles.emptyButton}
                            onPress={goToAdd}
                            activeOpacity={0.8}
                        >
                            <LinearGradient
                                colors={['#4facfe', '#00f2fe']}
                                style={styles.emptyButtonGradient}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                            >
                                <Icon name="person-add" size={24} color="#fff" />
                                <Text style={styles.emptyButtonText}>Registrar Usuario</Text>
                            </LinearGradient>
                        </TouchableOpacity>
                    </LinearGradient>
                </View>
            )}

            {/* Botón flotante para agregar usuario - solo visible si hay usuarios */}
            {usuarios.length > 0 && (
                <TouchableOpacity
                    style={styles.fabButton}
                    onPress={goToAdd}
                    activeOpacity={0.8}
                >
                    <LinearGradient
                        colors={['#4facfe', '#00f2fe']}
                        style={styles.fabGradient}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                    >
                        <Icon name="person-add" size={28} color="#fff" />
                    </LinearGradient>
                </TouchableOpacity>
            )}
        </View>
    );
};

// Exporta el componente Home como predeterminado
export default Home;

// Estilos para el componente Home
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f7fa',
    },
    centerContent: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingCard: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: 40,
        margin: 20,
        borderRadius: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
        elevation: 15,
    },
    loadingText: {
        fontSize: 18,
        color: '#fff',
        marginTop: 15,
        fontWeight: '600',
    },
    errorCard: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: 40,
        margin: 20,
        borderRadius: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
        elevation: 15,
    },
    errorTitle: {
        fontSize: 20,
        color: '#fff',
        marginTop: 15,
        fontWeight: 'bold',
    },
    errorText: {
        fontSize: 14,
        color: '#fff',
        marginTop: 10,
        textAlign: 'center',
        opacity: 0.9,
    },
    retryButton: {
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 15,
        marginTop: 15,
    },
    retryButtonText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    headerCard: {
        margin: 20,
        borderRadius: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
        elevation: 15,
    },
    headerContent: {
        padding: 25,
    },
    titleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
        marginLeft: 15,
        flex: 1,
    },
    refreshButton: {
        padding: 8,
    },
    statsContainer: {
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        borderRadius: 15,
        padding: 20,
        alignItems: 'center',
    },
    statItem: {
        alignItems: 'center',
    },
    statNumber: {
        fontSize: 36,
        fontWeight: 'bold',
        color: '#fff',
    },
    statLabel: {
        fontSize: 16,
        color: 'rgba(255, 255, 255, 0.8)',
        marginTop: 5,
        textAlign: 'center',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    emptyCard: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: 40,
        borderRadius: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.1,
        shadowRadius: 15,
        elevation: 10,
        width: '100%',
    },
    emptyTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
        marginTop: 20,
        textAlign: 'center',
    },
    emptySubtitle: {
        fontSize: 16,
        color: '#666',
        marginTop: 10,
        marginBottom: 30,
        textAlign: 'center',
        lineHeight: 22,
    },
    emptyButton: {
        borderRadius: 25,
        overflow: 'hidden',
        shadowColor: '#4facfe',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 15,
        elevation: 8,
    },
    emptyButtonGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 15,
        paddingHorizontal: 30,
    },
    emptyButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
        marginLeft: 10,
    },
    list: {
        paddingBottom: 100,
    },
    fabButton: {
        position: 'absolute',
        bottom: 30,
        right: 30,
        width: 64,
        height: 64,
        borderRadius: 32,
        shadowColor: '#4facfe',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
        elevation: 15,
    },
    fabGradient: {
        width: '100%',
        height: '100%',
        borderRadius: 32,
        justifyContent: 'center',
        alignItems: 'center',
    },
});