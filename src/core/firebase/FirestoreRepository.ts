import {
  getFirestore,
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  limit,
  startAfter,
  serverTimestamp,
  onSnapshot,
  writeBatch,
  runTransaction,
  DocumentData,
  QuerySnapshot,
  WriteBatch,
  Transaction,
} from '@react-native-firebase/firestore';
import { getPerformance, trace } from '@react-native-firebase/perf';
import { handleError, retryWithBackoff } from '../../utils/errorHandler';
import {
  BaseRepository,
  RepositoryQueryOptions,
  QueryResult,
} from './BaseRepository';

const db = getFirestore();

export class FirestoreRepository<T extends { id?: string } & DocumentData>
  implements BaseRepository<T>
{
  protected collectionName: string;

  constructor(collectionName: string) {
    this.collectionName = collectionName;
  }

  protected get collectionRef() {
    return collection(db, this.collectionName);
  }

  protected getDocRef(id: string) {
    return doc(db, this.collectionName, id);
  }

  async create(data: Omit<T, 'id'>, traceName?: string): Promise<string> {
    const perfTrace = trace(
      getPerformance(),
      traceName || `create_${this.collectionName}_trace`,
    );
    await perfTrace.start();
    try {
      const dataWithTimestamp = {
        ...data,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };
      const docRef = await retryWithBackoff(() =>
        addDoc(this.collectionRef, dataWithTimestamp),
      );
      await perfTrace.stop();
      return docRef.id;
    } catch (error) {
      await perfTrace.stop();
      handleError(
        error,
        `FirestoreRepository: create (${this.collectionName})`,
      );
      throw error;
    }
  }

  async setWithId(
    id: string,
    data: Omit<T, 'id'>,
    traceName?: string,
  ): Promise<void> {
    const perfTrace = trace(
      getPerformance(),
      traceName || `setWithId_${this.collectionName}_trace`,
    );
    await perfTrace.start();
    try {
      const docRef = this.getDocRef(id);
      const dataWithTimestamp = {
        ...data,
        updatedAt: serverTimestamp(),
      };
      await retryWithBackoff(() =>
        setDoc(docRef, dataWithTimestamp, { merge: true }),
      );
      await perfTrace.stop();
    } catch (error) {
      await perfTrace.stop();
      handleError(
        error,
        `FirestoreRepository: setWithId (${this.collectionName})`,
      );
      throw error;
    }
  }

  async getById(id: string, traceName?: string): Promise<T | null> {
    const perfTrace = trace(
      getPerformance(),
      traceName || `getById_${this.collectionName}_trace`,
    );
    await perfTrace.start();
    try {
      const docRef = this.getDocRef(id);
      const docSnap = await retryWithBackoff(() => getDoc(docRef));
      await perfTrace.stop();

      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as unknown as T;
      }
      return null;
    } catch (error) {
      await perfTrace.stop();
      handleError(
        error,
        `FirestoreRepository: getById (${this.collectionName})`,
      );
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
      const docRef = this.getDocRef(id);
      const updatesWithTimestamp = {
        ...data,
        updatedAt: serverTimestamp(),
      };
      await retryWithBackoff(() =>
        updateDoc(docRef, updatesWithTimestamp as DocumentData),
      );
      await perfTrace.stop();
    } catch (error) {
      await perfTrace.stop();
      handleError(
        error,
        `FirestoreRepository: update (${this.collectionName})`,
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
      const docRef = this.getDocRef(id);
      await retryWithBackoff(() => deleteDoc(docRef));
      await perfTrace.stop();
    } catch (error) {
      await perfTrace.stop();
      handleError(
        error,
        `FirestoreRepository: delete (${this.collectionName})`,
      );
      throw error;
    }
  }

  async queryDocs(
    options: RepositoryQueryOptions = {},
    traceName?: string,
  ): Promise<QueryResult<T>> {
    const perfTrace = trace(
      getPerformance(),
      traceName || `queryDocs_${this.collectionName}_trace`,
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

      const querySnapshot: QuerySnapshot<DocumentData> = await retryWithBackoff(
        () => getDocs(q),
      );
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
        `FirestoreRepository: queryDocs (${this.collectionName})`,
      );
      throw error;
    }
  }

  subscribeToDoc(
    id: string,
    onUpdate: (data: T | null) => void,
    onError?: (error: Error) => void,
  ): () => void {
    const docRef = this.getDocRef(id);
    return onSnapshot(
      docRef,
      snapshot => {
        if (snapshot.exists()) {
          onUpdate({ id: snapshot.id, ...snapshot.data() } as unknown as T);
        } else {
          onUpdate(null);
        }
      },
      err => {
        handleError(
          err,
          `FirestoreRepository: subscribeToDoc (${this.collectionName})`,
        );
        if (onError) {
          onError(err);
        }
      },
    );
  }

  subscribeToQuery(
    options: RepositoryQueryOptions = {},
    onUpdate: (data: T[]) => void,
    onError?: (error: Error) => void,
  ): () => void {
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

    return onSnapshot(
      q,
      snapshot => {
        const data: T[] = snapshot.docs.map(
          docSnap =>
            ({
              id: docSnap.id,
              ...docSnap.data(),
            } as unknown as T),
        );
        onUpdate(data);
      },
      err => {
        handleError(
          err,
          `FirestoreRepository: subscribeToQuery (${this.collectionName})`,
        );
        if (onError) {
          onError(err);
        }
      },
    );
  }

  async batchWrite(
    batchOperations: (batch: WriteBatch) => void,
    traceName?: string,
  ): Promise<void> {
    const perfTrace = trace(
      getPerformance(),
      traceName || `batchWrite_${this.collectionName}_trace`,
    );
    await perfTrace.start();
    try {
      const batch = writeBatch(db);
      batchOperations(batch);
      await retryWithBackoff(() => batch.commit());
      await perfTrace.stop();
    } catch (error) {
      await perfTrace.stop();
      handleError(
        error,
        `FirestoreRepository: batchWrite (${this.collectionName})`,
      );
      throw error;
    }
  }

  async runTransaction<R>(
    updateFunction: (transaction: Transaction) => Promise<R>,
    traceName?: string,
  ): Promise<R> {
    const perfTrace = trace(
      getPerformance(),
      traceName || `runTransaction_${this.collectionName}_trace`,
    );
    await perfTrace.start();
    try {
      const result = await retryWithBackoff(() =>
        runTransaction(db, updateFunction),
      );
      await perfTrace.stop();
      return result;
    } catch (error) {
      await perfTrace.stop();
      handleError(
        error,
        `FirestoreRepository: runTransaction (${this.collectionName})`,
      );
      throw error;
    }
  }
}
