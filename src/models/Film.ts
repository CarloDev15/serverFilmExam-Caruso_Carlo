import { Schema, model } from "mongoose";

type Film = {
    title: string;
    genre: string;
    yearOfRelease: string;
    productionCompany: string;
    actor: {
        name: string,
        surname: string
    };
    boxOfficeReceipts?: number;
};

const filmSchema = new Schema<Film>({
    title: { type: String, required: true },
    genre: { type: String, required: true },
    yearOfRelease: { type: String, required: true },
    productionCompany: { type: String, required: true },
    actor: {
        name: { type: String, required: true },
        surname: { type: String, required: true }
    },
    boxOfficeReceipts: { type: Number, default: 0 },
});

export const Film = model<Film>("Film", filmSchema)