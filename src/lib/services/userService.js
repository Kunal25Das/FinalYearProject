import { databases } from "@/lib/appwrite";
import { ID, Query } from "appwrite";

const DB = process.env.NEXT_PUBLIC_DB_ID;
const COL = process.env.NEXT_PUBLIC_COL_USERS;

export const userService = {
  async createProfile(
    userId,
    { name, email, role, department, semester, rollNumber },
  ) {
    return databases.createDocument(DB, COL, ID.unique(), {
      name,
      email,
      userId,
      role,
      department,
      semester: semester || "",
      phone: "",
      rollNumber: rollNumber || "",
    });
  },

  async getProfile(userId) {
    const res = await databases.listDocuments(DB, COL, [
      Query.equal("userId", userId),
    ]);
    return res.documents[0] || null;
  },

  async updateProfile(docId, updates) {
    return databases.updateDocument(DB, COL, docId, updates);
  },
};
