import "dotenv/config";
import { app } from "./app";
import { migrate } from "./db/migrate";

const PORT = process.env.PORT ?? 3001;

async function main() {
  await migrate();
  app.listen(PORT, () => {
    console.log(`[server] listening on port ${PORT}`);
  });
}

main().catch((err) => {
  console.error("[server] startup error:", err);
  process.exit(1);
});
