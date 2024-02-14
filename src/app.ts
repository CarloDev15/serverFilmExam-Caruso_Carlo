import express, { Request, Response, NextFunction } from "express";
import film from "./routes/films";
import { config } from "dotenv";
import path from "path";
import connectToDB from "./connection/connection";

config ({
    path: path.join(__dirname, `../.env.${process.env.NODE_ENV}`),
})

const app = express();
const port = 3000;

app.use(express.json());


connectToDB()

app.get("/status", (req: Request, res: Response) => {
    res.json({ status: "Now running" });
})

app.use("/films", film)

export default app;





app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
})