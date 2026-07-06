export interface IUpdateTechnicianProfile {
  bio?: string;
  skills?: string[];
  experience?: number;
  basePrice?: number;
  location?: string;
}

export interface IUpdateTechnicianAvailability {
  availability: any; 
}

export interface ICreateServiceRequest {
  name: string;
  description: string;
  price: number;
  duration: string;
  categoryId: string; 
}

export interface IUpdateBookingStatusRequest {
  status: 'ACCEPTED' | 'DECLINED' | 'COMPLETED';
}