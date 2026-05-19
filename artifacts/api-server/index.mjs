import express from "express";

let app;
let initError = null;

try {
  const module = await import("./dist/index.mjs");
  app = module.default;
} catch (err) {
  initError = err;
}

export default function handler(req, res) {
  if (initError || !app) {
    return res.status(500).json({
      stage: "init",
      message: initError?.message,
      stack: initError?.stack,
    });
  }

  // Wrap request handling to catch synchronous crashes
  try {
    app(req, res, (err) => {
      if (err) {
        return res.status(500).json({
          stage: "request",
          message: err.message,
          stack: err.stack,
        });
      }
    });
  } catch (err) {
    res.status(500).json({
      stage: "request-sync",
      message: err.message,
      stack: err.stack,
    });
  }
}
