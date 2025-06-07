// Type for auth result
export type AuthResult = {
  user: {
    id: string;
    name: string | null;
    email: string | null;
    image: string | null;
    role: string;
  } | null;
  session: any;
};

// Type for user info
export type UserInfo = {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
  role: string;
};
