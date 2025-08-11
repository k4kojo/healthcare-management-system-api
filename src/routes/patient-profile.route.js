import { Router } from "express";
import { getMyPatientProfile, upsertMyPatientProfile } from "../controllers/patientProfile.controller.js";
import { authenticateToken } from "../middlewares/auth.middleware.js";
import { validateBody } from "../middlewares/validate.middleware.js";
import { upsertPatientProfileSchema } from "../validators/patientProfileSchema.js";

const patientProfileRouter = Router();

patientProfileRouter.get("/me", authenticateToken, getMyPatientProfile);
patientProfileRouter.put("/me", authenticateToken, validateBody(upsertPatientProfileSchema), upsertMyPatientProfile);

export default patientProfileRouter;


