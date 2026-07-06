export interface ICreateCategoryRequest {
  name: string;
  description?: string;
}


export interface IUpdateUserStatusRequest {
  isBanned: boolean;
}