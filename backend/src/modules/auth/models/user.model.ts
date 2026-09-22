export interface User {
  id: number;
  name: string;
  email: string;
  password_hash: string | null;
  google_sub: string | null;
  google_picture: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface RegisterUserDTO {
  name: string;
  email: string;
  password: string;
}

export interface LoginUserDTO {
  email: string;
  password: string;
}

export interface GoogleLoginDTO {
  credential: string;
}