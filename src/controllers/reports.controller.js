import { desc, eq } from "drizzle-orm";
import { db } from "../config/db.js";
import { reports } from "../db/schema/reports.js";
import { users } from "../db/schema/users.js";

/**
 * Get all reports
 * GET /reports
 */
export const getReports = async (req, res) => {
  try {
    console.log("Fetching all reports from database...");

    // Get all reports with creator information
    const allReports = await db
      .select({
        id: reports.id,
        reportId: reports.reportId,
        title: reports.title,
        content: reports.content,
        type: reports.type,
        status: reports.status,
        createdBy: reports.createdBy,
        fileSize: reports.fileSize,
        fileName: reports.fileName,
        createdAt: reports.createdAt,
        updatedAt: reports.updatedAt,
        // Creator info
        creatorFirstName: users.firstName,
        creatorLastName: users.lastName,
        creatorEmail: users.email,
      })
      .from(reports)
      .leftJoin(users, eq(users.userId, reports.createdBy))
      .orderBy(desc(reports.createdAt));

    // Format reports for frontend
    const formattedReports = allReports.map(report => ({
      id: report.reportId, // Use reportId for external API consistency
      name: report.title, // Map title to name for frontend compatibility
      description: report.content.length > 100 
        ? report.content.substring(0, 100) + "..." 
        : report.content,
      type: report.type,
      status: report.status || "completed",
      fileSize: report.fileSize || "N/A",
      lastGenerated: report.createdAt,
      createdBy: report.creatorFirstName && report.creatorLastName 
        ? `${report.creatorFirstName} ${report.creatorLastName}` 
        : "Unknown",
      creatorEmail: report.creatorEmail,
      fullContent: report.content
    }));

    console.log(`Found ${formattedReports.length} reports`);
    res.json(formattedReports);

  } catch (error) {
    console.error("Error in getReports:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * Get a specific report by ID
 * GET /reports/:id
 */
export const getReportById = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`Fetching report with ID: ${id}`);

    const [report] = await db
      .select({
        id: reports.id,
        reportId: reports.reportId,
        title: reports.title,
        content: reports.content,
        type: reports.type,
        status: reports.status,
        createdBy: reports.createdBy,
        fileSize: reports.fileSize,
        fileName: reports.fileName,
        createdAt: reports.createdAt,
        updatedAt: reports.updatedAt,
        // Creator info
        creatorFirstName: users.firstName,
        creatorLastName: users.lastName,
        creatorEmail: users.email,
      })
      .from(reports)
      .leftJoin(users, eq(users.userId, reports.createdBy))
      .where(eq(reports.reportId, id));

    if (!report) {
      return res.status(404).json({ error: "Report not found" });
    }

    // Format report for frontend
    const formattedReport = {
      id: report.reportId,
      name: report.title,
      description: report.content.length > 100 
        ? report.content.substring(0, 100) + "..." 
        : report.content,
      type: report.type,
      status: report.status || "completed",
      fileSize: report.fileSize || "N/A",
      lastGenerated: report.createdAt,
      createdBy: report.creatorFirstName && report.creatorLastName 
        ? `${report.creatorFirstName} ${report.creatorLastName}` 
        : "Unknown",
      creatorEmail: report.creatorEmail,
      fullContent: report.content
    };

    res.json(formattedReport);

  } catch (error) {
    console.error("Error in getReportById:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * Create a new report
 * POST /reports
 */
export const createReport = async (req, res) => {
  try {
    const { title, content, type } = req.body;
    const { userId } = req.user;

    console.log(`Creating new report: ${title}`);

    // Validate required fields
    if (!title || !content || !type) {
      return res.status(400).json({ 
        error: "Title, content, and type are required" 
      });
    }

    // Insert new report into database
    const [newReport] = await db
      .insert(reports)
      .values({
        title: title.trim(),
        content: content.trim(),
        type: type.trim(),
        createdBy: userId,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    console.log(`Report created successfully with ID: ${newReport.id}`);

    // Return formatted report
    const formattedReport = {
      id: newReport.reportId,
      name: newReport.title,
      description: newReport.content.length > 100 
        ? newReport.content.substring(0, 100) + "..." 
        : newReport.content,
      type: newReport.type,
      status: newReport.status || "completed",
      fileSize: newReport.fileSize || "N/A",
      lastGenerated: newReport.createdAt,
      fullContent: newReport.content
    };

    res.status(201).json(formattedReport);

  } catch (error) {
    console.error("Error in createReport:", error);
    res.status(500).json({ 
      error: "Internal server error",
      message: error.message 
    });
  }
};

/**
 * Update an existing report
 * PUT /reports/:id
 */
export const updateReport = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, type } = req.body;
    const { userId } = req.user;

    console.log(`Updating report with ID: ${id}`);

    // Check if report exists
    const [existingReport] = await db
      .select()
      .from(reports)
      .where(eq(reports.reportId, id));

    if (!existingReport) {
      return res.status(404).json({ error: "Report not found" });
    }

    // For now, allow any admin to edit any report
    // In future, you might want to restrict to creator only
    
    // Update report
    const [updatedReport] = await db
      .update(reports)
      .set({
        ...(title && { title: title.trim() }),
        ...(content && { content: content.trim() }),
        ...(type && { type: type.trim() }),
        updatedAt: new Date(),
      })
      .where(eq(reports.reportId, id))
      .returning();

    console.log(`Report updated successfully: ${updatedReport.reportId}`);

    // Return formatted report
    const formattedReport = {
      id: updatedReport.reportId,
      name: updatedReport.title,
      description: updatedReport.content.length > 100 
        ? updatedReport.content.substring(0, 100) + "..." 
        : updatedReport.content,
      type: updatedReport.type,
      status: updatedReport.status || "completed",
      fileSize: updatedReport.fileSize || "N/A",
      lastGenerated: updatedReport.updatedAt,
      fullContent: updatedReport.content
    };

    res.json(formattedReport);

  } catch (error) {
    console.error("Error in updateReport:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * Download a report (return full content)
 * GET /reports/:id/download
 */
export const downloadReport = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`Downloading report ${id}`);

    const [report] = await db
      .select()
      .from(reports)
      .where(eq(reports.reportId, id));

    if (!report) {
      return res.status(404).json({ error: "Report not found" });
    }

    // Return the full content for download
    res.json({
      success: true,
      title: report.title,
      content: report.content,
      type: report.type,
      createdAt: report.createdAt,
    });

  } catch (error) {
    console.error("Error in downloadReport:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * Delete a report
 * DELETE /reports/:id
 */
export const deleteReport = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`Deleting report ${id}`);

    // Check if report exists
    const [existingReport] = await db
      .select()
      .from(reports)
      .where(eq(reports.reportId, id));

    if (!existingReport) {
      return res.status(404).json({ error: "Report not found" });
    }

    // Delete the report
    await db
      .delete(reports)
      .where(eq(reports.reportId, id));

    console.log(`Report deleted successfully: ${id}`);
    res.status(204).send();

  } catch (error) {
    console.error("Error in deleteReport:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Legacy function name for backward compatibility with existing frontend
export const generateReport = createReport;