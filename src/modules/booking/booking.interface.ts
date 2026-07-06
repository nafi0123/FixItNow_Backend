export interface ICreateBookingRequest {
  technicianProfileId: string;
  bookingDate: string; 
  slot: string;       
  serviceId?: string;  
}