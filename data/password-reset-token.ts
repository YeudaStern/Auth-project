import { db } from "@/lib/db";

export const getPasswordResetTokenByToken = async (token: string) => {
    try {
        const passwordResetToken = await db.psswordResetToken.findUnique({
            where: { token }
        })

        return passwordResetToken
    } catch {

    } return null;
}

export const getPasswordResetTokenByEmail = async (email: string) => {
    try {
        const passwordResetToken = await db.psswordResetToken.findFirst({
            where: { email }
        })

        return passwordResetToken
    } catch {

    } return null;
}