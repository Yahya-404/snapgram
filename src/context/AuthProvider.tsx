import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { IUser } from "@/types";
import { getCurrentUser } from "@/lib/appwrite/backend";

// An object containing the user's default values.
export const INITIAL_USER = {
  id: "",
  name: "",
  username: "",
  email: "",
  imageUrl: "",
  bio: "",
};

// The object that contains the default values for the context, including the user, loading state, authentication state, and functions to update these values.
const INITIAL_STATE = {
  user: INITIAL_USER,
  isLoading: false,
  isAuthenticated: false,
  setUser: () => {},
  setIsAuthenticated: () => {},
  checkAuthUser: async () => false as boolean,
};

// TypeScript type to define the shape of the context data and the functions it contains.
type IContextType = {
  user: IUser;
  isLoading: boolean;
  setUser: React.Dispatch<React.SetStateAction<IUser>>;
  isAuthenticated: boolean;
  setIsAuthenticated: React.Dispatch<React.SetStateAction<boolean>>;
  checkAuthUser: () => Promise<boolean>;
};

// Create a context using the default values.
const AuthContext = createContext<IContextType>(INITIAL_STATE);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const [user, setUser] = useState<IUser>(INITIAL_USER);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // دالة تتحقق من المستخدم الحالي وتحدث الحالة بناءً على ذلك.
  const checkAuthUser = async () => {
    setIsLoading(true);
    try {
      const currentUser = await getCurrentUser();
      if (currentUser) {
        setUser({
          id: currentUser.$id,
          name: currentUser.name,
          username: currentUser.username,
          email: currentUser.email,
          imageUrl: currentUser.imageUrl,
          bio: currentUser.bio,
        });
        setIsAuthenticated(true);
        return true;
      }
      return false;
    } catch (error) {
      console.log(error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // تأثير جانبي يتم تشغيله عند تركيب المكون للتحقق من حالة المصادقة وتوجيه المستخدم إلى صفحة تسجيل الدخول إذا لم يكن مصدقاً.
  useEffect(() => {
    const cookieFallback = localStorage.getItem("cookieFallback");
    if (
      cookieFallback === "[]" ||
      cookieFallback === null ||
      cookieFallback === undefined
    ) {
      navigate("/sign-in");
    }
    // Always Callback No Matter What
    checkAuthUser();

  }, []);

  const value = {
    user,
    setUser,
    isLoading,
    isAuthenticated,
    setIsAuthenticated,
    checkAuthUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useUserContext = () => useContext(AuthContext);
