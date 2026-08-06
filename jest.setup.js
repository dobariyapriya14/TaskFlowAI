import '@testing-library/jest-native/extend-expect';

// Mock React Navigation
jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => ({
    navigate: jest.fn(),
    goBack: jest.fn(),
  }),
  useRoute: () => ({
    params: {},
  }),
}));

// Mock Firebase Auth
jest.mock('@react-native-firebase/auth', () => {
  return {
    getAuth: jest.fn(() => ({
      currentUser: { uid: 'test-uid' },
    })),
    signInWithEmailAndPassword: jest.fn(),
    createUserWithEmailAndPassword: jest.fn(),
    signOut: jest.fn(),
    sendPasswordResetEmail: jest.fn(),
    updateProfile: jest.fn(),
    onAuthStateChanged: jest.fn((auth, callback) => {
      // Immediately call with null to simulate no user
      callback(null);
      return jest.fn(); // unsubscribe function
    }),
  };
});

// Mock Firebase Firestore
jest.mock('@react-native-firebase/firestore', () => {
  return {
    getFirestore: jest.fn(() => ({})),
    doc: jest.fn(),
    setDoc: jest.fn(),
    collection: jest.fn(),
    addDoc: jest.fn(),
    updateDoc: jest.fn(),
    deleteDoc: jest.fn(),
    getDocs: jest.fn(),
    getDoc: jest.fn(),
    serverTimestamp: jest.fn(() => 'server-timestamp'),
    query: jest.fn(),
    where: jest.fn(),
    orderBy: jest.fn(),
    limit: jest.fn(),
    startAfter: jest.fn(),
  };
});

// Mock Firebase Crashlytics
jest.mock('@react-native-firebase/crashlytics', () => {
  return {
    getCrashlytics: jest.fn(() => ({})),
    recordError: jest.fn(),
    log: jest.fn(),
    setUserId: jest.fn(),
    crash: jest.fn(),
  };
});

// Mock Firebase Analytics
jest.mock('@react-native-firebase/analytics', () => {
  return {
    getAnalytics: jest.fn(() => ({})),
    logEvent: jest.fn(),
    logLogin: jest.fn(),
  };
});

// Mock Firebase Perf
jest.mock('@react-native-firebase/perf', () => {
  const mockTrace = {
    start: jest.fn(),
    stop: jest.fn(),
    putMetric: jest.fn(),
  };
  return {
    getPerformance: jest.fn(() => ({})),
    trace: jest.fn(() => mockTrace),
  };
});

// Mock Firebase App
jest.mock('@react-native-firebase/app', () => ({
  getApp: jest.fn(() => ({})),
  getApps: jest.fn(() => [{}]),
  initializeApp: jest.fn(),
}));

// Mock Firebase Remote Config
jest.mock('@react-native-firebase/remote-config', () => ({
  getRemoteConfig: jest.fn(() => ({})),
  setDefaults: jest.fn().mockResolvedValue(undefined),
  setConfigSettings: jest.fn().mockResolvedValue(undefined),
  fetchAndActivate: jest.fn().mockResolvedValue(true),
  onConfigUpdate: jest.fn(),
  getValue: jest.fn(() => ({ value: '', source: 'default' })),
  getBoolean: jest.fn(() => false),
  getString: jest.fn(() => ''),
  getNumber: jest.fn(() => 0),
}));
