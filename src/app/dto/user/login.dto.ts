
export class LoginDTO {
  email: string;
  password: string;
  role_id: number;

constructor(data: any) {
this.email = data.email;
this.password = data.password;
this.role_id = data?.role_id;
}

}
