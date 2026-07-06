"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { account } from "@/lib/appwrite";
import { ID } from "appwrite";
import { userService } from "@/lib/services/userService";

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
  "organizer@test.com": {
    password: "organizer123",
    user: {
      $id: "dummy-organizer-1",
      name: "Event Organizer",
      email: "organizer@test.com",
    },
    role: "event-organizer",
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
  "hod@test.com": {
    password: "hod123",
    user: {
      $id: "dummy-hod-1",
      name: "Dr. Department Head",
      email: "hod@test.com",
    },
    role: "dept-admin",
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
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
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

      const profile = await userService.getProfile(currentUser.$id);
      if (profile) {
        setUserProfile(profile);
        setUserRole(profile.role);
      } else {
        setUserRole("student");
      }
    } catch (_error) {
      setUser(null);
      setUserProfile(null);
      setUserRole(null);
      console.error("Error checking user:", _error);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
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

      await account.createEmailPasswordSession(email, password);
      await checkUser();
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const signup = async (
    email,
    password,
    name,
    role = "student",
    extraData = {},
  ) => {
    try {
      const newAccount = await account.create(
        ID.unique(),
        email,
        password,
        name,
      );

      await account.createEmailPasswordSession(email, password);

      const profile = await userService.createProfile(newAccount.$id, {
        name,
        email,
        role,
        ...extraData,
      });

      setUser(newAccount);
      setUserProfile(profile);
      setUserRole(role);

      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const logout = async () => {
    try {
      localStorage.removeItem("dummyUserSession");

      try {
        await account.deleteSession("current");
      } catch (_error) {
        console.error("Error deleting Appwrite session:", _error);
      }

      setUser(null);
      setUserProfile(null);
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
        userProfile,
        userRole,
        loading,
        login,
        signup,
        logout,
        loginWithGoogle,
        setUserRole,
        refreshProfile: checkUser,
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
