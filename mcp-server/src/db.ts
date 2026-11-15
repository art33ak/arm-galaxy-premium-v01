import { readFile } from "node:fs/promises";
import { initializeApp, getApps, cert, type ServiceAccount } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { config } from "./config.js";

const emulatorHost = process.env.FIRESTORE_EMULATOR_HOST?.trim();
if (emulatorHost && config.nodeEnv === "production") {
  throw new Error("Firestore Emulator is not allowed in production");
}

let app = getApps()[0];

if (emulatorHost) {
  if (!config.firebaseProjectId.startsWith("demo-")) {
    throw new Error("Firestore Emulator requires a demo-* Firebase project ID");
  }

  if (!app) {
    app = initializeApp({
      projectId: config.firebaseProjectId
    });
  }
} else {
  const serviceAccount = JSON.parse(
    await readFile(config.firebaseServiceAccountPath, "utf8")
  ) as ServiceAccount & { project_id?: string };

  if (serviceAccount.project_id !== config.firebaseProjectId) {
    throw new Error("Firebase service-account project_id does not match FIREBASE_PROJECT_ID");
  }

  if (!app) {
    app = initializeApp({
      credential: cert(serviceAccount),
      projectId: config.firebaseProjectId
    });
  }
}

export const db = getFirestore(app);

export async function healthCheck() {
  await db.collection("players").limit(1).get();
  return true;
}
