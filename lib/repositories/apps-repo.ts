import { and, asc, desc, eq, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { appContent, apps, type AppStatus, type AppType } from "@/db/schema";

export interface AppRecord {
  id: string;
  ownerId: string;
  slug: string;
  type: AppType;
  templateId: string;
  status: AppStatus;
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
  publishedAt: Date | null;
}

export interface AppContentRecord {
  id: string;
  appId: string;
  version: number;
  schemaVersion: number;
  content: Record<string, unknown>;
  isCurrent: boolean;
  createdAt: Date;
  createdBy: string | null;
}

export interface AppWithCurrentContent {
  app: AppRecord;
  currentContent: AppContentRecord | null;
}

function mapApp(row: typeof apps.$inferSelect): AppRecord {
  return {
    ...row,
    slug: row.slug as string,
  };
}

function mapContent(row: typeof appContent.$inferSelect): AppContentRecord {
  return {
    ...row,
    content: row.content as Record<string, unknown>,
  };
}

export async function countHostedAppsByOwner(ownerId: string): Promise<number> {
  const [row] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(apps)
    .where(eq(apps.ownerId, ownerId));

  return row?.count ?? 0;
}

export async function findAppBySlug(slug: string): Promise<AppRecord | null> {
  const [row] = await db.select().from(apps).where(eq(apps.slug, slug)).limit(1);
  return row ? mapApp(row) : null;
}

export async function findAppById(appId: string): Promise<AppRecord | null> {
  const [row] = await db.select().from(apps).where(eq(apps.id, appId)).limit(1);
  return row ? mapApp(row) : null;
}

export async function findAppByIdForOwner(
  appId: string,
  ownerId: string
): Promise<AppRecord | null> {
  const [row] = await db
    .select()
    .from(apps)
    .where(and(eq(apps.id, appId), eq(apps.ownerId, ownerId)))
    .limit(1);
  return row ? mapApp(row) : null;
}

export async function listAppsByOwner(ownerId: string): Promise<AppRecord[]> {
  const rows = await db
    .select()
    .from(apps)
    .where(eq(apps.ownerId, ownerId))
    .orderBy(desc(apps.updatedAt), asc(apps.slug));
  return rows.map(mapApp);
}

export async function getCurrentContent(appId: string): Promise<AppContentRecord | null> {
  const [row] = await db
    .select()
    .from(appContent)
    .where(and(eq(appContent.appId, appId), eq(appContent.isCurrent, true)))
    .limit(1);
  return row ? mapContent(row) : null;
}

export async function getContentVersion(
  appId: string,
  version: number
): Promise<AppContentRecord | null> {
  const [row] = await db
    .select()
    .from(appContent)
    .where(and(eq(appContent.appId, appId), eq(appContent.version, version)))
    .limit(1);
  return row ? mapContent(row) : null;
}

export async function createAppWithInitialContent(input: {
  ownerId: string;
  slug: string;
  type: AppType;
  templateId: string;
  status: AppStatus;
  isPublic: boolean;
  createdBy: string;
  content: Record<string, unknown>;
  schemaVersion?: number;
}): Promise<AppWithCurrentContent> {
  return db.transaction(async (tx) => {
    const now = new Date();
    const [createdApp] = await tx
      .insert(apps)
      .values({
        ownerId: input.ownerId,
        slug: input.slug,
        type: input.type,
        templateId: input.templateId,
        status: input.status,
        isPublic: input.isPublic,
        createdAt: now,
        updatedAt: now,
        publishedAt: input.status === "published" ? now : null,
      })
      .returning();

    const [createdContent] = await tx
      .insert(appContent)
      .values({
        appId: createdApp.id,
        version: 1,
        schemaVersion: input.schemaVersion ?? 1,
        content: input.content,
        isCurrent: true,
        createdBy: input.createdBy,
        createdAt: now,
      })
      .returning();

    return {
      app: mapApp(createdApp),
      currentContent: mapContent(createdContent),
    };
  });
}

export async function createNextContentVersion(input: {
  appId: string;
  content: Record<string, unknown>;
  schemaVersion?: number;
  createdBy?: string;
}): Promise<AppContentRecord> {
  return db.transaction(async (tx) => {
    const now = new Date();

    const [latest] = await tx
      .select()
      .from(appContent)
      .where(eq(appContent.appId, input.appId))
      .orderBy(desc(appContent.version))
      .limit(1);

    const nextVersion = latest ? latest.version + 1 : 1;
    const schemaVersion = input.schemaVersion ?? latest?.schemaVersion ?? 1;

    if (latest && latest.isCurrent) {
      await tx
        .update(appContent)
        .set({ isCurrent: false })
        .where(and(eq(appContent.appId, input.appId), eq(appContent.isCurrent, true)));
    }

    const [created] = await tx
      .insert(appContent)
      .values({
        appId: input.appId,
        version: nextVersion,
        schemaVersion,
        content: input.content,
        isCurrent: true,
        createdBy: input.createdBy ?? null,
        createdAt: now,
      })
      .returning();

    await tx
      .update(apps)
      .set({ updatedAt: now })
      .where(eq(apps.id, input.appId));

    return mapContent(created);
  });
}

export async function updateCurrentContentInPlace(input: {
  appId: string;
  content: Record<string, unknown>;
  schemaVersion: number;
}): Promise<AppContentRecord | null> {
  const now = new Date();

  const [updated] = await db
    .update(appContent)
    .set({
      content: input.content,
      schemaVersion: input.schemaVersion,
      createdAt: now,
    })
    .where(and(eq(appContent.appId, input.appId), eq(appContent.isCurrent, true)))
    .returning();

  if (updated) {
    await db
      .update(apps)
      .set({ updatedAt: now })
      .where(eq(apps.id, input.appId));
  }

  return updated ? mapContent(updated) : null;
}

export async function updateAppById(
  appId: string,
  ownerId: string,
  patch: Partial<{
    slug: string;
    type: AppType;
    templateId: string;
    status: AppStatus;
    isPublic: boolean;
    publishedAt: Date | null;
  }>
): Promise<AppRecord | null> {
  const nextPatch: Record<string, unknown> = {
    ...patch,
    updatedAt: new Date(),
  };

  const [row] = await db
    .update(apps)
    .set(nextPatch)
    .where(and(eq(apps.id, appId), eq(apps.ownerId, ownerId)))
    .returning();

  return row ? mapApp(row) : null;
}

export async function deleteAppById(appId: string, ownerId: string): Promise<boolean> {
  const result = await db
    .delete(apps)
    .where(and(eq(apps.id, appId), eq(apps.ownerId, ownerId)))
    .returning({ id: apps.id });

  return result.length > 0;
}

export async function findPublishedAppBySlug(slug: string): Promise<AppWithCurrentContent | null> {
  const [appRow] = await db
    .select()
    .from(apps)
    .where(and(eq(apps.slug, slug), eq(apps.status, "published"), eq(apps.isPublic, true)))
    .limit(1);

  if (!appRow) return null;

  const currentContent = await getCurrentContent(appRow.id);

  return {
    app: mapApp(appRow),
    currentContent,
  };
}

export async function getAppWithCurrentContentForOwner(
  appId: string,
  ownerId: string
): Promise<AppWithCurrentContent | null> {
  const appRow = await findAppByIdForOwner(appId, ownerId);
  if (!appRow) return null;

  const currentContent = await getCurrentContent(appRow.id);
  return { app: appRow, currentContent };
}

