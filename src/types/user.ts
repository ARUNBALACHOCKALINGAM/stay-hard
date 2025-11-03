export interface User {
  _id: string;
  name: string;
  email: string;
  photoUrl?: string;
  firebaseUid: string;
  currentChallengeId: string;
  emailVerified: boolean;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
}