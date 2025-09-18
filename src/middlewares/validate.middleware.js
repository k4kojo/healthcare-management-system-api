import { ZodError } from "zod";

export const validateRequest = (schema, target = "body") => (req, res, next) => {
  try {
    if (target === "query") {
      const validatedQuery = schema.parse(req.query);
      // Clear existing query properties and assign validated ones
      Object.keys(req.query).forEach(key => delete req.query[key]);
      Object.assign(req.query, validatedQuery);
    } else if (target === "params") {
      req.params = schema.parse(req.params);
    } else {
      req.body = schema.parse(req.body);
    }
    next();
  } catch (error) {
    if (error instanceof ZodError) {
      return res.status(400).json({ 
        success: false,
        error: error.errors[0]?.message || "Validation failed",
        details: error.errors 
      });
    }
    return res.status(400).json({ 
      success: false,
      error: "Validation failed" 
    });
  }
};

export const validateBody = (schema) => (req, res, next) => {
  try {
    req.body = schema.parse(req.body);
    next();
  } catch (err) {
    if (err instanceof ZodError) {
      return res.status(400).json({ error: err.errors });
    }
    next(err);
  }
};

export const validateParams = (schema) => (req, res, next) => {
  try {
    req.params = schema.parse(req.params);
    next();
  } catch (err) {
    if (err instanceof ZodError) {
      return res.status(400).json({ error: err.errors });
    }
    next(err);
  }
};

export const validateQuery = (schema) => (req, res, next) => {
  try {
    const validatedQuery = schema.parse(req.query);
    // Create a new query object with validated data
    Object.keys(req.query).forEach(key => delete req.query[key]);
    Object.assign(req.query, validatedQuery);
    next();
  } catch (err) {
    if (err instanceof ZodError) {
      return res.status(400).json({ error: err.errors });
    }
    next(err);
  }
};
