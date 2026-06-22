import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

const bootstrapEmail = process.env.ADMIN_EMAIL || "admin@solarpro.com";
const bootstrapPassword = process.env.ADMIN_PASSWORD || "admin123";

export async function findAdminCredential() {
  try {
    return await prisma.adminCredential.findFirst({ orderBy: { createdAt: "asc" } });
  } catch {
    return null;
  }
}

export async function verifyAdminCredentials(email: string, password: string) {
  try {
    const credential = await prisma.adminCredential.findUnique({ where: { email } });
    if (credential) {
      const isValid = await bcrypt.compare(password, credential.passwordHash);
      return isValid ? credential : null;
    }

    if (email === bootstrapEmail && password === bootstrapPassword) {
      return await prisma.adminCredential.create({
        data: {
          email: bootstrapEmail,
          passwordHash: await bcrypt.hash(bootstrapPassword, 10),
        },
      });
    }
  } catch {
    if (email === bootstrapEmail && password === bootstrapPassword) {
      return {
        id: "bootstrap-admin",
        email: bootstrapEmail,
        passwordHash: "",
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    }
  }

  return null;
}

export async function saveAdminCredentials(email: string, password: string) {
  try {
    const existing = await findAdminCredential();
    const passwordHash = await bcrypt.hash(password, 10);

    if (existing) {
      return await prisma.adminCredential.update({
        where: { id: existing.id },
        data: { email, passwordHash },
      });
    }

    return await prisma.adminCredential.create({
      data: { email, passwordHash },
    });
  } catch {
    return null;
  }
}

export async function getAdminLoginEmail() {
  const credential = await findAdminCredential();
  return credential?.email || bootstrapEmail;
}
