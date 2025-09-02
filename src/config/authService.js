// services/authService.js - FIXED VERSION
import { 
    signInWithEmailAndPassword, 
    createUserWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    updateProfile,
    sendEmailVerification,
    sendPasswordResetEmail,
    updatePassword,
    reauthenticateWithCredential,
    EmailAuthProvider
  } from 'firebase/auth';
  import { 
    doc, 
    setDoc, 
    getDoc, 
    updateDoc, 
    serverTimestamp,
    collection,
    query,
    where,
    getDocs
  } from 'firebase/firestore';
  import { auth, db } from '../config/firebase';
  
  class AuthService {
    
    // Login user
    async login(email, password) {
      try {
        console.log('🔐 Starting login process...');
        
        const userCredential = await signInWithEmailAndPassword(
          auth, 
          email.trim().toLowerCase(), 
          password
        );
        
        const user = userCredential.user;
        console.log('✅ User authenticated:', user.uid);
        
        // Fetch user data from Firestore with proper error handling
        let userData = {};
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          userData = userDoc.exists() ? userDoc.data() : {};
          console.log('✅ User data fetched from Firestore');
        } catch (firestoreError) {
          console.warn('⚠️ Could not fetch additional user data:', firestoreError);
        }
        
        // Update last login with error handling
        try {
          await updateDoc(doc(db, 'users', user.uid), {
            lastLogin: serverTimestamp(),
            updatedAt: serverTimestamp()
          });
          console.log('✅ Last login updated');
        } catch (updateError) {
          console.warn('⚠️ Could not update last login:', updateError);
        }
        
        return {
          success: true,
          user: {
            uid: user.uid,
            email: user.email,
            emailVerified: user.emailVerified,
            displayName: user.displayName,
            ...userData
          }
        };
      } catch (error) {
        console.error('❌ Login error:', error);
        return {
          success: false,
          error: this.handleAuthError(error)
        };
      }
    }
    
    // Register user
    async register(userData) {
      try {
        console.log('📝 Starting registration process...');
        const { email, password, name, age, specialty } = userData;
        
        // Validate db object before using it
        if (!db) {
          throw new Error('Firestore database not initialized');
        }
        
        // Check if email is already in use (with proper error handling)
        try {
          const usersRef = collection(db, 'users');
          const q = query(usersRef, where('email', '==', email.trim().toLowerCase()));
          const querySnapshot = await getDocs(q);
          
          if (!querySnapshot.empty) {
            return {
              success: false,
              error: 'Este email ya está registrado'
            };
          }
        } catch (queryError) {
          console.warn('⚠️ Could not check existing users:', queryError);
          // Continue with registration even if check fails
        }
        
        // Create user
        const userCredential = await createUserWithEmailAndPassword(
          auth, 
          email.trim().toLowerCase(), 
          password
        );
        
        const user = userCredential.user;
        console.log('✅ User created:', user.uid);
        
        // Update profile
        try {
          await updateProfile(user, {
            displayName: name.trim()
          });
          console.log('✅ Profile updated');
        } catch (profileError) {
          console.warn('⚠️ Could not update profile:', profileError);
        }
        
        // Save user data to Firestore with error handling
        const firestoreData = {
          uid: user.uid,
          name: name.trim(),
          email: email.trim().toLowerCase(),
          age: parseInt(age),
          specialty,
          emailVerified: user.emailVerified,
          profileComplete: true,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          lastLogin: serverTimestamp()
        };
        
        try {
          await setDoc(doc(db, 'users', user.uid), firestoreData);
          console.log('✅ User data saved to Firestore');
        } catch (firestoreError) {
          console.error('❌ Could not save to Firestore:', firestoreError);
          // Don't fail registration if Firestore save fails
        }
        
        // Send email verification (optional)
        try {
          await sendEmailVerification(user);
          console.log('✅ Verification email sent');
        } catch (verificationError) {
          console.warn('⚠️ Could not send verification email:', verificationError);
        }
        
        return {
          success: true,
          user: {
            uid: user.uid,
            email: user.email,
            emailVerified: user.emailVerified,
            displayName: user.displayName,
            ...firestoreData
          }
        };
      } catch (error) {
        console.error('❌ Registration error:', error);
        return {
          success: false,
          error: this.handleAuthError(error)
        };
      }
    }
    
    // Logout user
    async logout() {
      try {
        await signOut(auth);
        console.log('✅ User logged out');
        return { success: true };
      } catch (error) {
        console.error('❌ Logout error:', error);
        return {
          success: false,
          error: this.handleAuthError(error)
        };
      }
    }
    
    // Get current user data
    async getCurrentUser() {
      try {
        const user = auth.currentUser;
        if (!user) return { success: false, user: null };
        
        // Validate db before using it
        if (!db) {
          console.warn('⚠️ Firestore not available, returning basic user data');
          return {
            success: true,
            user: {
              uid: user.uid,
              email: user.email,
              emailVerified: user.emailVerified,
              displayName: user.displayName
            }
          };
        }
        
        let userData = {};
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          userData = userDoc.exists() ? userDoc.data() : {};
        } catch (firestoreError) {
          console.warn('⚠️ Could not fetch user data from Firestore:', firestoreError);
        }
        
        return {
          success: true,
          user: {
            uid: user.uid,
            email: user.email,
            emailVerified: user.emailVerified,
            displayName: user.displayName,
            ...userData
          }
        };
      } catch (error) {
        console.error('❌ Get current user error:', error);
        return {
          success: false,
          error: this.handleAuthError(error)
        };
      }
    }
    
    // Update user profile
    async updateUserProfile(updates) {
      try {
        const user = auth.currentUser;
        if (!user) throw new Error('No user logged in');
        
        // Update Firebase Auth profile if name is being updated
        if (updates.name && updates.name !== user.displayName) {
          try {
            await updateProfile(user, {
              displayName: updates.name
            });
            console.log('✅ Auth profile updated');
          } catch (profileError) {
            console.warn('⚠️ Could not update auth profile:', profileError);
          }
        }
        
        // Update Firestore document if available
        if (db) {
          try {
            const updateData = {
              ...updates,
              updatedAt: serverTimestamp()
            };
            
            await updateDoc(doc(db, 'users', user.uid), updateData);
            console.log('✅ Firestore document updated');
          } catch (firestoreError) {
            console.warn('⚠️ Could not update Firestore document:', firestoreError);
          }
        }
        
        return { success: true };
      } catch (error) {
        console.error('❌ Update profile error:', error);
        return {
          success: false,
          error: this.handleAuthError(error)
        };
      }
    }
    
    // Send password reset email
    async resetPassword(email) {
      try {
        await sendPasswordResetEmail(auth, email.trim().toLowerCase());
        return { success: true };
      } catch (error) {
        return {
          success: false,
          error: this.handleAuthError(error)
        };
      }
    }
    
    // Change password
    async changePassword(currentPassword, newPassword) {
      try {
        const user = auth.currentUser;
        if (!user) throw new Error('No user logged in');
        
        // Re-authenticate user
        const credential = EmailAuthProvider.credential(user.email, currentPassword);
        await reauthenticateWithCredential(user, credential);
        
        // Update password
        await updatePassword(user, newPassword);
        
        // Update timestamp in Firestore if available
        if (db) {
          try {
            await updateDoc(doc(db, 'users', user.uid), {
              updatedAt: serverTimestamp()
            });
          } catch (firestoreError) {
            console.warn('⚠️ Could not update timestamp in Firestore:', firestoreError);
          }
        }
        
        return { success: true };
      } catch (error) {
        return {
          success: false,
          error: this.handleAuthError(error)
        };
      }
    }
    
    // Send email verification
    async sendVerificationEmail() {
      try {
        const user = auth.currentUser;
        if (!user) throw new Error('No user logged in');
        
        await sendEmailVerification(user);
        return { success: true };
      } catch (error) {
        return {
          success: false,
          error: this.handleAuthError(error)
        };
      }
    }
    
    // Check if user exists by email (with proper error handling)
    async checkUserExists(email) {
      try {
        // Validate db before using it
        if (!db) {
          return {
            success: false,
            error: 'Firestore not available'
          };
        }
        
        const usersRef = collection(db, 'users');
        const q = query(usersRef, where('email', '==', email.trim().toLowerCase()));
        const querySnapshot = await getDocs(q);
        
        return {
          success: true,
          exists: !querySnapshot.empty,
          userData: querySnapshot.empty ? null : querySnapshot.docs[0].data()
        };
      } catch (error) {
        console.error('❌ Check user exists error:', error);
        return {
          success: false,
          error: this.handleAuthError(error)
        };
      }
    }
    
    // Auth state observer with proper error handling
    onAuthStateChange(callback) {
      return onAuthStateChanged(auth, async (user) => {
        if (user) {
          // Fetch complete user data from Firestore with error handling
          let userData = {};
          if (db) {
            try {
              const userDoc = await getDoc(doc(db, 'users', user.uid));
              userData = userDoc.exists() ? userDoc.data() : {};
            } catch (error) {
              console.warn('⚠️ Error fetching user data in auth state change:', error);
            }
          }
          
          callback({
            uid: user.uid,
            email: user.email,
            emailVerified: user.emailVerified,
            displayName: user.displayName,
            ...userData
          });
        } else {
          callback(null);
        }
      });
    }
    
    // Handle authentication errors
    handleAuthError(error) {
      console.error('Auth Error Details:', {
        code: error.code,
        message: error.message
      });
      
      switch (error.code) {
        case 'auth/user-not-found':
          return 'No existe una cuenta con este email';
        case 'auth/wrong-password':
          return 'Contraseña incorrecta';
        case 'auth/invalid-email':
          return 'El formato del email no es válido';
        case 'auth/user-disabled':
          return 'Esta cuenta ha sido deshabilitada';
        case 'auth/too-many-requests':
          return 'Demasiados intentos fallidos. Intenta más tarde';
        case 'auth/network-request-failed':
          return 'Error de conexión. Verifica tu internet';
        case 'auth/email-already-in-use':
          return 'Este email ya está registrado';
        case 'auth/weak-password':
          return 'La contraseña es muy débil. Usa al menos 6 caracteres';
        case 'auth/invalid-credential':
          return 'Email o contraseña incorrectos';
        case 'auth/operation-not-allowed':
          return 'Operación no permitida';
        case 'auth/requires-recent-login':
          return 'Debes iniciar sesión nuevamente para realizar esta acción';
        case 'auth/configuration-not-found':
          return 'Configuración de Firebase incompleta';
        default:
          return error.message || 'Error de autenticación';
      }
    }
    
    // Validate email format
    validateEmail(email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(email);
    }
    
    // Validate password strength
    validatePassword(password) {
      return {
        isValid: password.length >= 6,
        errors: password.length < 6 ? ['La contraseña debe tener al menos 6 caracteres'] : []
      };
    }
  }
  
  export default new AuthService();