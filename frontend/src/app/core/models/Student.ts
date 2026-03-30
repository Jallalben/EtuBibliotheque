export interface Student {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  created_at?: string;
  updated_at?: string;
}

export interface CreateStudent {
  firstName: string;
  lastName: string;
  email: string;
}
