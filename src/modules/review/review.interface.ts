export interface ICreateReviewRequest {
  technicianProfileId: string;
  bookingId: string;
  rating: number;
  comment: string;
}