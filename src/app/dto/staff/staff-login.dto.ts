
export class StaffLoginDto {
  email: string;
  password: string;
  store_id: number;

constructor(data: any) {
this.email = data.email;
this.password = data.password;
this.store_id = data?.store_id;
}

}
