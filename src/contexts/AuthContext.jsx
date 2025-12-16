"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { account } from "@/lib/appwrite";

const AuthContext = createContext();

// Dummy credentials for testing (remove in production)

//TODO: Remove this in production
const DUMMY_USERS = {
  "student@test.com": {
    password: "student123",
    user: {
      $id: "dummy-student-1",
      name: "Test Student",
      email: "student@test.com",
    },
    role: "student",
  },
  "clubadmin@test.com": {
    password: "clubadmin123",
    user: {
      $id: "dummy-clubadmin-1",
      name: "Club Admin",
      email: "clubadmin@test.com",
    },
    role: "club-admin",
  },
  "faculty@test.com": {
    password: "faculty123",
    user: {
      $id: "dummy-faculty-1",
      name: "Test Faculty",
      email: "faculty@test.com",
    },
    role: "faculty",
  },
  "admin@test.com": {
    password: "admin123",
    user: {
      $id: "dummy-admin-1",
      name: "College Admin",
      email: "admin@test.com",
    },
    role: "college-admin",
  },
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState(null); // student, club-admin, event-organizer, faculty, faculty-admin, college-admin

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
      // Check for dummy user session first
      const dummySession = localStorage.getItem("dummyUserSession");
      if (dummySession) {
        const { user: dummyUser, role } = JSON.parse(dummySession);
        setUser(dummyUser);
        setUserRole(role);
        setLoading(false);
        return;
      }

      const currentUser = await account.get();
      setUser(currentUser);
      // In production, fetch role from database
      // For now, using localStorage as placeholder
      const role = localStorage.getItem("userRole") || "student";
      setUserRole(role);
    } catch (_error) {
      setUser(null);
      setUserRole(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      // Check for dummy credentials first
      const dummyUser = DUMMY_USERS[email.toLowerCase()];
      if (dummyUser && dummyUser.password === password) {
        localStorage.setItem(
          "dummyUserSession",
          JSON.stringify({
            user: dummyUser.user,
            role: dummyUser.role,
          }),
        );
        setUser(dummyUser.user);
        setUserRole(dummyUser.role);
        return { success: true };
      }

      // Fall back to Appwrite authentication
      await account.createEmailPasswordSession(email, password);
      await checkUser();
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const signup = async (email, password, name) => {
    try {
      await account.create("unique()", email, password, name);
      await login(email, password);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const logout = async () => {
    try {
      // Clear dummy session if exists
      localStorage.removeItem("dummyUserSession");

      // Try to delete Appwrite session (may fail if using dummy auth)
      try {
        await account.deleteSession("current");
      } catch (_e) {
        // Ignore if no Appwrite session
      }

      setUser(null);
      setUserRole(null);
      localStorage.removeItem("userRole");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const loginWithGoogle = async () => {
    try {
      account.createOAuth2Session(
        "google",
        `${window.location.origin}/dashboard`,
        `${window.location.origin}/auth/login`,
      );
    } catch (error) {
      console.error("Google login error:", error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        userRole,
        loading,
        login,
        signup,
        logout,
        loginWithGoogle,
        setUserRole,
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
