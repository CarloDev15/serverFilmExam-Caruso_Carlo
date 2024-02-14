import { Schema, model } from "mongoose";

type Admin = {
    name: string;
    email: string;
    password: string;
    confimedEmail?: string;
    isConfirmedEmail: boolean;
    confirmationCode?: string;
};

const adminSchema = new Schema<Admin>({
    email: { type: String, required: true },
    name: { type: String, required: true },
    password: { type: String, required: true },
    confimedEmail: { type: String, unique: true },
    isConfirmedEmail: { type: Boolean, default: false },
    confirmationCode: String,
});

export const Admin = model<Admin>("Admin", adminSchema)