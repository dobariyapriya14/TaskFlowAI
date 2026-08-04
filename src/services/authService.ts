import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  UserCredential,
} from '@react-native-firebase/auth';
import { getFirestore, doc, setDoc } from '@react-native-firebase/firestore';
import { logLogin, logLogout } from './analytics';
import { setUser } from './crashlytics';
import { getPerformance, trace } from '@react-native-firebase/perf';
import { handleError } from '../utils/errorHandler';

const auth = getAuth();
const db = getFirestore();

export const authService = {
  async signup(
    email: string,
    password: string,
    name?: string,
  ): Promise<UserCredential> {
    const signupTrace = trace(getPerformance(), 'custom_signup_trace');
    await signupTrace.start();
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password,
      );
      if (name && userCredential.user) {
        await updateProfile(userCredential.user, { displayName: name });
      }

      // Save user document in Firestore
      if (userCredential.user) {
        await setDoc(doc(db, 'users', userCredential.user.uid), {
          email: email,
          name: name || '',
          role: 'user',
          createdAt: new Date().toISOString(),
        });
      }

      await signupTrace.stop();
      return userCredential;
    } catch (error) {
      await signupTrace.stop();
      handleError(error, 'authService: signup');
      throw error;
    }
  },

  async login(email: string, password: string): Promise<UserCredential> {
    const loginTrace = trace(getPerformance(), 'custom_login_trace');
    await loginTrace.start();
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password,
      );
      await logLogin('email');
      setUser(userCredential.user.uid);
      await loginTrace.stop();
      return userCredential;
    } catch (error) {
      await loginTrace.stop();
      handleError(error, 'authService: login');
      throw error;
    }
  },

  async logout(): Promise<void> {
    try {
      await signOut(auth);
      await logLogout();
    } catch (error) {
      handleError(error, 'authService: logout');
      throw error;
    }
  },

  async forgotPassword(email: string): Promise<void> {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error) {
      handleError(error, 'authService: forgotPassword');
      throw error;
    }
  },
};
