export type User = {
  id: number;
  name: string;
  email: string;
  phone: string;
  birthday: string;
  gender: boolean;
  role: string;
  password?: string;
  avatar?: string;
};

export type UsersPaged = {
  pageIndex: number;
  pageSize: number;
  totalRow: number;
  keywords: string | null;
  data: User[];
};

export type CreateUserRequest = {
  name: string;
  email: string;
  phone: string;
  birthday: string;
  gender: boolean;
  role: string;
  password: string;
};

export type UpdateUserRequest = {
  id: number;
  name: string;
  email: string;
  phone: string;
  birthday: string;
  gender: boolean;
  role: string;
};
