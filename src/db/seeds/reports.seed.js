import { v4 as uuidv4 } from "uuid";
import { db } from "../../config/db.js";
import { reports } from "../schema.js";

export async function seedReports(users) {
  // Get admin and doctor users for creating reports
  const adminUsers = users.filter(user => user.role === "admin");
  const doctorUsers = users.filter(user => user.role === "doctor");
  const allReportCreators = [...adminUsers, ...doctorUsers];

  const reportsData = [
    // Overview Reports
    {
      reportId: uuidv4(),
      title: "Monthly Healthcare Overview - January 2024",
      content: "Comprehensive overview of healthcare facility performance for January 2024. Total appointments: 1,247, Patient satisfaction: 94.2%, Revenue: $125,340. Key highlights include 15% increase in patient visits compared to previous month and successful implementation of new telemedicine services.",
      type: "overview",
      status: "completed",
      createdBy: adminUsers[0]?.userId || allReportCreators[0]?.userId,
      fileSize: "2.3MB",
      fileName: "healthcare_overview_jan_2024.pdf",
      createdAt: new Date(2024, 0, 31, 14, 30),
      updatedAt: new Date(2024, 0, 31, 14, 30),
    },
    {
      reportId: uuidv4(),
      title: "Q4 2023 Performance Summary",
      content: "Quarterly performance analysis covering October-December 2023. Patient outcomes improved by 12%, operational efficiency increased by 8%, and staff satisfaction reached 91%. Notable achievements include reduced wait times and enhanced patient care protocols.",
      type: "overview",
      status: "completed",
      createdBy: adminUsers[0]?.userId || allReportCreators[0]?.userId,
      fileSize: "4.1MB",
      fileName: "q4_2023_performance_summary.pdf",
      createdAt: new Date(2024, 0, 15, 10, 0),
      updatedAt: new Date(2024, 0, 15, 10, 0),
    },

    // Patient Reports
    {
      reportId: uuidv4(),
      title: "Patient Demographics Analysis",
      content: "Detailed analysis of patient demographics and trends. Age distribution: 25% (18-30), 35% (31-50), 40% (51+). Gender distribution: 52% female, 48% male. Most common conditions: hypertension (23%), diabetes (18%), respiratory issues (15%). Geographic distribution shows 60% urban, 40% rural patients.",
      type: "patients",
      status: "completed",
      createdBy: doctorUsers[0]?.userId || allReportCreators[1]?.userId,
      fileSize: "1.8MB",
      fileName: "patient_demographics_2024.pdf",
      createdAt: new Date(2024, 1, 10, 9, 15),
      updatedAt: new Date(2024, 1, 10, 9, 15),
    },
    {
      reportId: uuidv4(),
      title: "Patient Satisfaction Survey Results",
      content: "Comprehensive patient satisfaction survey results from 500+ respondents. Overall satisfaction: 94.2%. Areas of excellence: staff friendliness (96%), facility cleanliness (95%), appointment scheduling (92%). Areas for improvement: wait times (87%), parking availability (85%).",
      type: "patients",
      status: "completed",
      createdBy: adminUsers[0]?.userId || allReportCreators[0]?.userId,
      fileSize: "3.2MB",
      fileName: "patient_satisfaction_survey_2024.pdf",
      createdAt: new Date(2024, 1, 20, 16, 45),
      updatedAt: new Date(2024, 1, 20, 16, 45),
    },

    // Revenue Reports
    {
      reportId: uuidv4(),
      title: "Monthly Revenue Report - February 2024",
      content: "February 2024 revenue analysis: Total revenue $142,850 (14% increase from January). Revenue streams: consultations (45%), procedures (30%), medications (15%), lab tests (10%). Insurance claims processed: 892, with 96% approval rate. Outstanding receivables: $23,400.",
      type: "revenue",
      status: "completed",
      createdBy: adminUsers[0]?.userId || allReportCreators[0]?.userId,
      fileSize: "2.7MB",
      fileName: "revenue_report_feb_2024.pdf",
      createdAt: new Date(2024, 2, 5, 11, 30),
      updatedAt: new Date(2024, 2, 5, 11, 30),
    },
    {
      reportId: uuidv4(),
      title: "Insurance Claims Analysis",
      content: "Comprehensive analysis of insurance claims processing. Total claims submitted: 2,847, Approved: 2,734 (96%), Denied: 89 (3%), Pending: 24 (1%). Average processing time: 5.2 days. Top denial reasons: incomplete documentation (45%), pre-authorization required (32%), coverage limitations (23%).",
      type: "revenue",
      status: "completed",
      createdBy: adminUsers[0]?.userId || allReportCreators[0]?.userId,
      fileSize: "1.9MB",
      fileName: "insurance_claims_analysis_2024.pdf",
      createdAt: new Date(2024, 2, 15, 13, 20),
      updatedAt: new Date(2024, 2, 15, 13, 20),
    },

    // Staff Reports
    {
      reportId: uuidv4(),
      title: "Staff Performance Evaluation Q1 2024",
      content: "Quarterly staff performance evaluation covering all departments. Overall performance rating: 4.3/5.0. Top performers: Dr. Sarah Smith (4.9/5), Nurse Manager John Wilson (4.8/5). Areas of excellence: patient care (4.5/5), teamwork (4.4/5), punctuality (4.6/5). Training needs identified in emergency procedures and new technology adoption.",
      type: "staff",
      status: "completed",
      createdBy: adminUsers[0]?.userId || allReportCreators[0]?.userId,
      fileSize: "3.5MB",
      fileName: "staff_performance_q1_2024.pdf",
      createdAt: new Date(2024, 3, 1, 14, 0),
      updatedAt: new Date(2024, 3, 1, 14, 0),
    },
    {
      reportId: uuidv4(),
      title: "Staff Training and Development Report",
      content: "Annual training and development report. Total training hours: 1,240, Staff participation rate: 98%. Completed certifications: CPR (100%), HIPAA compliance (100%), Emergency response (95%). Upcoming training needs: telemedicine protocols, new EHR system, patient communication skills.",
      type: "staff",
      status: "completed",
      createdBy: doctorUsers[1]?.userId || allReportCreators[2]?.userId,
      fileSize: "2.1MB",
      fileName: "staff_training_development_2024.pdf",
      createdAt: new Date(2024, 3, 10, 10, 30),
      updatedAt: new Date(2024, 3, 10, 10, 30),
    },

    // Inventory Reports
    {
      reportId: uuidv4(),
      title: "Medical Inventory Status Report",
      content: "Current medical inventory status and usage patterns. Total inventory value: $89,450. Critical stock levels: Surgical masks (15% remaining), Antibiotics (22% remaining), Disposable syringes (18% remaining). Expired items: $2,340 value. Recommended reorder quantities and suppliers included.",
      type: "inventory",
      status: "completed",
      createdBy: adminUsers[0]?.userId || allReportCreators[0]?.userId,
      fileSize: "2.8MB",
      fileName: "medical_inventory_status_2024.pdf",
      createdAt: new Date(2024, 3, 20, 15, 15),
      updatedAt: new Date(2024, 3, 20, 15, 15),
    },

    // Custom Reports
    {
      reportId: uuidv4(),
      title: "Telemedicine Usage Analysis",
      content: "Custom analysis of telemedicine service adoption and effectiveness. Total telemedicine consultations: 456 (36% of all consultations). Patient satisfaction with telemedicine: 91%. Most common telemedicine cases: follow-up consultations (45%), prescription renewals (30%), initial consultations (25%). Technical issues reported: 3.2%.",
      type: "custom",
      status: "completed",
      createdBy: doctorUsers[2]?.userId || allReportCreators[3]?.userId,
      fileSize: "1.7MB",
      fileName: "telemedicine_usage_analysis_2024.pdf",
      createdAt: new Date(2024, 4, 5, 12, 45),
      updatedAt: new Date(2024, 4, 5, 12, 45),
    },
    {
      reportId: uuidv4(),
      title: "Emergency Response Time Analysis",
      content: "Analysis of emergency response times and protocols. Average response time: 4.2 minutes (target: 5 minutes). Emergency cases handled: 89. Response time distribution: <3 min (34%), 3-5 min (51%), >5 min (15%). Areas for improvement: equipment accessibility, staff communication protocols.",
      type: "custom",
      status: "completed",
      createdBy: doctorUsers[3]?.userId || allReportCreators[4]?.userId,
      fileSize: "2.4MB",
      fileName: "emergency_response_analysis_2024.pdf",
      createdAt: new Date(2024, 4, 15, 8, 30),
      updatedAt: new Date(2024, 4, 15, 8, 30),
    },

    // Pending/In Progress Reports
    {
      reportId: uuidv4(),
      title: "Annual Compliance Audit Report",
      content: "Comprehensive annual compliance audit covering HIPAA, OSHA, and state healthcare regulations. Current progress: 75% complete. Preliminary findings: 98% HIPAA compliance, 95% OSHA compliance, 2 minor violations identified and corrected. Final report expected by month end.",
      type: "overview",
      status: "in_progress",
      createdBy: adminUsers[0]?.userId || allReportCreators[0]?.userId,
      fileSize: null,
      fileName: null,
      createdAt: new Date(2024, 4, 20, 9, 0),
      updatedAt: new Date(2024, 4, 25, 16, 30),
    },
    {
      reportId: uuidv4(),
      title: "Patient Outcome Metrics Study",
      content: "Ongoing study analyzing patient outcome metrics across different treatment protocols. Data collection: 80% complete. Preliminary results show 12% improvement in recovery times with new protocols. Statistical analysis in progress. Expected completion: next month.",
      type: "patients",
      status: "in_progress",
      createdBy: doctorUsers[4]?.userId || allReportCreators[5]?.userId,
      fileSize: null,
      fileName: null,
      createdAt: new Date(2024, 4, 22, 14, 15),
      updatedAt: new Date(2024, 4, 26, 11, 20),
    },
  ];

  const insertedReports = await db.insert(reports).values(reportsData).returning();

  console.log(`📊 Seeded ${insertedReports.length} reports`);
  return insertedReports;
}
