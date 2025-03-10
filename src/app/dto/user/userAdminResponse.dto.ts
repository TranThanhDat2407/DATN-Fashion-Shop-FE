export interface UserAdminResponse {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  gender: string;
  dateOfBirth: string; // Định dạng ISO "yyyy-MM-dd'T'HH:mm:ss"
  role: Role;
  is_active: boolean;
}

export interface Role {
  id: number;
  name: string;
}
