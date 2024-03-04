import { useSession } from "next-auth/react"

export const useCurrentRole = () => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const session = useSession()

    return session.data?.user?.role;
}