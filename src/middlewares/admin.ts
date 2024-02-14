import { Request, Response, NextFunction } from "express";
import { body, validationResult } from "express-validator";
import jwt from "jsonwebtoken";
export const jwtsalt = 'shhhhhh';

export const adminIsCorrect = [ 
    body("name").notEmpty().trim(),
    body("email").notEmpty().trim().isEmail(),
    body("password").notEmpty().trim().isStrongPassword(),
];

export const checkAuth = (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
}

export const checkToken = (req: Request, res: Response, next: NextFunction) => {
    try {
        res.locals.admin = jwt.verify(String(req.headers.token), jwtsalt);
        next();
    } catch (error) {
        return res.status(401).json({ message: "You are not authorized" });
    }
}