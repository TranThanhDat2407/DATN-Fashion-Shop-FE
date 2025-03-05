export interface UserDetailDTO {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  gender: string;
  role: {
    id: number;
    name: string;
  };
  is_active: boolean;
  google_account_id?: string | null;
}
