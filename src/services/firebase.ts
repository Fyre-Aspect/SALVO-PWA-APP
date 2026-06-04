import type { Incident, SignUpData, User, FalseAlarmReport } from "@/types";
import { mockIncident } from "@/data/mockIncident";
import { auth, db } from "@/lib/firebase";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as fbSignOut,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import {
  collection,
  doc,
  getDoc,
  setDoc,
  addDoc,
  updateDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
} from "firebase/firestore";

const FAKE_LATENCY = 1_200;

function delay<T>(value: T, ms = FAKE_LATENCY): Promise<T> {
  return new Promise((res) => setTimeout(() => res(value), ms));
}

export async function signIn(
  email: string,
  password: string
): Promise<{ user: User }> {
  if (!auth || !db) {
    const user: User = {
      id: "mock-001",
      name: email.split("@")[0] || "Responder",
      email,
      certificationId: "SG-04821",
      zone: "North District",
      isAuthenticated: true,
    };
    return delay({ user });
  }

  const credential = await signInWithEmailAndPassword(auth, email, password);
  const uid = credential.user.uid;
  const userDoc = await getDoc(doc(db, "users", uid));

  if (!userDoc.exists()) {
    throw new Error("User profile not found in database.");
  }

  const data = userDoc.data();
  const user: User = {
    id: uid,
    name: data.name || credential.user.displayName || "Responder",
    email: credential.user.email || undefined,
    certificationId: data.certificationId || "N/A",
    zone: data.zone || "N/A",
    isAuthenticated: true,
  };
  return { user };
}

export async function signUp(data: SignUpData): Promise<{ user: User }> {
  if (!auth || !db) {
    const user: User = {
      id: "mock-001",
      name: data.name,
      email: data.email,
      zone: data.zone,
      isAuthenticated: true,
    };
    return delay({ user });
  }

  const credential = await createUserWithEmailAndPassword(
    auth,
    data.email,
    data.password
  );
  const uid = credential.user.uid;

  await setDoc(doc(db, "users", uid), {
    name: data.name,
    email: data.email,
    zone: data.zone,
    createdAt: serverTimestamp(),
  });

  const user: User = {
    id: uid,
    name: data.name,
    email: data.email,
    zone: data.zone,
    isAuthenticated: true,
  };
  return { user };
}

export async function signOut(): Promise<void> {
  if (!auth) {
    return delay(undefined, 200);
  }
  await fbSignOut(auth);
}

export function subscribeToIncidents(
  callback: (incident: Incident) => void
): () => void {
  if (!db) {
    // Phase 1: seed mock incident after a short delay so the dashboard isn't empty on load.
    const t = setTimeout(() => callback(mockIncident), 1_500);
    return () => clearTimeout(t);
  }

  const q = query(
    collection(db, "incidents"),
    where("status", "==", "active"),
    orderBy("detectedAt", "desc")
  );

  const unsub = onSnapshot(
    q,
    (snapshot) => {
      if (!snapshot.empty) {
        const docSnap = snapshot.docs[0];
        const data = docSnap.data();

        const incident: Incident = {
          id: docSnap.id,
          zone: data.zone || "Unknown Zone",
          severity: data.severity || "elevated",
          detectedAt: data.detectedAt?.toDate?.() || new Date(data.detectedAt) || new Date(),
          snapshotUrl: data.snapshotUrl || null,
          liveFeedUrl: data.liveFeedUrl || "",
          aiLog: (data.aiLog || []).map((log: any) => ({
            timestamp: log.timestamp?.toDate?.() || new Date(log.timestamp) || new Date(),
            message: log.message || "",
          })),
          nearbyResponders: data.nearbyResponders ?? 0,
          nearestEta: data.nearestEta || "",
          nearestDistanceKm: data.nearestDistanceKm ?? 0,
          status: data.status || "active",
          location: data.location,
        };
        callback(incident);
      }
    },
    (error) => {
      console.error("Firestore incidents subscription failed:", error);
    }
  );

  return unsub;
}

export async function reportFalseAlarm(report: FalseAlarmReport): Promise<void> {
  if (!db) {
    console.info("[salvo] false alarm reported", report);
    return delay(undefined, 600);
  }

  await addDoc(collection(db, "falseAlarmReports"), {
    incidentId: report.incidentId,
    reason: report.reason,
    notes: report.notes,
    submittedAt: serverTimestamp(),
  });

  await updateDoc(doc(db, "incidents", report.incidentId), {
    status: "dismissed",
  });
}

export async function confirmDispatch(
  incidentId: string,
  responderId: string
): Promise<void> {
  if (!db) {
    console.info("[salvo] dispatch confirmed", { incidentId, responderId });
    return delay(undefined, 400);
  }

  await updateDoc(doc(db, "incidents", incidentId), {
    status: "responding",
    responderId,
  });
}

export async function signInWithGoogle(): Promise<{ user: User }> {
  if (!auth || !db) {
    const user: User = {
      id: "mock-google-001",
      name: "Google Responder",
      email: "google.responder@salvo.io",
      zone: "North District",
      isAuthenticated: true,
    };
    return delay({ user });
  }

  const provider = new GoogleAuthProvider();
  const credential = await signInWithPopup(auth, provider);
  const uid = credential.user.uid;
  const userDocRef = doc(db, "users", uid);
  const userDoc = await getDoc(userDocRef);

  let name = credential.user.displayName || "Google Responder";
  let email = credential.user.email || undefined;
  let zone = "North District"; // Default fallback zone for new users

  if (!userDoc.exists()) {
    // New Google sign-in: write initial Firestore profile document
    await setDoc(userDocRef, {
      name,
      email: email || "",
      zone,
      createdAt: serverTimestamp(),
    });
  } else {
    // Existing user: pull their existing name and zone from Firestore
    const data = userDoc.data();
    name = data.name || name;
    zone = data.zone || zone;
  }

  const user: User = {
    id: uid,
    name,
    email,
    zone,
    isAuthenticated: true,
  };
  return { user };
}

