// services/authService.ts
import type { User as FirebaseUser } from 'firebase/auth';
import type { User } from '../types/user';
import { API_URL } from '../utils/config';

class AuthService {
  /**
   * Verify Firebase user with backend
   */
  async verifyUser(firebaseUser: FirebaseUser): Promise<User> {
    try {
      const idToken = await firebaseUser.getIdToken(true)

      const response = await fetch(`${API_URL}/auth/verify`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${idToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        return data.user;
      }

      // Fallback to client-side user if backend verification fails
      console.warn('Backend verification failed, using client-side user data');
      return this.createFallbackUser(firebaseUser);
      
    } catch (error) {
      console.error('Error verifying user:', error);
      return this.createFallbackUser(firebaseUser);
    }
  }

  /**
   * Create fallback user from Firebase data
   */
  private createFallbackUser(firebaseUser: FirebaseUser): User {
    return {
      _id: '', // Backend will generate this
      name: firebaseUser.displayName || 'User',
      email: firebaseUser.email || '',
      photoUrl: firebaseUser.photoURL || '',
      firebaseUid: firebaseUser.uid,
      emailVerified: firebaseUser.emailVerified,
      currentChallengeId: 'undefined',
      lastLogin: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  /**
   * Register or update user in backend
   */
  async registerUser(firebaseUser: FirebaseUser): Promise<User> {
    try {
      const idToken = await firebaseUser.getIdToken();

      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${idToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firebaseUid: firebaseUser.uid,
          email: firebaseUser.email,
          name: firebaseUser.displayName,
          photoUrl: firebaseUser.photoURL,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to register user');
      }

      const data = await response.json();
      return data.user;
      
    } catch (error) {
      console.error('Error registering user:', error);
      throw error;
    }
  }

  /**
   * Get user profile from backend
   */
  async getUserProfile(userId: string, idToken: string): Promise<User> {
    try {
      const response = await fetch(`${API_URL}/users/${userId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${idToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch user profile');
      }

      const data = await response.json();
      return data.user;
      
    } catch (error) {
      console.error('Error fetching user profile:', error);
      throw error;
    }
  }

  /**
   * Local user signup
   */
  async signupLocal(name: string, email: string, password: string): Promise<User> {
    try {
      const response = await fetch(`${API_URL}/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          email,
          password,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to sign up');
      }

      const data = await response.json();
      return data.user;
      
    } catch (error) {
      console.error('Error signing up:', error);
      throw error;
    }
  }

  /**
   * Local user signin
   */
  async signinLocal(email: string, password: string): Promise<User> {
    try {
      const response = await fetch(`${API_URL}/auth/signin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to sign in');
      }

      const data = await response.json();
      return data.user;
      
    } catch (error) {
      console.error('Error signing in:', error);
      throw error;
    }
  }
}

export const authService = new AuthService();