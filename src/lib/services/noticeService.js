import { databases } from "@/lib/appwrite";
import { ID, Query } from "appwrite";

const DB = process.env.NEXT_PUBLIC_DB_ID;
const COL = process.env.NEXT_PUBLIC_COL_NOTICES;

export const noticeService = {
  async listAll() {
    const res = await databases.listDocuments(DB, COL, [
      Query.orderDesc("date"),
    ]);
    return res.documents;
  },

  async getById(noticeId) {
    return databases.getDocument(DB, COL, noticeId);
  },

  async getByClubId(clubId) {
    const res = await databases.listDocuments(DB, COL, [
      Query.equal("clubId", clubId),
    ]);
    return res.documents;
  },

  async create({ title, content, type, clubId, pinned }) {
    return databases.createDocument(DB, COL, ID.unique(), {
      title,
      content,
      type,
      clubId,
      pinned,
    });
  },

  async update(noticeId, updates) {
    return databases.updateDocument(DB, COL, noticeId, updates);
  },

  async delete(noticeId) {
    return databases.deleteDocument(DB, COL, noticeId);
  },
};
