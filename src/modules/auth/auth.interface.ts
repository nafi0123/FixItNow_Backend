export type UserRole = 'CUSTOMER' | 'TECHNICIAN' | 'ADMIN';

export interface IRegisterUserRequest {
  name: string;
  email: string;
  password: string;
  role: UserRole;
}
export interface ILoginUserRequest {
  email: string;
  password: string;
}
