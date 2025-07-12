import { useState } from "react";
import LoginForm from "./login-form";
import SignupForm from "./signup-form";

interface AuthWrapperProps {
  onSuccess: (user: any) => void;
}

export default function AuthWrapper({ onSuccess }: AuthWrapperProps) {
  const [isLogin, setIsLogin] = useState(true);

  const toggleForm = () => {
    setIsLogin(!isLogin);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FF6B35]/10 via-white to-[#2E8B57]/10 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {isLogin ? (
          <LoginForm onToggleForm={toggleForm} onSuccess={onSuccess} />
        ) : (
          <SignupForm onToggleForm={toggleForm} onSuccess={onSuccess} />
        )}
      </div>
    </div>
  );
}