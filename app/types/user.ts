export interface User {
  id: number | null;
  name: string | null;
  username: string | null;
  bio: string | null;
  creationDate: string | null;
  token: string | null;
  status: string | null;
  seed: string | null;  //avatar seed
  style: string | null; //avatar style
  hasSeenDashboard: boolean | null;
  hasSeenMapOwner: boolean | null;
  hasSeenMapUser: boolean | null;
}
