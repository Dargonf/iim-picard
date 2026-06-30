import { DefaultUser } from "next-auth";
declare module "next-auth" {
  interface User extends DefaultUser {
    uuid: string;
    username: string;
    sessionVersion: number;
  }

  interface Session {
    invalid?: boolean;
    user: {
      uuid: string;
      username: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    uuid: string;
    username: string;
    sessionVersion: number;
    invalid?: boolean;
  }
}