export interface ITechnicianFilterRequest {
  searchTerm?: string;
  location?: string;
  rating?: string;
  skills?: string; 
}

export interface IServiceFilterRequest {
  searchTerm?: string;
  categoryId?: string;
}