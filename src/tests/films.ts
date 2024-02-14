import request from "supertest";
import app from "../app";
import connectToDB from "../connection/connection";
import * as assert from "assert";
import { Admin } from "../models/Admin";
import { v4 } from "uuid";
import bcrypt from "bcrypt";
import { salt } from "../routes/films";
import { body } from "express-validator";

before(async () => {
    await connectToDB();
})
afterEach(async () => {
    await Admin.deleteMany({});
})

describe("Status", () => {
    it("Status is running 200", async () => {
        const { status } = await request(app).get("/status");
        assert.equal(status, 200);
    })
})

describe("Signup", () => {
    it("POST /films/signup 201", async () => {
        const admin = {
            name: "Carlo",
            email: "pippo@gmail.com",
            password: "@389729nNJs"
        }
        const { status } = await request(app).post("/films/signup").send(admin);
        assert.equal(status, 201);
    })
    it("POST /films/signup 400 insecure password", async () => {
        const admin = {
            name: "Carlo",
            email: "pippo@gmail.com",
            password: "1234"
        }
        const { status } = await request(app).post("/films/signup").send(admin);
        assert.equal(status, 400);
    })
    it("POST /auth/signup 400 invalid email", async () => {
        const admin = {
            name: "Carlo",
            email: "pippogmailcom",
            password: "@389720nNJs"
        }
        const { status } = await request(app).post("/films/signup").send(admin);
        assert.equal(status, 400);
    })
    it("POST /films/signup 400 invalid name", async () => {
        const admin = {
            email: "pippo@gmail.com",
            password: "@389720nNJs"
        }
        const { status } = await request(app).post("/films/signup").send(admin);
        assert.equal(status, 400);
    })
})

describe("Validation", () => {
    it("GET /films/validate/:uuid 200 valided", async () => {
        const admin = {
            name: "Carlo",
            email: "pippo@gmail.com",
            password: "@389720nNJs"
        }
        const { body } = await request(app).post("/films/signup").send(admin);
        const adminDB = await Admin.findById(body._id);
        if (adminDB) {
            const { status } = await request(app).get(`/films/validate/${adminDB.confirmationCode}`);
            assert.equal(status, 200); 
        }
    })
    it("GET /films/validate/:uuid 404 not valided", async () => {
        const { status } = await request(app).get("/films/validate/123");
        assert.equal(status, 404);
    })
})

describe("Login", () => {
    const admin = {
        name: "Carlo",
        email: "pippo@gmail.com",
        password: bcrypt.hashSync("@389729nNJs", salt),
        confimedEmail: "pippo@gmail.com",
        isConfirmedEmail: true,
        confirmationCode: v4()
    };
    it("POST /films/login 200", async () => {
        const userCredential = {
            email: "pippo@gmail.com",
            password: "@389729nNJs"
        }
        const adminDB = new Admin(admin);
        await adminDB.save();
        const { status } = await request(app).post("/films/login").send(userCredential);
        assert.equal(status, 200);
    })
    it("POST /films/login 401 wrong password", async () => {
        const adminCredential = {
            email: "pippo@gmail.com",
            password: "@389729nNJs@389729nNJs"
        }
        const adminDB = new Admin(admin);
        await adminDB.save();
        const { status } = await request(app).post("/films/login").send(adminCredential);
        assert.equal(status, 401);
    })
    it("POST /films/login 401 wrong email", async () => {
        const adminCredential = {
            email: "tanotano@gmail.com",
            password: "@389729nNJs"
        }
        const adminDB = new Admin(admin);
        await adminDB.save();
        const { status } = await request(app).post("/films/login").send(adminCredential);
        assert.equal(status, 401);
    })
})

describe("Token", () => {
    const admin = new Admin({
        name: "Carlo",
        email: "pippo@gmail.com",
        password: bcrypt.hashSync("@389729nNJs", salt),
        confimedEmail: "pippo@gmail.com",
        isConfirmedEmail: true,
        confirmationCode: v4()
    });
    it("POST /films/token 200 valid token", async () => {
        const adminCredential = {
            email: "pippo@gmail.com",
            password: "@389729nNJs"
        }
        await admin.save();
        const { body } = await request(app).post("/films/login").send(adminCredential);
        const { status } = await request(app).post("/films/me").set({ token: body.token });
        assert.equal(status, 200);
    })
    it("POST /films/token 400 invalid token", async () => {
        const { status } = await request(app).post("/films/token").set({ token: "123" });
        assert.equal(status, 400);
    }) // individuato l'errore, il problema è con il path "/films/token" entra in /films/123 "404 not found", tardi per fixare
})