import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TextInput, Alert, ScrollView, Modal, FlatList } from 'react-native';
import { db } from '../config/firebase';
import { collection, addDoc } from 'firebase/firestore';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';

// Componente Add para agregar un nuevo usuario
const Add = ({ navigation }) => {
    // Estado inicial del usuario
    const [usuario, setUsuario] = useState({
        nombre: '',
        correo: '',
        contraseña: '',
        edad: '',
        especialidad: ''
    });

    const [loading, setLoading] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);

    const specialties = [
        { label: 'Selecciona una especialidad', value: '' },
        { label: 'Software', value: 'Software' },
        { label: 'Diseño', value: 'Diseño' },
        { label: 'Emca', value: 'Emca' },
        { label: 'Arquitectura', value: 'Arquitectura' },
        { label: 'Contaduría', value: 'Contaduría' }
    ];

    // Función para navegar a la pantalla de inicio
    const goToHome = () => {
        navigation.goBack();
    };

    // Función para manejar cambios en los campos
    const handleInputChange = (field, value) => {
        setUsuario(prev => ({
            ...prev,
            [field]: value
        }));
    };

    // Función para seleccionar especialidad
    const selectSpecialty = (value) => {
        setUsuario(prev => ({
            ...prev,
            especialidad: value
        }));
        setModalVisible(false);
    };

    // Función para obtener iconos según la especialidad
    const getSpecialtyIcon = (specialty) => {
        const icons = {
            'Software': 'computer',
            'Diseño': 'palette',
            'Emca': 'business',
            'Arquitectura': 'home',
            'Contaduría': 'account-balance',
            '': 'work'
        };
        return icons[specialty] || 'work';
    };

    // Función para validar el formulario
    const validateForm = () => {
        const { nombre, correo, contraseña, edad, especialidad } = usuario;

        if (!nombre.trim() || !correo.trim() || !contraseña.trim() || !edad.trim() || !especialidad.trim()) {
            Alert.alert('Error', 'Todos los campos son obligatorios');
            return false;
        }

        if (!correo.includes('@')) {
            Alert.alert('Error', 'Por favor ingresa un correo válido');
            return false;
        }

        if (contraseña.length < 6) {
            Alert.alert('Error', 'La contraseña debe tener al menos 6 caracteres');
            return false;
        }

        if (isNaN(edad) || parseInt(edad) < 18) {
            Alert.alert('Error', 'La edad debe ser un número mayor a 18');
            return false;
        }

        if (!especialidad) {
            Alert.alert('Error', 'Por favor selecciona una especialidad');
            return false;
        }

        return true;
    };

    // Función para agregar el usuario a Firestore
    const agregarUsuario = async () => {
        if (!validateForm()) return;

        setLoading(true);
        try {
            await addDoc(collection(db, 'usuarios'), {
                nombre: usuario.nombre.trim(),
                correo: usuario.correo.trim().toLowerCase(),
                contraseña: usuario.contraseña,
                edad: parseInt(usuario.edad),
                especialidad: usuario.especialidad
            });

            Alert.alert('Éxito', 'Usuario registrado correctamente', [
                { 
                    text: 'Ok', 
                    onPress: () => {
                        // Limpiar formulario
                        setUsuario({
                            nombre: '',
                            correo: '',
                            contraseña: '',
                            edad: '',
                            especialidad: ''
                        });
                        goToHome();
                    }
                },
            ]);

        } catch (error) {
            console.error('Error al registrar el usuario', error);
            Alert.alert('Error', 'Ocurrió un error al registrar el usuario. Por favor, intenta nuevamente.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
            <View style={styles.container}>
                {/* Header */}
                <LinearGradient
                    colors={['#667eea', '#764ba2']}
                    style={styles.headerCard}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                >
                    <View style={styles.headerContent}>
                        <Icon name="person-add" size={32} color="#fff" />
                        <Text style={styles.headerTitle}>Registrar Usuario</Text>
                    </View>
                </LinearGradient>

                {/* Formulario */}
                <View style={styles.formCard}>
                    {/* Campo Nombre */}
                    <View style={styles.inputSection}>
                        <Text style={styles.label}>
                            <Icon name="person" size={16} color="#667eea" /> Nombre Completo
                        </Text>
                        <View style={styles.inputContainer}>
                            <Icon name="person" size={20} color="#667eea" style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder="Ingresa tu nombre completo"
                                placeholderTextColor="#999"
                                value={usuario.nombre}
                                onChangeText={(value) => handleInputChange('nombre', value)}
                            />
                        </View>
                    </View>

                    {/* Campo Correo */}
                    <View style={styles.inputSection}>
                        <Text style={styles.label}>
                            <Icon name="email" size={16} color="#667eea" /> Correo Electrónico
                        </Text>
                        <View style={styles.inputContainer}>
                            <Icon name="email" size={20} color="#667eea" style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder="ejemplo@correo.com"
                                placeholderTextColor="#999"
                                value={usuario.correo}
                                onChangeText={(value) => handleInputChange('correo', value)}
                                keyboardType="email-address"
                                autoCapitalize="none"
                            />
                        </View>
                    </View>

                    {/* Campo Contraseña */}
                    <View style={styles.inputSection}>
                        <Text style={styles.label}>
                            <Icon name="lock" size={16} color="#667eea" /> Contraseña
                        </Text>
                        <View style={styles.inputContainer}>
                            <Icon name="lock" size={20} color="#667eea" style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder="Mínimo 6 caracteres"
                                placeholderTextColor="#999"
                                value={usuario.contraseña}
                                onChangeText={(value) => handleInputChange('contraseña', value)}
                                secureTextEntry
                            />
                        </View>
                    </View>

                    {/* Campo Edad */}
                    <View style={styles.inputSection}>
                        <Text style={styles.label}>
                            <Icon name="cake" size={16} color="#667eea" /> Edad
                        </Text>
                        <View style={styles.inputContainer}>
                            <Icon name="cake" size={20} color="#667eea" style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder="Ingresa tu edad"
                                placeholderTextColor="#999"
                                value={usuario.edad}
                                onChangeText={(value) => handleInputChange('edad', value)}
                                keyboardType="numeric"
                            />
                        </View>
                    </View>

                    {/* Campo Especialidad */}
                    <View style={styles.inputSection}>
                        <Text style={styles.label}>
                            <Icon name="work" size={16} color="#667eea" /> Especialidad
                        </Text>
                        <TouchableOpacity 
                            style={styles.inputContainer}
                            onPress={() => setModalVisible(true)}
                        >
                            <Icon name="work" size={20} color="#667eea" style={styles.inputIcon} />
                            <Text style={[
                                styles.specialtyText, 
                                !usuario.especialidad && styles.placeholder
                            ]}>
                                {usuario.especialidad || 'Selecciona una especialidad'}
                            </Text>
                            <Icon name="arrow-drop-down" size={24} color="#667eea" />
                        </TouchableOpacity>
                    </View>

                    {/* Botones de acción */}
                    <View style={styles.buttonSection}>
                        {/* Botón Registrar */}
                        <TouchableOpacity 
                            style={styles.primaryButton} 
                            onPress={agregarUsuario}
                            disabled={loading}
                            activeOpacity={0.8}
                        >
                            <LinearGradient
                                colors={loading ? ['#ccc', '#999'] : ['#4facfe', '#00f2fe']}
                                style={styles.primaryButtonGradient}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                            >
                                {loading ? (
                                    <Icon name="hourglass-empty" size={20} color="#fff" />
                                ) : (
                                    <Icon name="check-circle" size={20} color="#fff" />
                                )}
                                <Text style={styles.primaryButtonText}>
                                    {loading ? 'Registrando...' : 'Registrar Usuario'}
                                </Text>
                            </LinearGradient>
                        </TouchableOpacity>

                        {/* Botón Volver */}
                        <TouchableOpacity 
                            style={styles.secondaryButton}
                            onPress={goToHome}
                            activeOpacity={0.8}
                            disabled={loading}
                        >
                            <View style={styles.secondaryButtonContent}>
                                <Icon name="arrow-back" size={20} color="#667eea" />
                                <Text style={styles.secondaryButtonText}>Volver a Home</Text>
                            </View>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Modal para seleccionar especialidad */}
                <Modal
                    animationType="slide"
                    transparent={true}
                    visible={modalVisible}
                    onRequestClose={() => setModalVisible(false)}
                >
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalContent}>
                            <View style={styles.modalHeader}>
                                <Text style={styles.modalTitle}>Selecciona tu especialidad</Text>
                                <TouchableOpacity 
                                    onPress={() => setModalVisible(false)}
                                    style={styles.closeButton}
                                >
                                    <Icon name="close" size={24} color="#666" />
                                </TouchableOpacity>
                            </View>
                            
                            <FlatList
                                data={specialties}
                                keyExtractor={(item) => item.value}
                                renderItem={({ item }) => (
                                    <TouchableOpacity
                                        style={[
                                            styles.specialtyOption,
                                            usuario.especialidad === item.value && styles.selectedOption
                                        ]}
                                        onPress={() => selectSpecialty(item.value)}
                                        disabled={!item.value} // Deshabilitar la opción placeholder
                                    >
                                        <Icon 
                                            name={getSpecialtyIcon(item.value)} 
                                            size={20} 
                                            color={usuario.especialidad === item.value ? '#4facfe' : '#666'} 
                                            style={styles.optionIcon}
                                        />
                                        <Text style={[
                                            styles.specialtyOptionText,
                                            usuario.especialidad === item.value && styles.selectedOptionText,
                                            !item.value && styles.placeholderOption
                                        ]}>
                                            {item.label}
                                        </Text>
                                        {usuario.especialidad === item.value && (
                                            <Icon name="check" size={20} color="#4facfe" />
                                        )}
                                    </TouchableOpacity>
                                )}
                            />
                        </View>
                    </View>
                </Modal>
            </View>
        </ScrollView>
    );
};

export default Add;

// Estilos del componente
const styles = StyleSheet.create({
    scrollContainer: {
        flex: 1,
        backgroundColor: '#f5f7fa',
    },
    container: {
        flex: 1,
        padding: 20,
        paddingBottom: 40,
    },
    headerCard: {
        borderRadius: 20,
        padding: 25,
        marginBottom: 25,
        shadowColor: '#667eea',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
        elevation: 15,
    },
    headerContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
        marginLeft: 15,
    },
    formCard: {
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 25,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.1,
        shadowRadius: 15,
        elevation: 10,
    },
    inputSection: {
        marginBottom: 25,
    },
    label: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 10,
        flexDirection: 'row',
        alignItems: 'center',
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f8f9fa',
        borderRadius: 12,
        paddingHorizontal: 15,
        borderWidth: 1,
        borderColor: '#e9ecef',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 2,
        minHeight: 55,
    },
    inputIcon: {
        marginRight: 10,
    },
    input: {
        flex: 1,
        paddingVertical: 15,
        fontSize: 16,
        color: '#333',
    },
    specialtyText: {
        flex: 1,
        paddingVertical: 15,
        fontSize: 16,
        color: '#333',
    },
    placeholder: {
        color: '#999',
    },
    buttonSection: {
        gap: 15,
        marginTop: 10,
    },
    primaryButton: {
        borderRadius: 15,
        overflow: 'hidden',
        shadowColor: '#4facfe',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 15,
        elevation: 10,
    },
    primaryButtonGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 18,
        paddingHorizontal: 30,
    },
    primaryButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
        marginLeft: 10,
    },
    secondaryButton: {
        backgroundColor: '#f8f9fa',
        borderRadius: 15,
        borderWidth: 2,
        borderColor: '#667eea',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5,
    },
    secondaryButtonContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 15,
        paddingHorizontal: 30,
    },
    secondaryButtonText: {
        color: '#667eea',
        fontSize: 16,
        fontWeight: 'bold',
        marginLeft: 10,
    },
    // Estilos del Modal
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 20,
        margin: 20,
        maxHeight: '70%',
        width: '90%',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.25,
        shadowRadius: 25,
        elevation: 25,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
        paddingBottom: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
        flex: 1,
    },
    closeButton: {
        padding: 5,
    },
    specialtyOption: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 15,
        paddingHorizontal: 15,
        marginVertical: 5,
        borderRadius: 12,
        backgroundColor: '#f8f9fa',
        borderWidth: 2,
        borderColor: 'transparent',
    },
    selectedOption: {
        backgroundColor: '#e3f2fd',
        borderColor: '#4facfe',
    },
    optionIcon: {
        marginRight: 15,
    },
    specialtyOptionText: {
        fontSize: 16,
        color: '#333',
        flex: 1,
    },
    selectedOptionText: {
        fontWeight: 'bold',
        color: '#4facfe',
    },
    placeholderOption: {
        color: '#999',
        fontStyle: 'italic',
    },
});