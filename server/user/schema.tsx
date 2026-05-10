export type BookingUser = {
  id: string;
  name: string;
  nickname: string | null;
  email: string;
};

export type ClientTableRow = {
  id: string;
  name: string;
  avatarUrl: string | null;
  lastSessionAt: number | null;
  totalSessions: number;
};

export type UserOption = {
  id: string;
  name: string;
  nickname: string | null;
  email: string;
};
