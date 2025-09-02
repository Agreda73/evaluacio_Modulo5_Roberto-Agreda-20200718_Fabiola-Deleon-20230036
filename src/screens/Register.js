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
  ImageBackground,
  ActivityIndicator,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { createUserWithEmailAndPassword, updateProfile, sendEmailVerification } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import { StatusBar } from 'expo-status-bar';

const RegisterScreen = ({ navigation }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    age: '',
    specialty: ''
  });
  const [loading, setLoading] = useState(false);

  const specialties = [
    { label: 'Selecciona una especialidad', value: '' },
    { label: 'Software', value: 'Software' },
    { label: 'Diseño', value: 'Diseño' },
    { label: 'Emca', value: 'Emca' },
    { label: 'Arquitectura', value: 'Arquitectura' },
    { label: 'Contaduría', value: 'Contaduría' }
  ];

  const updateFormData = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validateForm = () => {
    // Name validation
    if (!formData.name.trim() || formData.name.trim().length < 2) {
      Alert.alert('Error', 'El nombre debe tener al menos 2 caracteres');
      return false;
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      Alert.alert('Error', 'El email es requerido');
      return false;
    }
    
    if (!emailRegex.test(formData.email)) {
      Alert.alert('Error', 'Por favor ingresa un email válido');
      return false;
    }
    
    // Password validation
    if (formData.password.length < 6) {
      Alert.alert('Error', 'La contraseña debe tener al menos 6 caracteres');
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      Alert.alert('Error', 'Las contraseñas no coinciden');
      return false;
    }

    // Age validation
    const ageNum = parseInt(formData.age);
    if (!formData.age || isNaN(ageNum) || ageNum < 18 || ageNum > 80) {
      Alert.alert('Error', 'Debes ser mayor de 18 años y menor de 80');
      return false;
    }

    // Specialty validation
    if (!formData.specialty) {
      Alert.alert('Error', 'Selecciona una especialidad');
      return false;
    }
    
    return true;
  };

  const handleRegister = async () => {
    if (!validateForm()) return;

    // Pre-flight checks
    console.log('🚀 Starting registration...');
    console.log('Auth object:', !!auth);
    console.log('DB object:', !!db);
    
    if (!auth) {
      Alert.alert('Error de Configuración', 'Firebase Authentication no está configurado correctamente');
      return;
    }

    if (!db) {
      Alert.alert('Error de Configuración', 'Firestore Database no está configurado correctamente');
      return;
    }

    setLoading(true);
    
    try {
      console.log('📧 Creating user with email:', formData.email);
      
      // Create user with email and password
      const userCredential = await createUserWithEmailAndPassword(
        auth, 
        formData.email.trim().toLowerCase(), 
        formData.password
      );
      
      const user = userCredential.user;
      console.log('✅ User created successfully:', user.uid);

      // Update user profile with name
      await updateProfile(user, {
        displayName: formData.name.trim()
      });
      console.log('✅ Profile updated');

      // Save additional user data to Firestore
      const userData = {
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        age: parseInt(formData.age),
        specialty: formData.specialty,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        uid: user.uid,
        emailVerified: false,
        profileComplete: true
      };

      await setDoc(doc(db, 'users', user.uid), userData);
      console.log('✅ User data saved to Firestore');

      // Send email verification (optional)
      try {
        await sendEmailVerification(user);
        console.log('✅ Verification email sent');
      } catch (verificationError) {
        console.log('⚠️ Error sending verification email:', verificationError);
      }

      Alert.alert(
        '¡Éxito!', 
        'Cuenta creada exitosamente. ¡Ya puedes iniciar sesión!',
        [
          {
            text: 'Ir a Login',
            onPress: () => {
              // Clear form
              setFormData({
                name: '',
                email: '',
                password: '',
                confirmPassword: '',
                age: '',
                specialty: ''
              });
              navigation.navigate('Login');
            }
          }
        ]
      );
    } catch (error) {
      console.error('❌ Registration error:', error);
      console.error('❌ Error code:', error.code);
      console.error('❌ Error message:', error.message);
      
      let errorMessage = 'Error al crear la cuenta';
      let troubleshootingTip = '';
      
      switch (error.code) {
        case 'auth/configuration-not-found':
          errorMessage = 'Configuración de Firebase incompleta';
          troubleshootingTip = 'Verifica que Authentication esté habilitado en Firebase Console:\n\n1. Ve a Firebase Console\n2. Selecciona tu proyecto\n3. Ve a Authentication > Sign-in method\n4. Habilita Email/Password';
          break;
        case 'auth/project-not-found':
          errorMessage = 'Proyecto de Firebase no encontrado';
          troubleshootingTip = 'Verifica que el Project ID sea correcto en la configuración';
          break;
        case 'auth/api-key-not-valid':
          errorMessage = 'API Key de Firebase inválida';
          troubleshootingTip = 'Verifica la API Key en Firebase Console > Project Settings';
          break;
        case 'auth/operation-not-allowed':
          errorMessage = 'Authentication con Email/Password no está habilitado';
          troubleshootingTip = 'Ve a Firebase Console > Authentication > Sign-in method y habilita Email/Password';
          break;
        case 'auth/email-already-in-use':
          errorMessage = 'Este email ya está registrado';
          troubleshootingTip = '¿Ya tienes una cuenta? Intenta iniciar sesión';
          break;
        case 'auth/invalid-email':
          errorMessage = 'El formato del email no es válido';
          break;
        case 'auth/weak-password':
          errorMessage = 'La contraseña es muy débil. Usa al menos 6 caracteres';
          break;
        case 'auth/network-request-failed':
          errorMessage = 'Error de conexión. Verifica tu internet';
          break;
        default:
          errorMessage = `Error: ${error.message}`;
          troubleshootingTip = 'Si el problema persiste, verifica la configuración de Firebase';
      }
      
      Alert.alert(
        'Error de Registro', 
        troubleshootingTip ? `${errorMessage}\n\n${troubleshootingTip}` : errorMessage,
        [{ text: 'OK' }]
      );
    } finally {
      setLoading(false);
    }
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
        <ScrollView 
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.card}>
            <Text style={styles.title}>SIGN UP</Text>
            <Text style={styles.subtitle}>FOR YOUR ACCOUNT</Text>

            <View style={styles.inputContainer}>
              
              <TextInput
                style={styles.input}
                placeholder="Nombre completo"
                placeholderTextColor="#999"
                value={formData.name}
                onChangeText={(value) => updateFormData('name', value)}
                autoCapitalize="words"
                autoComplete="name"
                editable={!loading}
              />
            </View>

            <View style={styles.inputContainer}>
            
              <TextInput
                style={styles.input}
                placeholder="Correo electrónico"
                placeholderTextColor="#999"
                value={formData.email}
                onChangeText={(value) => updateFormData('email', value)}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                editable={!loading}
              />
            </View>

            <View style={styles.inputContainer}>
            
              <TextInput
                style={styles.input}
                placeholder="Contraseña (mín. 6 caracteres)"
                placeholderTextColor="#999"
                value={formData.password}
                onChangeText={(value) => updateFormData('password', value)}
                secureTextEntry
                autoComplete="password-new"
                editable={!loading}
              />
            </View>

            <View style={styles.inputContainer}>
             
              <TextInput
                style={styles.input}
                placeholder="Confirmar contraseña"
                placeholderTextColor="#999"
                value={formData.confirmPassword}
                onChangeText={(value) => updateFormData('confirmPassword', value)}
                secureTextEntry
                editable={!loading}
              />
            </View>

            <View style={styles.inputContainer}>
            
              <TextInput
                style={styles.input}
                placeholder="Edad (18-120)"
                placeholderTextColor="#999"
                value={formData.age}
                onChangeText={(value) => updateFormData('age', value)}
                keyboardType="numeric"
                maxLength={3}
                editable={!loading}
              />
            </View>

            <View style={styles.pickerContainer}>
              
              <View style={styles.pickerWrapper}>
                <Picker
                  selectedValue={formData.specialty}
                  style={styles.picker}
                  onValueChange={(itemValue) => updateFormData('specialty', itemValue)}
                  dropdownIconColor="#999"
                  enabled={!loading}
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
              {loading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.signUpButtonText}>SIGN UP</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity 
              onPress={goToLogin} 
              style={styles.loginLink}
              disabled={loading}
            >
              <Text style={[styles.loginText, loading && styles.disabledText]}>
                ¿Ya tienes cuenta? Inicia sesión
              </Text>
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
  disabledText: {
    opacity: 0.5,
  },
});

export default RegisterScreen;