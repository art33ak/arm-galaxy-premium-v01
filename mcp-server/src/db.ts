import { readFile } from "node:fs/promises";
import { initializeApp, getApps, cert, type ServiceAccount } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { config } from "./config.js";

const serviceAccount = JSON.parse(
  await readFile(config.firebaseServiceAccountPath, "utf8")
) as ServiceAccount & { project_id?: string };

if (serviceAccount.project_id !== config.firebaseProjectId) {
  throw new Error("Firebase service-account project_id does not match FIREBASE_PROJECT_ID");
}

const app = getApps().length
  ? getApps()[0]!
  : initializeApp({
      credential: cert(serviceAccount),
      projectId: config.firebaseProjectId
    });

export const db = getFirestore(app);

export async function healthCheck() {
  await db.collection("players").limit(1).get();
  return true;
}
