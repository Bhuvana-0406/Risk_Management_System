import express from "express";
import { writeFileSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Generate PDF report (admin only)
router.get("/generate-pdf", protect, authorize(['admin', 'superadmin']), (req, res) => {
  const csvData = `Name,Email,Score\nJohn,john@example.com,95\nJane,jane@example.com,89`;

  const filePath = path.join(__dirname, "../temp/report.csv");
  writeFileSync(filePath, csvData);

  res.download(filePath, "report.csv", (err) => {
    if (err) {
      console.error("Error sending file:", err);
      res.status(500).send("Download failed");
    }
  });
});

export default router;