import express from "express";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const PORT = Number(process.env.PORT ?? 3000);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distDir = path.join(__dirname, "dist");

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API routes (add more under /api)
app.get("/api/health", (req, res) => res.json({ status: "ok" }));
app.get("/api/hello", (req, res) => {
    res.json({ message: "Hello from Express!" });
});

// Serve built frontend (if it exists)
if (fs.existsSync(distDir)) {
    app.use(express.static(distDir));

    // SPA fallback
    app.get("*", (req, res) => {
        res.sendFile(path.join(distDir, "index.html"));
    });
} else {
    app.get("*", (req, res) => {
        res.status(404).send(
            "No front-end build found. Run `npm run build` first and then start the server."
        );
    });
}

app.listen(PORT, () => {
    console.log(`Express server running at http://localhost:${PORT}`);
});
