export interface Address {
  street?: string;
  number?: string;
  complement?: string;
  city?: string;
  zipcode?: string;
  country?: string;
}

export interface UserSignupRequest {
  firstName: string;
  lastName: string;
  nickname: string;
  birthday: { year: number; month: number; day: number };
  telephone: string;
  email: string;
  password: string;
  usageType: 'PASSENGER' | 'DRIVER' | 'BOTH';
  address?: Address;
  profilePicture?: File | null;
}
