"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useSession, signIn, signOut } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const { data: session, status, update } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [customRole, setCustomRole] = useState(() => {
    if (typeof window !== "undefined") {
      return sessionStorage.getItem("activeRole") || null;
    }
    return null;
  });

  // Derived state from session
  const user = session?.user || null;
  const userRole = customRole || session?.user?.role || null;

  useEffect(() => {
    if (status === "authenticated" && session?.user) {
      // Force update password redirect
      if (
        session.user.requiresPasswordUpdate &&
        pathname !== "/auth/update-password" &&
        pathname !== "/auth/login"
      ) {
        router.push("/auth/update-password");
      }
    }
  }, [session, status, pathname, router]);

  const login = async (email, password) => {
    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        return { success: false, error: result.error };
      }
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.message || "An error occurred during login",
      };
    }
  };

  const signup = async (_email, _password, _name) => {
    // Signup is now for college admins requesting institute setup.
    // They should use the signup page which submits a signup request.
    return {
      success: false,
      error: "Signup is restricted to Institute Admin signup requests.",
    };
  };

  const logout = async () => {
    try {
      await signOut({ redirect: false });
      setCustomRole(null);
      router.push("/");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const loginWithGoogle = async () => {
    try {
      await signIn("google", { callbackUrl: "/dashboard" });
    } catch (error) {
      console.error("Google login error:", error);
    }
  };

  const updateSession = async (data) => {
    await update(data);
  };

  const setUserRole = (role) => {
    setCustomRole(role);
    if (typeof window !== "undefined") {
      if (role) {
        sessionStorage.setItem("activeRole", role);
      } else {
        sessionStorage.removeItem("activeRole");
      }
    }
    update({ role });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        userRole,
        loading: status === "loading",
        login,
        signup,
        logout,
        loginWithGoogle,
        setUserRole,
        updateSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};
