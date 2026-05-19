import express from "express";

let app;
let initError = null;

try {
  const module = await import("./dist/index.mjs");
  app = module.default;
} catch (err) {
  initError = err;
}

const fallbackApp = express();
fallbackApp.use((req, res) => {
  res.status(500).json({
    error: "Initialization Error",
    message: initError ? initError.message : "Unknown error",
    stack: initError ? initError.stack : null,
  });
});

export default function handler(req, res) {
  if (initError || !app) {
    return fallbackApp(req, res);
  }
  return app(req, res);
}
