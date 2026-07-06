import { databases } from "@/lib/appwrite";
import { ID, Query } from "appwrite";

const DB = process.env.NEXT_PUBLIC_DB_ID;
const COL = process.env.NEXT_PUBLIC_COL_VOLUNTEERS;

export const volunteerService = {
  async create({ userId, name, clubId }) {
    return databases.createDocument(DB, COL, ID.unique(), {
      userId,
      name,
      skills: [],
      clubId,
    });
  },

  async getByUserId(userId) {
    const res = await databases.listDocuments(DB, COL, [
      Query.equal("userId", userId),
    ]);
    return res.documents[0] || null;
  },

  async delete(volunteerDocId) {
    return databases.deleteDocument(DB, COL, volunteerDocId);
  },
};
