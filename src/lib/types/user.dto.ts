export interface UserDTO {
  _id: string;
  email: string;
  primerNombre: string;
  segundoNombre?: string;
  primerApellido: string;
  segundoApellido?: string;
  username: string;
  isActive:boolean;
}