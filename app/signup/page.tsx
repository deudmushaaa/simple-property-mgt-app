import { UserAuthForm } from '@/components/auth/user-auth-form';

export default function SignupPage() {
    return (
        <div className="container flex h-screen w-screen flex-col items-center justify-center">
            <UserAuthForm defaultIsSignUp={true} />
        </div>
    );
}
