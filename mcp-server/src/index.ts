import express from "express";
import { app } from "./api/server.js";
import { handleMcp } from "./mcp/server.js";
import { config } from "./config.js";

void express;

app.all("/mcp", handleMcp);

export default app;

if (!process.env.VERCEL) {
  const httpServer = app.listen(config.port, config.host, () => {
    console.log(`ARM MCP Firebase server: http://${config.host}:${config.port}`);
    console.log("MCP endpoint: /mcp");
  });

  let shuttingDown = false;

  function shutdown(signal: string): void {
    if (shuttingDown) return;
    shuttingDown = true;

    console.log(`${signal} received. Shutting down ARM MCP server...`);

    const forceExit = setTimeout(() => {
      console.error("Graceful shutdown timed out.");
      process.exit(1);
    }, 10000);

    forceExit.unref();

    httpServer.close((error) => {
      clearTimeout(forceExit);

      if (error) {
        console.error("HTTP server shutdown failed.");
        process.exitCode = 1;
        return;
      }

      console.log("ARM MCP server stopped safely.");
      process.exitCode = 0;
    });
  }

  process.on("SIGINT", () => shutdown("SIGINT"));
  process.on("SIGTERM", () => shutdown("SIGTERM"));
}
