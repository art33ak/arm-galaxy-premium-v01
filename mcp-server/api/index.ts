import { app } from "../src/api/server.js";
import { handleMcp } from "../src/mcp/server.js";

app.all("/mcp", handleMcp);

export default app;
