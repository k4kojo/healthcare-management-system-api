import { eq } from "drizzle-orm";
import { db } from "../config/db.js";
import { doctorAvailability } from "../db/schema/doctorAvailability.js";

export const getAllDoctorAvailability = async (req, res) => {
  const { role, userId } = req.user;

  try {
    let query = db.select().from(doctorAvailability);

    if (role === "doctor") {
      query = query.where(eq(doctorAvailability.doctorId, userId));
    }

    const result = await query;
    
    // Convert database format to frontend format
    const formattedResult = result.map(record => {
      const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      
      // Extract time from availableFrom and availableTo
      let startTime = '09:00';
      let endTime = '17:00';
      let dayOfWeek = 'Monday';
      
      if (record.availableFrom && record.availableTo) {
        const startDate = new Date(record.availableFrom);
        const endDate = new Date(record.availableTo);
        
        startTime = `${startDate.getHours().toString().padStart(2, '0')}:${startDate.getMinutes().toString().padStart(2, '0')}`;
        endTime = `${endDate.getHours().toString().padStart(2, '0')}:${endDate.getMinutes().toString().padStart(2, '0')}`;
      }
      
      if (record.dayOfWeek !== null && record.dayOfWeek !== undefined) {
        dayOfWeek = dayNames[record.dayOfWeek] || 'Monday';
      }
      
      return {
        ...record,
        dayOfWeek,
        startTime,
        endTime,
        maxPatients: 10, // Default value
        notes: '',
        isAvailable: true
      };
    });
    
    res.json(formattedResult);
  } catch (error) {
    console.error("Error in getAllDoctorAvailability:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getDoctorAvailabilityById = async (req, res) => {
  try {
    res.json(req.availability);
  } catch (error) {
    console.error("Error in getDoctorAvailabilityById:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const createDoctorAvailability = async (req, res) => {
  const { userId, role } = req.user;

  try {
    console.log("Creating doctor availability with data:", req.body);
    
    // Convert frontend format to backend format
    const { dayOfWeek, startTime, endTime, maxPatients, notes, isAvailable } = req.body;
    
    // Create datetime objects for the current week
    const today = new Date();
    const dayIndex = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].indexOf(dayOfWeek);
    const targetDate = new Date(today);
    targetDate.setDate(today.getDate() - today.getDay() + dayIndex);
    
    // Set start and end times
    const [startHour, startMin] = startTime.split(':').map(Number);
    const [endHour, endMin] = endTime.split(':').map(Number);
    
    const availableFrom = new Date(targetDate);
    availableFrom.setHours(startHour, startMin, 0, 0);
    
    const availableTo = new Date(targetDate);
    availableTo.setHours(endHour, endMin, 0, 0);
    
    const data = {
      doctorId: role === "admin" ? req.body.doctorId : userId,
      availableFrom,
      availableTo,
      dayOfWeek: dayIndex, // Store as integer for existing schema
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    console.log("Processed data for insertion:", data);

    const [record] = await db
      .insert(doctorAvailability)
      .values(data)
      .returning();
      
    console.log("Successfully created availability record:", record);
    
    // Return data in format expected by frontend
    const responseData = {
      ...record,
      dayOfWeek: dayOfWeek, // Return as string
      startTime,
      endTime,
      maxPatients: maxPatients || 10,
      notes: notes || '',
      isAvailable: isAvailable !== false
    };
    
    res.status(201).json(responseData);
  } catch (error) {
    console.error("Error in createDoctorAvailability:", error);
    
    // Provide more specific error messages
    if (error.code === '23505') {
      res.status(400).json({ error: "Availability slot already exists for this time" });
    } else if (error.code === '23502') {
      res.status(400).json({ error: "Missing required fields" });
    } else if (error.code === '23503') {
      res.status(400).json({ error: "Invalid doctor ID" });
    } else {
      res.status(500).json({ 
        error: "Failed to create availability", 
        details: process.env.NODE_ENV === 'development' ? error.message : undefined 
      });
    }
  }
};

export const updateDoctorAvailability = async (req, res) => {
  const { id } = req.params;
  const availability = req.availability;

  try {
    const [updated] = await db
      .update(doctorAvailability)
      .set({
        ...req.body,
        updatedAt: new Date(),
      })
      .where(eq(doctorAvailability.id, Number(id)))
      .returning();
    res.json(updated);
  } catch (error) {
    console.error("Error in updateDoctorAvailability:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const deleteDoctorAvailability = async (req, res) => {
  const { id } = req.params;

  try {
    await db
      .delete(doctorAvailability)
      .where(eq(doctorAvailability.id, Number(id)));
    res.status(204).send();
  } catch (error) {
    console.error("Error in deleteDoctorAvailability:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
