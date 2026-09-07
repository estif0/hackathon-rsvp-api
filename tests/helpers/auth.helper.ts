import crypto from "node:crypto";
import { auth } from "../../src/modules/auth/auth";
import { prisma } from "../../src/config/db";

export interface TestUser {
  id: string;
  name: string;
  email: string;
  role: "admin" | "student";
  cookie: string;
}

export const createTestUser = async (role: "admin" | "student" = "student"): Promise<TestUser> => {
  const randomSuffix = crypto.randomBytes(4).toString("hex");
  const email = `${role}-${randomSuffix}@test.com`;
  const name = `Test ${role}`;

  const response = await auth.api.signUpEmail({
    body: {
      name,
      email,
      password: "Password123!",
    },
    asResponse: true,
  });

  const cookie = response.headers.get("set-cookie") ?? "";

  const user = await prisma.user.findUniqueOrThrow({ where: { email } });

  if (role === "admin") {
    await prisma.user.update({
      where: { id: user.id },
      data: { role: "admin" },
    });
  }

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role,
    cookie,
  };
};
