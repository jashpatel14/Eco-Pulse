const { PrismaClient } = require("@prisma/client");
const logger = require("../utils/logger");

const prisma = new PrismaClient({
  log: [
    { level: "query", emit: "event" },
    { level: "info", emit: "stdout" },
    { level: "warn", emit: "stdout" },
    { level: "error", emit: "stdout" },
  ],
});

prisma.$on("query", (e) => {
  logger.debug(`Query: ${e.query} | Params: ${e.params} | Duration: ${e.duration}ms`);
});

module.exports = prisma;
