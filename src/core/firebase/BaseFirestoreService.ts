import {
  getFirestore,
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  limit,
  startAfter,
  serverTimestamp,
  QueryConstraint,
  DocumentData,
  QuerySnapshot,
} from '@react-native-firebase/firestore';
import { getPerformance, trace } from '@react-native-firebase/perf';
import { handleError } from '../../utils/errorHandler';

const db = getFirestore();

export interface QueryOptions {
  constraints?: QueryConstraint[];
  limitDocs?: number;
  lastDoc?: any;
}

export class BaseFirestoreService<T extends DocumentData> {
  protected collectionName: string;

  constructor(collectionName: string) {
    this.collectionName = collectionName;
  }

  protected get collectionRef() {
    return collection(db, this.collectionName);
  }

  async add(data: Omit<T, 'id'>, traceName?: string): Promise<string> {
    const perfTrace = trace(
      getPerformance(),
      traceName || `add_${this.collectionName}_trace`,
    );
    await perfTrace.start();
    try {
      const dataWithTimestamp = {
        ...data,
        createdAt: serverTimestamp(),
      };
      const docRef = await addDoc(this.collectionRef, dataWithTimestamp);
      await perfTrace.stop();
      return docRef.id;
    } catch (error) {
      await perfTrace.stop();
      handleError(error, `BaseFirestoreService: add (${this.collectionName})`);
      throw error;
    }
  }

  async get(id: string, traceName?: string): Promise<T | null> {
    const perfTrace = trace(
      getPerformance(),
      traceName || `get_${this.collectionName}_trace`,
    );
    await perfTrace.start();
    try {
      const docRef = doc(db, this.collectionName, id);
      const docSnap = await getDoc(docRef);
      await perfTrace.stop();

      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as unknown as T;
      }
      return null;
    } catch (error) {
      await perfTrace.stop();
      handleError(error, `BaseFirestoreService: get (${this.collectionName})`);
      throw error;
    }
  }

  async update(
    id: string,
    data: Partial<T>,
    traceName?: string,
  ): Promise<void> {
    const perfTrace = trace(
      getPerformance(),
      traceName || `update_${this.collectionName}_trace`,
    );
    await perfTrace.start();
    try {
      await updateDoc(doc(db, this.collectionName, id), data as DocumentData);
      await perfTrace.stop();
    } catch (error) {
      await perfTrace.stop();
      handleError(
        error,
        `BaseFirestoreService: update (${this.collectionName})`,
      );
      throw error;
    }
  }

  async delete(id: string, traceName?: string): Promise<void> {
    const perfTrace = trace(
      getPerformance(),
      traceName || `delete_${this.collectionName}_trace`,
    );
    await perfTrace.start();
    try {
      await deleteDoc(doc(db, this.collectionName, id));
      await perfTrace.stop();
    } catch (error) {
      await perfTrace.stop();
      handleError(
        error,
        `BaseFirestoreService: delete (${this.collectionName})`,
      );
      throw error;
    }
  }

  async query(
    options: QueryOptions = {},
    traceName?: string,
  ): Promise<{ data: T[]; lastVisible: any }> {
    const perfTrace = trace(
      getPerformance(),
      traceName || `query_${this.collectionName}_trace`,
    );
    await perfTrace.start();
    try {
      let q = query(this.collectionRef);

      if (options.constraints && options.constraints.length > 0) {
        q = query(q, ...options.constraints);
      }

      if (options.limitDocs) {
        q = query(q, limit(options.limitDocs));
      }

      if (options.lastDoc) {
        q = query(q, startAfter(options.lastDoc));
      }

      const querySnapshot: QuerySnapshot<DocumentData> = await getDocs(q);
      const data: T[] = [];

      querySnapshot.forEach(documentSnapshot => {
        data.push({
          id: documentSnapshot.id,
          ...documentSnapshot.data(),
        } as unknown as T);
      });

      const lastVisible = querySnapshot.docs[querySnapshot.docs.length - 1];

      await perfTrace.stop();
      return { data, lastVisible };
    } catch (error) {
      await perfTrace.stop();
      handleError(
        error,
        `BaseFirestoreService: query (${this.collectionName})`,
      );
      throw error;
    }
  }
}
