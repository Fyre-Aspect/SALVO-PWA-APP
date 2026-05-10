// STUB — Firebase wiring lands in Phase 2.
// API mirrors what we'll wire to firebase/auth + firestore so the call sites don't change.

import type { Incident, SignUpData, User, FalseAlarmReport } from "@/types";
import { mockIncident } from "@/data/mockIncident";

const FAKE_LATENCY = 1_200;

function delay<T>(value: T, ms = FAKE_LATENCY): Promise<T> {
  return new Promise((res) => setTimeout(() => res(value), ms));
}

export async function signIn(
  email: string,
  _password: string
): Promise<{ user: User }> {
  // TODO: firebase.auth().signInWithEmailAndPassword(email, password)
  void _password;
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

export async function signUp(data: SignUpData): Promise<{ user: User }> {
  // TODO: firebase.auth().createUserWithEmailAndPassword(...)
  const user: User = {
    id: "mock-001",
    name: data.name,
    email: data.email,
    certificationId: data.certificationId,
    zone: data.zone,
    isAuthenticated: true,
  };
  return delay({ user });
}

export async function signOut(): Promise<void> {
  // TODO: firebase.auth().signOut()
  return delay(undefined, 200);
}

export function subscribeToIncidents(
  callback: (incident: Incident) => void
): () => void {
  // TODO: firestore().collection('incidents').where('status','==','active').onSnapshot(...)
  // Phase 1: seed mock incident after a short delay so the dashboard isn't empty on load.
  const t = setTimeout(() => callback(mockIncident), 1_500);
  return () => clearTimeout(t);
}

export async function reportFalseAlarm(report: FalseAlarmReport): Promise<void> {
  // TODO: firestore().collection('falseAlarmReports').add(report)
  console.info("[salvo] false alarm reported", report);
  return delay(undefined, 600);
}

export async function confirmDispatch(
  incidentId: string,
  responderId: string
): Promise<void> {
  // TODO: firestore().collection('incidents').doc(incidentId).update({ status: 'en-route', responderId })
  console.info("[salvo] dispatch confirmed", { incidentId, responderId });
  return delay(undefined, 400);
}
