export interface MecanicoAuth {
  id: string;
  email: string;
  name: string;
  role: string;
  permissions: string[];
  roleName: string;
  token: string;
  exp: number;
}