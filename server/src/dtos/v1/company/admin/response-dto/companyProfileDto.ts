export interface ProfileResponseDto {
  basicDetails: {
    id: string;
    name: string;
    email: string;
    role: string;
    isVerified: boolean;
  };

  companyDetails: {
    id: string;
    companyName: string;
    email: string;
    phone: string;
    regNumber: string;
    website?: string;
    description: string;
    address: string;
    country: string;
    state: string;
    city: string;
    zip: string;
    document: string;
    isActive: boolean;
  } | null;
}
