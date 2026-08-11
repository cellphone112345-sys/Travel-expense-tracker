import { createApp } from "./app";
import { env } from "./config/env";
import { ensureDefaultCategories } from "./services/defaultCategories";

const app = createApp();

ensureDefaultCategories()
  .catch((err) => console.error("Failed to seed default categories:", err))
  .finally(() => {
    app.listen(env.port, "0.0.0.0", () => {
      console.log(`Server listening on http://0.0.0.0:${env.port} (${env.nodeEnv})`);
    });
  });
