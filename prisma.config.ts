import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: "postgresql://neondb_owner:npg_zAJemH69yKhG@ep-young-night-ai1fs56q-pooler.c-4.us-east-1.aws.neon.tech/neondb?sslmode=verify-full",
  },
});
