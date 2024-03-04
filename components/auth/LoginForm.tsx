'use client'

import * as z from "zod"
import { useForm } from "react-hook-form";
import { CardWrapper } from "./CardWrapper";
import { LoginSchema } from "@/schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../ui/form";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { FormError } from "../form-error";
import { FormSuccess } from "../form-success";
import { login } from "@/actions/login";
import { useState, useTransition } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

export const LoginForm = () => {

    const searchParams = useSearchParams()
    const callBackUrl = searchParams.get("callBackUrl")
    const urlError = searchParams.get("error") === "OAuthAccountNotLinked" ? "Email alredy in use with diffrent provider!" : "";

    const [showTowFactor, setShowTowFactor] = useState(false)
    const [error, setError] = useState<string | undefined>("");
    const [success, setSuccess] = useState<string | undefined>("");

    const [isPending, startTransition] = useTransition()

    const form = useForm<z.infer<typeof LoginSchema>>({
        resolver: zodResolver(LoginSchema),
        defaultValues: {
            email: "",
            password: ""
        }
    })

    const onSubmit = (values: z.infer<typeof LoginSchema>) => {
        setError("")
        setSuccess("")

        startTransition(() => {
            login(values, callBackUrl)
                .then((data) => {
                    if (data?.error) {
                        form.reset()
                        setSuccess(data?.success)
                    }
                    if (data?.success) {
                        form.reset()
                        setSuccess(data.success)
                    }

                    if (data?.towFactor) {
                        setShowTowFactor(true)
                    }
                })
                .catch(() => setError("Something went wrong!"))
        })

    }

    return (
        <CardWrapper
            headerLabel="Welcome back"
            backButtonLabel="Don't have an account?"
            backButtonHref="/auth/register"
            showSocial
        >
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)}
                    className="space-y-6"
                >
                    <div className="space-y-4">
                        {showTowFactor && (
                            <FormField
                                control={form.control}
                                name="code"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Tow Factor Code</FormLabel>
                                        <FormControl >
                                            <Input
                                                {...field}
                                                placeholder="123456"
                                                disabled={isPending}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        )}
                        {!showTowFactor && (
                            <>
                                <FormField
                                    control={form.control}
                                    name="email"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Email</FormLabel>
                                            <FormControl >
                                                <Input
                                                    {...field}
                                                    placeholder="jonn.doe@exemple.com"
                                                    type="email"
                                                    disabled={isPending}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="password"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Password</FormLabel>
                                            <FormControl >
                                                <Input
                                                    {...field}
                                                    placeholder="******"
                                                    type="password"
                                                    disabled={isPending}
                                                />
                                            </FormControl>
                                            <Button size="sm" variant="link" asChild className="px-0">
                                                <Link href="/auth/reset">
                                                    forgot passwort?
                                                </Link>
                                            </Button>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </>
                        )}
                    </div>
                    <FormError message={error || urlError} />
                    <FormSuccess message={success} />
                    <Button disabled={isPending} type="submit" className="w-full">
                        {showTowFactor ? "Confirm" : "Login"}
                    </Button>
                </form>

            </Form>
        </CardWrapper>
    );
}

