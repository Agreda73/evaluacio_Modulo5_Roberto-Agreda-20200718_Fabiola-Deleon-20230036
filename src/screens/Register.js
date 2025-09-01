// screens/RegisterScreen.js
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ImageBackground
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import { StatusBar } from 'expo-status-bar';

const RegisterScreen = ({ navigation }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    age: '',
    specialty: ''
  });
  const [loading, setLoading] = useState(false);

  const specialties = [
    { label: 'Selecciona una especialidad', value: '' },
    { label: 'Medicina General', value: 'medicina_general' },
    { label: 'Cardiología', value: 'cardiologia' },
    { label: 'Dermatología', value: 'dermatologia' },
    { label: 'Neurología', value: 'neurologia' },
    { label: 'Pediatría', value: 'pediatria' }
  ];

  const updateFormData = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      Alert.alert('Error', 'El nombre es requerido');
      return false;
    }
    
    if (!formData.email.trim()) {
      Alert.alert('Error', 'El email es requerido');
      return false;
    }
    
    if (formData.password.length < 6) {
      Alert.alert('Error', 'La contraseña debe tener al menos 6 caracteres');
      return false;
    }

    if (!formData.age || formData.age < 18) {
      Alert.alert('Error', 'Debes ser mayor de 18 años');
      return false;
    }

    if (!formData.specialty) {
      Alert.alert('Error', 'Selecciona una especialidad');
      return false;
    }
    
    return true;
  };

  const handleRegister = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      // Create user with email and password
      const userCredential = await createUserWithEmailAndPassword(
        auth, 
        formData.email, 
        formData.password
      );
      
      const user = userCredential.user;

      // Update user profile with name
      await updateProfile(user, {
        displayName: formData.name
      });

      // Save additional user data to Firestore
      await setDoc(doc(db, 'users', user.uid), {
        name: formData.name,
        email: formData.email,
        age: parseInt(formData.age),
        specialty: formData.specialty,
        createdAt: new Date().toISOString(),
        uid: user.uid
      });

      Alert.alert(
        'Éxito', 
        'Cuenta creada exitosamente',
        [
          {
            text: 'OK',
            onPress: () => navigation.navigate('Login')
          }
        ]
      );
    } catch (error) {
      let errorMessage = 'Error al crear la cuenta';
      
      switch (error.code) {
        case 'auth/email-already-in-use':
          errorMessage = 'Este email ya está registrado';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Email inválido';
          break;
        case 'auth/weak-password':
          errorMessage = 'La contraseña es muy débil';
          break;
      }
      
      Alert.alert('Error', errorMessage);
    }
    setLoading(false);
  };

  const goToLogin = () => {
    navigation.navigate('Login');
  };

  return (
    <ImageBackground 
      source={require("../../assets/Frame.png")}
      style={styles.backgroundImage}
      resizeMode="cover"
    >
      <KeyboardAvoidingView 
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <StatusBar style="light" />
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={styles.card}>
            <Text style={styles.title}>SIGN UP</Text>
            <Text style={styles.subtitle}>FOR YOUR ACCOUNT</Text>

            <View style={styles.inputContainer}>
              <Text style={styles.icon}>👤</Text>
              <TextInput
                style={styles.input}
                placeholder="Nombre completo"
                placeholderTextColor="#999"
                value={formData.name}
                onChangeText={(value) => updateFormData('name', value)}
                autoCapitalize="words"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.icon}>✉️</Text>
              <TextInput
                style={styles.input}
                placeholder="Correo electrónico"
                placeholderTextColor="#999"
                value={formData.email}
                onChangeText={(value) => updateFormData('email', value)}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.icon}>🔒</Text>
              <TextInput
                style={styles.input}
                placeholder="Contraseña"
                placeholderTextColor="#999"
                value={formData.password}
                onChangeText={(value) => updateFormData('password', value)}
                secureTextEntry
                autoComplete="password-new"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.icon}>🎂</Text>
              <TextInput
                style={styles.input}
                placeholder="Edad"
                placeholderTextColor="#999"
                value={formData.age}
                onChangeText={(value) => updateFormData('age', value)}
                keyboardType="numeric"
                maxLength={2}
              />
            </View>

            <View style={styles.pickerContainer}>
              <Text style={styles.icon}>🩺</Text>
              <View style={styles.pickerWrapper}>
                <Picker
                  selectedValue={formData.specialty}
                  style={styles.picker}
                  onValueChange={(itemValue) => updateFormData('specialty', itemValue)}
                  dropdownIconColor="#999"
                >
                  {specialties.map((specialty, index) => (
                    <Picker.Item 
                      key={index} 
                      label={specialty.label} 
                      value={specialty.value}
                      color={specialty.value === '' ? '#999' : '#333'}
                    />
                  ))}
                </Picker>
              </View>
            </View>

            <TouchableOpacity 
              style={[styles.signUpButton, loading && styles.disabledButton]}
              onPress={handleRegister}
              disabled={loading}
            >
              <Text style={styles.signUpButtonText}>
                {loading ? 'CREANDO CUENTA...' : 'SIGN UP'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={goToLogin} style={styles.loginLink}>
              <Text style={styles.loginText}>¿Ya tienes cuenta? Inicia sesión</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 40,
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 30,
    padding: 30,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
    marginVertical: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#8B5CF6',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 12,
    color: '#999',
    marginBottom: 30,
    fontWeight: '300',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    height: 50,
    backgroundColor: '#F3E8FF',
    borderRadius: 25,
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  pickerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    height: 50,
    backgroundColor: '#F3E8FF',
    borderRadius: 25,
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  icon: {
    fontSize: 18,
    marginRight: 15,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  pickerWrapper: {
    flex: 1,
  },
  picker: {
    flex: 1,
    color: '#333',
    fontSize: 16,
  },
  signUpButton: {
    width: '100%',
    height: 50,
    backgroundColor: '#8B5CF6',
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 20,
  },
  disabledButton: {
    opacity: 0.7,
  },
  signUpButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loginLink: {
    marginTop: 10,
  },
  loginText: {
    color: '#8B5CF6',
    fontSize: 14,
    fontWeight: '500',
  },
});

export default RegisterScreen;