import { Navbar } from './_components/NavBar';

interface ProtectedLayoutProps {
    children: React.ReactNode;
}


const ProtectedLayout = ({ children }: ProtectedLayoutProps) => {
    return (
        <div className="h-full w-full flex-col gap-y-10 flex items-center justify-center bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/80 to-primary">
            <Navbar/>
            {children}
        </div>
    );
}

export default ProtectedLayout;