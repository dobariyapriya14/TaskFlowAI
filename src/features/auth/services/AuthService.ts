import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  UserCredential,
} from '@react-native-firebase/auth';
import { getPerformance, trace } from '@react-native-firebase/perf';
import { AnalyticsService } from '../../../core/firebase/AnalyticsCoreService';
import { CrashlyticsService } from '../../../core/firebase/CrashlyticsCoreService';
import { FirestoreRepository } from '../../../core/firebase/FirestoreRepository';
import { handleError } from '../../../utils/errorHandler';

const auth = getAuth();

export interface UserDocument {
  id?: string;
  email: string;
  name: string;
  role: string;
  createdAt: string;
  updatedAt?: any;
}

class UserService extends FirestoreRepository<UserDocument> {
  constructor() {
    super('users');
  }

  async setUserDoc(uid: string, data: Omit<UserDocument, 'id'>) {
    return this.setWithId(uid, data, 'custom_set_user_doc_trace');
  }
}

const userService = new UserService();

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

      // Save user document in Firestore using repository pattern
      if (userCredential.user) {
        await userService.setUserDoc(userCredential.user.uid, {
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
      await AnalyticsService.logLogin('email');
      CrashlyticsService.setUser(userCredential.user.uid);
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
      await AnalyticsService.logLogout();
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
