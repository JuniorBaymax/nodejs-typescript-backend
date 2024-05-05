import firebaseAdmin, { ServiceAccount } from 'firebase-admin';
import serviceAccount from '../oshop-3d90e-firebase-adminsdk-vhr0b-1b6f2f6bb9.json' assert { type: 'json' };

function firebaseLoader() {
  firebaseAdmin.initializeApp({
    credential: firebaseAdmin.credential.cert(serviceAccount as ServiceAccount),
  });
  return firebaseAdmin;
}

export default firebaseLoader;
