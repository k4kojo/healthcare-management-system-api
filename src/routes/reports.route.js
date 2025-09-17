import { Router } from "express";
import {
  createReport,
  deleteReport,
  downloadReport,
  generateReport,
  getReportById,
  getReports,
  updateReport
} from "../controllers/reports.controller.js";
import {
  authenticateToken,
  authorizeRoles
} from "../middlewares/auth.middleware.js";

const reportsRouter = Router();

// All report routes are admin-only

// CRUD Operations
// GET /reports - List all reports
reportsRouter.get(
  "/",
  authenticateToken,
  authorizeRoles("admin"),
  getReports
);

// POST /reports - Create a new report
reportsRouter.post(
  "/",
  authenticateToken,
  authorizeRoles("admin"),
  createReport
);

// GET /reports/:id - Get one report
reportsRouter.get(
  "/:id",
  authenticateToken,
  authorizeRoles("admin"),
  getReportById
);

// PUT /reports/:id - Update a report
reportsRouter.put(
  "/:id",
  authenticateToken,
  authorizeRoles("admin"),
  updateReport
);

// DELETE /reports/:id - Delete a report
reportsRouter.delete(
  "/:id",
  authenticateToken,
  authorizeRoles("admin"),
  deleteReport
);

// Additional endpoints
// GET /reports/:id/download - Download a report
reportsRouter.get(
  "/:id/download",
  authenticateToken,
  authorizeRoles("admin"),
  downloadReport
);

// POST /reports/generate - Legacy endpoint for backward compatibility
reportsRouter.post(
  "/generate",
  authenticateToken,
  authorizeRoles("admin"),
  generateReport
);

export default reportsRouter;
