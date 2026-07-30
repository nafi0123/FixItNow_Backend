export interface ITechnicianFilterRequest {
  searchTerm?: string;
  location?: string;
  rating?: string;
  skills?: string;
  page?: number | string;
  limit?: number | string;
}

export interface IServiceFilterRequest {
  searchTerm?: string;
  categoryId?: string;
  page?: number | string;
  limit?: number | string;
}

export interface ICategoryFilterRequest {
  searchTerm?: string;
  search?: string;
  page?: number | string;
  limit?: number | string;
}