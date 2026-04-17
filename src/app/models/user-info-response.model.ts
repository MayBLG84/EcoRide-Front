export interface Address {
  street?: string;
  number?: string;
  complement?: string;
  city?: string;
  zipcode?: string;
  country?: string;
}

export interface UserInfoResponse {
  userId: string;
  firstName: string;
  lastName: string;
  nickname: string;
  telephone: string;
  email: string;
  roles: string[];
  address?: Address;
  profilePicture?: File | string | null;
  avgRating?: number | null;
}
