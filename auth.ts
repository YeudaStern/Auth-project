import NextAuth, { type Session } from "next-auth";
import authConfig from "./auth.config";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { db } from "./lib/db";
import { getUserById } from "./data/user";
import { UserRole } from "@prisma/client";
import { getTowFacorConfirmationByUserId } from "./data/tow-factor-confirmation";
import { getAccountById } from "./data/account";

export const {
    handlers: { GET, POST },
    auth,
    signIn,
    signOut,
  
} = NextAuth({

    pages: {
        signIn: "/auth/login",
        error: "/auth/error",
    }
    ,
    events: {
        async linkAccount({ user }) {
            await db.user.update({
                where: { id: user.id },
                data: { emailVerified: new Date() }
            })
        }
    },

    callbacks: {
        async signIn({ user, account }) {

            if (account?.provider !== "credentials") return true

            const existingUser = await getUserById(user.id as string)

            if (!existingUser?.emailVerified) {
                return false
            }

            if (existingUser.isTwoFactorEnabled) {
                const towFactorConfirmation = await getTowFacorConfirmationByUserId(existingUser.id)

                if (!towFactorConfirmation) return false

                await db.towFactorConfirmation.delete({
                    where: { id: towFactorConfirmation.id }
                })
            }

            return true;
        },
        async session({ token, session, }: { session: Session, token?: any }) {
            if (token.sub && session.user) {
                session.user.id = token.sub;
            }

            if (token.role && session.user) {
                session.user.role = token.role as UserRole
            }

            if (session.user) {
                session.user.isTwoFactorEnabled = token.isTwoFactorEnabled as boolean;
            }

            if (session.user) {
                session.user.name = token.name;
                session.user.email = token.email;
                session.user.isOAuth = token.isOAuth;
            }

            return session
        },
        async jwt({ token }) {

            if (!token.sub) return token;

            const existingUser = await getUserById(token.sub)

            if (!existingUser) return token;
            const existingAccount = await getAccountById(existingUser.id);

            token.isOAuth = !!existingAccount;
            token.name = existingUser.name;
            token.email = existingUser.email;
            token.role = existingUser.role;
            token.isTowFactorEnabled = existingUser.isTwoFactorEnabled

            return token;
        }
    },
    adapter: PrismaAdapter(db),
    session: { strategy: "jwt" },
    ...authConfig
})