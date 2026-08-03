import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  UserCredential
} from '@react-native-firebase/auth';
import { getFirestore, doc, setDoc } from '@react-native-firebase/firestore';
import { logLogin, logLogout } from './analytics';
import { setUser } from './crashlytics';

const auth = getAuth();
const db = getFirestore();

export const authService = {
  async signup(email: string, password: string, name?: string): Promise<UserCredential> {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      if (name && userCredential.user) {
        await updateProfile(userCredential.user, { displayName: name });
      }
      
      // Save user document in Firestore
      if (userCredential.user) {
        await setDoc(doc(db, 'users', userCredential.user.uid), {
          email: email,
          name: name || '',
          createdAt: new Date().toISOString()
        });
      }

      return userCredential;
    } catch (error) {
      throw error;
    }
  },

  async login(email: string, password: string): Promise<UserCredential> {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      await logLogin('email');
      setUser(userCredential.user.uid);
      return userCredential;
    } catch (error) {
      throw error;
    }
  },

  async logout(): Promise<void> {
    try {
      await signOut(auth);
      await logLogout();
    } catch (error) {
      throw error;
    }
  },

  async forgotPassword(email: string): Promise<void> {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error) {
      throw error;
    }
  }
};
