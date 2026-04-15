export interface ApplicationError extends Error {
  info: string;
  status: number;
  details: string; // raw error message from the backend response body
}
