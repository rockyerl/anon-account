import { db } from "@/db";
import { auditLogs, type AuditLog } from "@/db/schema";
import { desc } from "drizzle-orm";

export async function getRecentAuditLogs(limit = 20): Promise<AuditLog[]> {
  return db.select().from(auditLogs).orderBy(desc(auditLogs.createdAt)).limit(limit);
}
