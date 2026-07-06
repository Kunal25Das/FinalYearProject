import { account, databases } from "@/lib/appwrite";
import { ID, Query } from "appwrite";

const DB = process.env.NEXT_PUBLIC_DB_ID;
const COL = process.env.NEXT_PUBLIC_COL_CLUBS;

export const clubService = {
  async listAll() {
    const res = await databases.listDocuments(DB, COL, [
      Query.equal("isApproved", false), // this needs to be false to show only unapproved clubs, a feature to be applied later
      Query.orderDesc("memberCount"),
    ]);
    return res.documents;
  },

  async clubContext() {
    try {
      const user = await account.get();
      const adminId = user.$id;

      const clubSearch = await databases.listDocuments(DB, COL, [
        Query.equal("adminId", adminId),
      ]);

      return clubSearch.documents[0] || null;
    } catch (error) {
      console.error("Error fetching club context:", error);
      return null;
    }
  },

  async getById(clubId) {
    return databases.getDocument(DB, COL, clubId);
  },

  async getByAdminId(adminId) {
    const res = await databases.listDocuments(DB, COL, [
      Query.equal("adminId", adminId),
    ]);
    return res.documents[0] || null;
  },

  async create({
    name,
    description,
    category,
    icon,
    color,
    adminId,
    adminName,
  }) {
    return databases.createDocument(DB, COL, ID.unique(), {
      name,
      description,
      category,
      icon,
      color,
      adminId,
      adminName,
      clubId: ID.unique(),
      memberIds: [],
      memberCount: 0,
      eventCount: 0,
      achievements: [],
      isApproved: false,
    });
  },

  async join(clubDocId, userId, currentMemberIds) {
    if (currentMemberIds.includes(userId)) return;
    return databases.updateDocument(DB, COL, clubDocId, {
      memberIds: [...currentMemberIds, userId],
      memberCount: currentMemberIds.length + 1,
    });
  },

  async update(clubDocId, updates) {
    return databases.updateDocument(DB, COL, clubDocId, updates);
  },

  async delete(clubDocId) {
    return databases.deleteDocument(DB, COL, clubDocId);
  },
};
