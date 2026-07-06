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