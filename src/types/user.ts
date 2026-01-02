export interface User {
  _id: string;
  name: string;
  email: string;
  photoUrl?: string;
  firebaseUid: string;
  currentChallengeId: string;
  emailVerified: boolean;
  provider?: 'local' | 'google' | 'firebase';
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
}