export class RegisterDTO {
  first_name: string;
  last_name: string;
  phone: string;
  email: string;
  password: string;
  retype_password: string;
  passwordMatching: boolean;
  gender: string;
  dateOfBirth: string;
  isActive: boolean = true;
  storeId: number = 0;
  google_account_id: string | null = null;
  role_id: number = 2;

  constructor(data: any) {
    this.first_name = data.first_name;
    this.last_name = data.last_name;
    this.phone = data.phone;
    this.email = data.email;
    this.password = data.password;
    this.retype_password = data.retype_password;
    this.passwordMatching = data.password === data.retype_password;
    this.gender = data.gender;

    this.dateOfBirth = new Date(data.dateOfBirth).toISOString();
    this.isActive = true; // Mặc định là true
    this.storeId = 0; // Mặc định là 0
    this.google_account_id = data.google_account_id || null; // Có thể null
    this.role_id = 2; // Mặc định là 2
  }
}

