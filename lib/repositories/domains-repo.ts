import { and, asc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { appDomains, apps, type DomainStatus } from "@/db/schema";

export interface AppDomainRecord {
  id: string;
  appId: string;
  domain: string;
  isPrimary: boolean;
  status: DomainStatus;
  verificationMethod: string;
  verificationToken: string;
  dnsTarget: string;
  lastCheckedAt: Date | null;
  verifiedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

function mapDomain(row: typeof appDomains.$inferSelect): AppDomainRecord {
  return {
    ...row,
    domain: row.domain as string,
  };
}

export async function listAppDomains(appId: string): Promise<AppDomainRecord[]> {
  const rows = await db
    .select()
    .from(appDomains)
    .where(eq(appDomains.appId, appId))
    .orderBy(asc(appDomains.createdAt));
  return rows.map(mapDomain);
}

export async function getAppDomain(appId: string, domainId: string): Promise<AppDomainRecord | null> {
  const [row] = await db
    .select()
    .from(appDomains)
    .where(and(eq(appDomains.appId, appId), eq(appDomains.id, domainId)))
    .limit(1);
  return row ? mapDomain(row) : null;
}

export async function createAppDomain(input: {
  appId: string;
  domain: string;
  verificationToken: string;
  isPrimary: boolean;
  dnsTarget: string;
}): Promise<AppDomainRecord> {
  return db.transaction(async (tx) => {
    const now = new Date();
    if (input.isPrimary) {
      await tx
        .update(appDomains)
        .set({ isPrimary: false, updatedAt: now })
        .where(and(eq(appDomains.appId, input.appId), eq(appDomains.isPrimary, true)));
    }

    const [created] = await tx
      .insert(appDomains)
      .values({
        appId: input.appId,
        domain: input.domain,
        verificationToken: input.verificationToken,
        isPrimary: input.isPrimary,
        dnsTarget: input.dnsTarget,
        status: "pending_verification",
        createdAt: now,
        updatedAt: now,
      })
      .returning();

    return mapDomain(created);
  });
}

export async function verifyAppDomain(appId: string, domainId: string): Promise<AppDomainRecord | null> {
  return db.transaction(async (tx) => {
    const now = new Date();
    const [row] = await tx
      .update(appDomains)
      .set({
        status: "active",
        verifiedAt: now,
        lastCheckedAt: now,
        updatedAt: now,
      })
      .where(and(eq(appDomains.id, domainId), eq(appDomains.appId, appId)))
      .returning();

    return row ? mapDomain(row) : null;
  });
}

export async function markAppDomainFailed(
  appId: string,
  domainId: string
): Promise<AppDomainRecord | null> {
  const now = new Date();
  const [row] = await db
    .update(appDomains)
    .set({
      status: "failed",
      lastCheckedAt: now,
      updatedAt: now,
    })
    .where(and(eq(appDomains.id, domainId), eq(appDomains.appId, appId)))
    .returning();

  return row ? mapDomain(row) : null;
}

export async function removeAppDomain(appId: string, domainId: string): Promise<boolean> {
  const [row] = await db
    .delete(appDomains)
    .where(and(eq(appDomains.id, domainId), eq(appDomains.appId, appId)))
    .returning({ id: appDomains.id });

  return Boolean(row);
}

export async function findActiveDomainMapping(domain: string): Promise<{
  appId: string;
  ownerId: string;
  slug: string;
} | null> {
  const domainsToTry = [domain];
  if (domain.startsWith("www.")) {
    domainsToTry.push(domain.slice(4));
  } else if (domain && !domain.includes("localhost")) {
    domainsToTry.push(`www.${domain}`);
  }

  for (const d of domainsToTry) {
    const [row] = await db
      .select({
        appId: appDomains.appId,
        ownerId: apps.ownerId,
        slug: apps.slug,
      })
      .from(appDomains)
      .innerJoin(apps, eq(appDomains.appId, apps.id))
      .where(
        and(
          eq(appDomains.domain, d),
          eq(appDomains.status, "active"),
          eq(apps.status, "published"),
          eq(apps.isPublic, true)
        )
      )
      .limit(1);

    if (row) {
      return {
        appId: row.appId,
        ownerId: row.ownerId,
        slug: row.slug as string,
      };
    }
  }

  return null;
}
