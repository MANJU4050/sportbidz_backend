const { createLogger, format, transports } = require("winston");
const { combine, timestamp, label, prettyPrint } = format;

// Logger for http request logs
const requestLogger = createLogger({
  level: "info",
  format: combine(
    label({ label: "HTTP request" }),
    timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    prettyPrint()
  ),
  transports: [new transports.Console()],
});

// Logger for database-related logs
const dbLogger = createLogger({
  level: "info",
  format: combine(
    label({ label: "DatabaseModule" }),
    timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    prettyPrint()
  ),
  transports: [
    new transports.Console(),
  ],
});

// Logger for authentication logs
const authLogger = createLogger({
  level: "info",
  format: combine(
    label({ label: "Authentication" }),
    timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    prettyPrint()
  ),
  transports: [
    new transports.Console(),
  ],
});

const serverLogger = createLogger({
    level: "info",
    format: combine(
      label({ label: "Server state" }),
      timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
      prettyPrint()
    ),
    transports: [
      new transports.Console(),
    ],
  });

  const tournamentLogger = createLogger({
    level: "info",
    format: combine(
      label({ label: "Tournaments" }),
      timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
      prettyPrint()
    ),
    transports: [
      new transports.Console(),
    ],
  });

  const playerLogger = createLogger({
    level: "info",
    format: combine(
      label({ label: "Players" }),
      timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
      prettyPrint()
    ),
    transports: [
      new transports.Console(),
    ],
  });




module.exports = {
  requestLogger,
  dbLogger,
  serverLogger,
  authLogger,
  tournamentLogger,
  playerLogger
}