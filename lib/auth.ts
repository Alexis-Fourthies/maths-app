import { GetServerSidePropsContext } from "next";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret";

export function getUserFromRequest(ctx: GetServerSidePropsContext) {
  const cookie = ctx.req.headers.cookie;
  if (!cookie) return null;
  const match = cookie.match(/session=([^;]+)/);
  if (!match) return null;
  try {
    const payload = jwt.verify(match[1], JWT_SECRET) as {
      id: number;
      role: string;
      classe?: string;
    };
    return payload;
  } catch {
    return null;
  }
}
