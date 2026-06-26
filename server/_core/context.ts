import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import type { AdminUser } from "../../drizzle/schema";
import { getAdminFromRequest } from "./auth";

export type TrpcContext = {
  req: CreateExpressContextOptions["req"];
  res: CreateExpressContextOptions["res"];
  user: AdminUser | null;
};

export async function createContext(opts: CreateExpressContextOptions): Promise<TrpcContext> {
  const user = await getAdminFromRequest(opts.req);
  return {
    req: opts.req,
    res: opts.res,
    user,
  };
}
