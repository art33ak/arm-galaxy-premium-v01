import { app } from "./api/server.js";
import { handleMcp } from "./mcp/server.js";
import { config } from "./config.js";

app.all("/mcp", handleMcp);
app.listen(config.port, config.host, () => {
  console.log(`ARM MCP Firebase server: http://${config.host}:${config.port}`);
  console.log("MCP endpoint: /mcp");
});
