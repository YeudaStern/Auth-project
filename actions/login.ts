'use server'

import { z } from "zod"
import { LoginSchema } from "@/schemas"
import { signIn } from "@/auth"
import { DEFAULT_LOGIN_REDIRECT } from "@/routes"
import { AuthError } from "next-auth"
import { getUserByEmail } from "@/data/user"
import { generateVerificationToken, generateTowFactorToken } from "@/lib/tokens"
import { sendVerificationEmail, sentTwoFactorTokenEmail } from "@/lib/mail"
import { getTwoFactorTokenByEmail } from '../data/two-factor-token';
import { db } from "@/lib/db"
import { getTowFacorConfirmationByUserId } from '../data/tow-factor-confirmation';

export const login = async (values: z.infer<typeof LoginSchema>, callBBackUrl?: string | null) => {
    const validatedFields = LoginSchema.safeParse(values);

    if (!validatedFields.success) {
        return { error: "Invalid fields!" };
    }


    const { email, password, code } = validatedFields.data

    const existingUser = await getUserByEmail(email)

    if (!existingUser || !existingUser.email || !existingUser.password) {
        return { error: "email dous not exist!" };
    }

    if (!existingUser.emailVerified) {
        const verificationToken = await generateVerificationToken(
            existingUser.email,
        )

        await sendVerificationEmail(
            verificationToken.email,
            verificationToken.token,
        )

        return { success: "Confirmation email sent!" }
    }

    if (existingUser.isTwoFactorEnabled && existingUser.email) {
        if (code) {
            const towFactorToken = await getTwoFactorTokenByEmail(
                existingUser.email
            )

            if (!towFactorToken) {
                return { error: "Invalid code!" }
            }

            if (towFactorToken.token !== code) {
                return { error: "Invalid code!" }
            }

            const hasExpired = new Date(towFactorToken.expires) < new Date()

            if (hasExpired) {
                return { error: "Code expired!" }
            }

            await db.towFactorToken.delete({
                where: { id: towFactorToken.id }
            })

            const existingConfirmation = await getTowFacorConfirmationByUserId(existingUser.id)
            if (existingConfirmation) {
                await db.towFactorConfirmation.delete({
                    where: { id: existingConfirmation.id }
                })
            }

            await db.towFactorConfirmation.create({
                data: {
                    userId: existingUser.id
                }
            })
        }

        else {
            const towFactorToken = await generateTowFactorToken(existingUser.email)
            await sentTwoFactorTokenEmail(
                towFactorToken.email,
                towFactorToken.token
            )

            return { towFactor: true }

        }
    }

    try {
        await signIn("credentials", {
            email,
            password,
            redirectTo: callBBackUrl || DEFAULT_LOGIN_REDIRECT,
        })
    } catch (error) {
        if (error instanceof AuthError) {
            switch (error.type) {
                case "CredentialsSignin":
                    return { error: "Invalid credentials!" }
                default:
                    return { error: "Something went wrong!" }
            }
        }

        throw error;
    }
}