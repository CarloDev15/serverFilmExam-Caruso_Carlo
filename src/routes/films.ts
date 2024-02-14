import express, { Request, Response } from "express";
import { body, matchedData, param, query, validationResult } from "express-validator";
import { Film } from "../models/Film";
import { Admin } from "../models/Admin";
import { actorIsCorrect } from "../middlewares/film";
import { adminIsCorrect, checkAuth, checkToken, jwtsalt  } from "../middlewares/admin";
import { v4 } from "uuid";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
const router = express.Router();
export const salt = 10;



//1. Implementare la richiesta GET di tutti i film + 6. Filtrare dei film in base all'anno, al genere e casa di produzione
router.get('/', [
    query('yearOfRelease').optional().isNumeric(),
    query('genre').optional().isString(),
    query('productionCompany').optional().isString(),
], async (req: Request, res: Response) => {
    try {
        const { yearOfRelease, genre, productionCompany } = req.query;
        const filter: any = {};
        if (yearOfRelease) filter.yearOfRelease = yearOfRelease;
        if (genre) filter.genre = genre;
        if (productionCompany) filter.productionCompany = productionCompany;
        const films = await Film.find(filter);
        if (films.length === 0) {
            return res.status(404).json({ message: 'Film not found' });
        }
        res.json(films);
        console.log(films);
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

//2. Implementare la richiesta GET un film in base all'id
router.get('/:id', param('id').isMongoId(), async (req: Request, res: Response) => {
    try {
        const film = await Film.findById(req.params.id);
        if (!film) return res.status(401).json({ message: 'Film  not found' });
        res.json(film);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

//3. Implementare la richiesta GET di tutti i film in base all'attore
router.get('/:actorName/:actorSurname', actorIsCorrect, async (req: Request, res: Response) => {
    const actorName = req.params.actorName;
    const actorSurname = req.params.actorSurname;
    try {
        const films = await Film.find({ 'actor.name': actorName , 'actor.surname': actorSurname });
        if (films.length === 0) {
            return res.status(404).json({ message: 'No films found for this actor' });
        }
        res.json(films);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Implemento una POST "signup" per creare un nuovo admin, per avere i permessi di POST e DELETE
router.post("/signup", adminIsCorrect, checkAuth, async (req: Request, res: Response) => {
    const admin = matchedData(req);
    admin.password = bcrypt.hashSync(admin.password, salt);
    admin.confirmationCode = v4();
    const newAdmin = new Admin(admin); // instanziao newAdmin passando al modello l'oggetto admin
    try {
        const { _id , name, email, confirmationCode} = await newAdmin.save();
        res.status(201).json({message: "Admin created", user: { id: _id, name: name, email: email }});
        console.log("Code confirm email sent", confirmationCode);
    } catch (error) {
        res.status(500).json({ message: error });
    }
});

// Implemento una POST "validate" per validare un admin
router.get("/validate/:uuid", param("uuid").isUUID(), checkAuth, async (req: Request, res: Response) => {
    const admin = await Admin.findOne({ confirmationCode: req.params.uuid });
    if (!admin) {
        return res.status(401).json({ message: "Admin not found" });
    } 
    admin.isConfirmedEmail = true;
    admin.confimedEmail = admin.email;
    admin.confirmationCode = undefined;
    try {
        await admin.save();
        res.status(200).json({ message: "User confirmed" });
    } catch (error) {
        res.status(500).json({ message: error });
    }
});

// Implemento una POST "login" dell'admin
router.post("/login", adminIsCorrect.slice(1), checkAuth, async (req: Request, res: Response) => {
    const admin = await Admin.findOne({ confimedEmail: req.body.email, isConfirmedEmail: true });
    if (!admin || !bcrypt.compareSync(req.body.password, admin.password)) {
        return res.status(401).json({ message: "Credentials are not valid" });
    }
    const { _id, name, email } = admin;
    res.status(200).json({token: jwt.sign({ _id, name, email }, jwtsalt)});
});

//4. Implementare una DELETE per eliminare un film
router.delete('/:id', param('id').isMongoId(), checkAuth, checkToken, async (req: Request, res: Response) => {
    try {
        const film = await Film.findByIdAndDelete(req.params.id);
        if (!film) return res.status(401).json({ message: 'Film not found' });
        res.json(film);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

//5. Implementare la richiesta POST per creare un nuovo film
router.post('/', checkAuth, checkToken, async (req, res) => {
    try {
        const { title, genre, yearOfRelease, productionCompany, actor, boxOfficeReceipts } = req.body;
        const film = new Film({
            title,
            genre,
            yearOfRelease,
            productionCompany,
            actor,
            boxOfficeReceipts
        });
        console.log(film);
        const savedFilm = await film.save();
        res.status(201).json(savedFilm);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

router.post("/me", checkToken, async (req: Request, res: Response) => {
    res.json({ message: "Welcome Admin", admin: res.locals.admin.name });
})

export default router;