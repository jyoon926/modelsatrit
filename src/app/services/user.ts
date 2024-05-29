export interface User {
  _id: number;
  username: string;
  email: string;
  firstname: string;
  lastname: string;
  isadmin: boolean;
  ispublic: boolean;
  gender: string;
  race: Array<string>;
  height: number;
  waist: number;
  hip: number;
  chest: number;
  eyes: string;
  shoe: number;
  hair: string;
  bio: string;
  instagram: string;
  photos: Array<string>;
}
