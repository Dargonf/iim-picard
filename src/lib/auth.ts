import NextAuth, {type DefaultSession} from "next-auth";
import Credentials from "next-auth/providers/credentials";
import {z} from "zod";
import {prisma} from "@/lib/prisma";
import {compare} from "bcryptjs";

declare module "next-auth" {
    interface User {
        uuid: string;
        username: string;
        sessionVersion: number;
    }

    interface Session {
        invalid?: boolean;
        user: {
            uuid: string;
            username: string;
        } & DefaultSession["user"];
    }
}

// JWT augmentation is handled through NextAuth User interface
// declare module "next-auth/jwt" {
//     interface JWT {
//         uuid: string;
//         username: string;
//         sessionVersion: number;
//         invalid?: boolean;
//     }
// }

export const {handlers, signIn, signOut, auth} = NextAuth({
    providers: [
        Credentials({
            credentials: {
                username: {label: "Username", type: "text", placeholder: "jsmith"},
                password: {label: "Password", type: "password"},
            },
            async authorize(credentials) {
                const parsedCredentials = z
                    .object({username: z.string(), password: z.string()})
                    .safeParse(credentials);

                if (parsedCredentials.success) {
                    const {username, password} = parsedCredentials.data;

                    const user = await prisma.user.findFirst({
                        where: {username},
                    });

                    if (!user) {
                        return null;
                    }

                    const passwordsMatch = await compare(password, user.password);
                    if (!passwordsMatch) {
                        return null;
                    }

                    return {
                        id: user.uuid,
                        uuid: user.uuid,
                        username: user.username,
                        sessionVersion: user.sessionVersion,
                        email: user.email,
                    };
                }

                return null;
            },
        }),
    ],
    pages: {
        signIn: "/login",
    },
    session: {
        strategy: "jwt",
    },
    callbacks: {
        async jwt({token, user}) {
            if (user) {
                token.uuid = user.uuid;
                token.username = user.username;
                token.sessionVersion = user.sessionVersion;
                token.invalid = false;
                return token;
            }

            if (!token.uuid || token.sessionVersion === undefined) {
                token.invalid = true;
                return token;
            }

            const dbUser = await prisma.user.findUnique({
                where: {uuid: token.uuid as string},
                select: {
                    sessionVersion: true,
                },
            });

            if (!dbUser || dbUser.sessionVersion !== token.sessionVersion) {
                token.invalid = true;
            }

            return token;
        },
        async session({session, token}) {
            session.invalid = token.invalid === true;

            if (session.user) {
                session.user.uuid = token.uuid as string;
                session.user.username = token.username as string;
            }

            return session;
        },
    },
});