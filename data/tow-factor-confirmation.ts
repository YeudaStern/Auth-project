import { db } from "@/lib/db";

export const getTowFacorConfirmationByUserId = async (userId: string) => {
    try {
        const towFactorConfirmation = await db.towFactorConfirmation.findUnique({
            where: { userId }
        })
        return towFactorConfirmation
    } catch {
        return null;
    }
}