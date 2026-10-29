export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  profilePicture?: string | null;
}

export interface AuthState {
  user: User | null;
  token: string | null;
}
