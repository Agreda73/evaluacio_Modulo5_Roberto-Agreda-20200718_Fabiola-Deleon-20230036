import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, Modal, TextInput, FlatList } from 'react-native';
import { db } from '../config/firebase';
import { deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';

// Función para eliminar un usuario de Firestore
const handleDelete = async (id, nombre) => {
    Alert.alert(
        'Confirmar eliminación',
        `¿Estás seguro de que deseas eliminar a ${nombre}?`,
        [
            {
                text: 'Cancelar',
                style: 'cancel',
            },
            {
                text: 'Eliminar',
                style: 'destructive',
                onPress: async () => {
                    try {
                        await deleteDoc(doc(db, 'usuarios', id));
                        Alert.alert('Éxito', 'Usuario eliminado correctamente');
                    } catch (e) {
                        console.error('Error removing document: ', e);
                        Alert.alert('Error', 'No se pudo eliminar el usuario');
                    }
                }
            },
        ],
    );
};

// Componente funcional que representa una tarjeta de usuario
const CardUsuarios = ({ id, nombre, correo, edad, especialidad, contraseña }) => {
    const [modalVisible, setModalVisible] = useState(false);
    const [editData, setEditData] = useState({
        nombre: nombre || '',
        correo: correo || '',
        edad: edad ? edad.toString() : '',
        especialidad: especialidad || '',
        contraseña: contraseña || ''
    });
    const [specialtyModalVisible, setSpecialtyModalVisible] = useState(false);

    const specialties = [
        { label: 'Software', value: 'Software' },
        { label: 'Diseño', value: 'Diseño' },
        { label: 'Emca', value: 'Emca' },
        { label: 'Arquitectura', value: 'Arquitectura' },
        { label: 'Contaduría', value: 'Contaduría' }
    ];

    // Función para obtener iconos según la especialidad
    const getSpecialtyIcon = (specialty) => {
        const icons = {
            'Software': 'computer',
            'Diseño': 'palette',
            'Emca': 'business',
            'Arquitectura': 'home',
            'Contaduría': 'account-balance'
        };
        return icons[specialty] || 'work';
    };

    // Función para obtener color según la especialidad
    const getSpecialtyColor = (specialty) => {
        const colors = {
            'Software': '#2196F3',
            'Diseño': '#E91E63',
            'Emca': '#FF9800',
            'Arquitectura': '#4CAF50',
            'Contaduría': '#9C27B0'
        };
        return colors[specialty] || '#666';
    };

    // Función para actualizar los datos del usuario
    const handleUpdate = async () => {
        try {
            // Validaciones básicas
            if (!editData.nombre.trim() || !editData.correo.trim() || !editData.edad.trim() || !editData.especialidad.trim()) {
                Alert.alert('Error', 'Todos los campos son obligatorios');
                return;
            }

            if (!editData.correo.includes('@')) {
                Alert.alert('Error', 'Por favor ingresa un correo válido');
                return;
            }

            if (isNaN(editData.edad) || parseInt(editData.edad) < 18) {
                Alert.alert('Error', 'La edad debe ser un número mayor a 18');
                return;
            }

            if (editData.contraseña.length < 6) {
                Alert.alert('Error', 'La contraseña debe tener al menos 6 caracteres');
                return;
            }

            await updateDoc(doc(db, 'usuarios', id), {
                nombre: editData.nombre.trim(),
                correo: editData.correo.trim(),
                edad: parseInt(editData.edad),
                especialidad: editData.especialidad,
                contraseña: editData.contraseña
            });

            setModalVisible(false);
            Alert.alert('Éxito', 'Usuario actualizado correctamente');
        } catch (e) {
            console.error('Error updating document: ', e);
            Alert.alert('Error', 'No se pudo actualizar el usuario');
        }
    };

    // Función para seleccionar especialidad
    const selectSpecialty = (value) => {
        setEditData(prev => ({
            ...prev,
            especialidad: value
        }));
        setSpecialtyModalVisible(false);
    };

    return (
        <>
            <View style={styles.card}>
                <LinearGradient
                    colors={['#e8f5e8', '#ffffff']}
                    style={styles.cardGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                >
                    {/* Header */}
                    <View style={styles.cardHeader}>
                        <View style={styles.userInfo}>
                            <Text style={styles.nombre}>{nombre}</Text>
                        </View>
                        
                        {/* Especialidad con icono */}
                        <View style={[styles.specialtyBadge, { backgroundColor: getSpecialtyColor(especialidad) + '20' }]}>
                            <Icon 
                                name={getSpecialtyIcon(especialidad)} 
                                size={16} 
                                color={getSpecialtyColor(especialidad)} 
                                style={styles.specialtyIcon} 
                            />
                            <Text style={[styles.especialidadText, { color: getSpecialtyColor(especialidad) }]}>
                                {especialidad}
                            </Text>
                        </View>
                    </View>

                    {/* Información del usuario */}
                    <View style={styles.infoContainer}>
                        <View style={styles.infoRow}>
                            <Icon name="email" size={16} color="#666" />
                            <Text style={styles.infoText}>{correo}</Text>
                        </View>
                        
                        <View style={styles.infoRow}>
                            <Icon name="cake" size={16} color="#666" />
                            <Text style={styles.infoText}>{edad} años</Text>
                        </View>
                        
                        <View style={styles.infoRow}>
                            <Icon name="lock" size={16} color="#666" />
                            <Text style={styles.infoText}>••••••</Text>
                        </View>
                    </View>

                    {/* Botones de acción */}
                    <View style={styles.buttonContainer}>
                        <TouchableOpacity
                            style={[styles.actionButton, styles.editButton]}
                            onPress={() => setModalVisible(true)}>
                            <Icon name="edit" size={18} color="#fff" />
                            <Text style={styles.buttonText}>Editar</Text>
                        </TouchableOpacity>
                        
                        <TouchableOpacity
                            style={[styles.actionButton, styles.deleteButton]}
                            onPress={() => handleDelete(id, nombre)}>
                            <Icon name="delete" size={18} color="#fff" />
                            <Text style={styles.buttonText}>Eliminar</Text>
                        </TouchableOpacity>
                    </View>
                </LinearGradient>
            </View>

            {/* Modal de edición */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Editar Usuario</Text>
                            <TouchableOpacity 
                                onPress={() => setModalVisible(false)}
                                style={styles.closeButton}
                            >
                                <Icon name="close" size={24} color="#666" />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.editForm}>
                            {/* Campo Nombre */}
                            <View style={styles.inputContainer}>
                                <Icon name="person" size={20} color="#667eea" style={styles.inputIcon} />
                                <TextInput
                                    style={styles.input}
                                    placeholder="Nombre completo"
                                    value={editData.nombre}
                                    onChangeText={(text) => setEditData({...editData, nombre: text})}
                                />
                            </View>

                            {/* Campo Correo */}
                            <View style={styles.inputContainer}>
                                <Icon name="email" size={20} color="#667eea" style={styles.inputIcon} />
                                <TextInput
                                    style={styles.input}
                                    placeholder="Correo electrónico"
                                    value={editData.correo}
                                    onChangeText={(text) => setEditData({...editData, correo: text})}
                                    keyboardType="email-address"
                                />
                            </View>

                            {/* Campo Contraseña */}
                            <View style={styles.inputContainer}>
                                <Icon name="lock" size={20} color="#667eea" style={styles.inputIcon} />
                                <TextInput
                                    style={styles.input}
                                    placeholder="Contraseña"
                                    value={editData.contraseña}
                                    onChangeText={(text) => setEditData({...editData, contraseña: text})}
                                    secureTextEntry
                                />
                            </View>

                            {/* Campo Edad */}
                            <View style={styles.inputContainer}>
                                <Icon name="cake" size={20} color="#667eea" style={styles.inputIcon} />
                                <TextInput
                                    style={styles.input}
                                    placeholder="Edad"
                                    value={editData.edad}
                                    onChangeText={(text) => setEditData({...editData, edad: text})}
                                    keyboardType="numeric"
                                />
                            </View>

                            {/* Campo Especialidad */}
                            <TouchableOpacity 
                                style={styles.inputContainer}
                                onPress={() => setSpecialtyModalVisible(true)}
                            >
                                <Icon name="work" size={20} color="#667eea" style={styles.inputIcon} />
                                <Text style={styles.specialtyText}>{editData.especialidad}</Text>
                                <Icon name="arrow-drop-down" size={24} color="#667eea" />
                            </TouchableOpacity>

                            {/* Botones */}
                            <View style={styles.modalButtonContainer}>
                                <TouchableOpacity
                                    style={[styles.modalButton, styles.cancelButton]}
                                    onPress={() => setModalVisible(false)}
                                >
                                    <Text style={styles.cancelButtonText}>Cancelar</Text>
                                </TouchableOpacity>
                                
                                <TouchableOpacity
                                    style={[styles.modalButton, styles.saveButton]}
                                    onPress={handleUpdate}
                                >
                                    <Text style={styles.saveButtonText}>Guardar</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Modal para seleccionar especialidad en edición */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={specialtyModalVisible}
                onRequestClose={() => setSpecialtyModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Selecciona especialidad</Text>
                            <TouchableOpacity 
                                onPress={() => setSpecialtyModalVisible(false)}
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
                                        editData.especialidad === item.value && styles.selectedOption
                                    ]}
                                    onPress={() => selectSpecialty(item.value)}
                                >
                                    <Icon 
                                        name={getSpecialtyIcon(item.value)} 
                                        size={20} 
                                        color={editData.especialidad === item.value ? '#4facfe' : '#666'} 
                                        style={styles.optionIcon}
                                    />
                                    <Text style={[
                                        styles.specialtyOptionText,
                                        editData.especialidad === item.value && styles.selectedOptionText
                                    ]}>
                                        {item.label}
                                    </Text>
                                    {editData.especialidad === item.value && (
                                        <Icon name="check" size={20} color="#4facfe" />
                                    )}
                                </TouchableOpacity>
                            )}
                        />
                    </View>
                </View>
            </Modal>
        </>
    );
};

const styles = StyleSheet.create({
    card: {
        margin: 15,
        borderRadius: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.15,
        shadowRadius: 20,
        elevation: 10,
        backgroundColor: '#fff',
    },
    cardGradient: {
        borderRadius: 20,
        padding: 20,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 15,
    },
    userInfo: {
        flex: 1,
    },
    nombre: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 8,
    },
    specialtyBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 15,
        marginLeft: 10,
    },
    specialtyIcon: {
        marginRight: 6,
    },
    especialidadText: {
        fontSize: 14,
        fontWeight: 'bold',
    },
    infoContainer: {
        marginBottom: 20,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    infoText: {
        fontSize: 16,
        color: '#666',
        marginLeft: 10,
        flex: 1,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 10,
    },
    actionButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        paddingHorizontal: 12,
        borderRadius: 12,
        minHeight: 44,
    },
    editButton: {
        backgroundColor: '#2196F3',
    },
    deleteButton: {
        backgroundColor: '#F44336',
    },
    buttonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 14,
        marginLeft: 4,
        textAlign: 'center',
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
        maxHeight: '80%',
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
    editForm: {
        gap: 15,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f8f9fa',
        borderRadius: 12,
        paddingHorizontal: 15,
        borderWidth: 1,
        borderColor: '#e9ecef',
        minHeight: 50,
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
    modalButtonContainer: {
        flexDirection: 'row',
        gap: 15,
        marginTop: 20,
    },
    modalButton: {
        flex: 1,
        paddingVertical: 15,
        borderRadius: 12,
        alignItems: 'center',
    },
    cancelButton: {
        backgroundColor: '#f8f9fa',
        borderWidth: 2,
        borderColor: '#e9ecef',
    },
    saveButton: {
        backgroundColor: '#4CAF50',
    },
    cancelButtonText: {
        color: '#666',
        fontWeight: 'bold',
        fontSize: 16,
    },
    saveButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
    // Estilos para selector de especialidad
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
});

export default CardUsuarios;