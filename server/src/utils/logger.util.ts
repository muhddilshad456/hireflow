import pino from "pino";

const isDev = process.env.NODE_ENV !== "production";

export const logger = pino({
  level: "info",

  transport: {
    targets: [
      ...(isDev
        ? [
            {
              target: "pino-pretty",
              options: {
                colorize: true,
              },
            },
          ]
        : []),

      {
        target: "pino/file",
        options: {
          destination: "./logs/app.log",
        },
      },

      {
        target: "pino/file",
        level: "error",
        options: {
          destination: "./logs/error.log",
        },
      },
    ],
  },
});
