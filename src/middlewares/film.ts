import { param } from "express-validator";

export const actorIsCorrect = [
    param('actorName').notEmpty().isAlpha().trim(),
    param('actorSurname').notEmpty().isAlpha().trim(),
]