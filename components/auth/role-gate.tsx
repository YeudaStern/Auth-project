'use client'

import { useCurrentUser } from "@/hooks/use-current-user";
import { UserRole } from "@prisma/client";
import { FormError } from "../form-error";
import { useCurrentRole } from "@/hooks/use-current-role";

interface RoleProps {
    children: React.ReactNode;
    alloweRole: UserRole;
}

export const RoleGate = ({ children, alloweRole }: RoleProps) => {
    const role = useCurrentRole()

    if (role !== alloweRole) {
        return (
            <FormError message="You do not have promission to view this content" />
        )
    }

    return (
        <>
            {children}
        </>
    );
}