"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/* eslint-disable @typescript-eslint/no-unused-vars */
const express_1 = __importDefault(require("express"));
const client_1 = require("@prisma/client");
const port = 3000;
const app = (0, express_1.default)();
const prisma = new client_1.PrismaClient();
app.use(express_1.default.json());
app.get("/movies", (_, res) => __awaiter(void 0, void 0, void 0, function* () {
    const movies = yield prisma.movie.findMany({
        orderBy: {
            title: "asc",
        },
        include: {
            genres: true,
            languages: true,
        },
    });
    res.json(movies);
}));
app.post("/movies", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { title, genre_id, language_id, oscar_count, release_date } = req.body;
    try {
        const movieWithSameTitle = yield prisma.movie.findFirst({
            where: {
                title: { equals: title, mode: "insensitive" },
            },
        });
        if (movieWithSameTitle) {
            res
                .status(409)
                .send({ message: "Já existe um filme cadastrado com esse título" });
            return;
        }
        yield prisma.movie.create({
            data: {
                title,
                genre_id,
                language_id,
                oscar_count,
                release_date: new Date(release_date),
            },
        });
    }
    catch (error) {
        res.status(500).send({ message: "Falha ao cadastrar um filme" });
    }
    res.status(201).send();
}));
app.put("/movies/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = Number(req.params.id);
        const movie = yield prisma.movie.findUnique({
            where: { id },
        });
        if (!movie) {
            res.status(404).send({ message: "Filme não encontrado" });
            return;
        }
        const data = Object.assign({}, req.body);
        data.release_date = data.release_date
            ? new Date(data.release_date)
            : undefined;
        yield prisma.movie.update({ where: { id }, data });
    }
    catch (error) {
        res.status(500).send({ message: "Falha ao atualizar o registro" });
        return;
    }
    res.status(201).send();
}));
app.delete("/movies/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = Number(req.params.id);
    try {
        const movie = yield prisma.movie.findUnique({
            where: { id },
        });
        if (!movie) {
            res.status(404).send({ message: "Filme não encontrado" });
            return;
        }
        yield prisma.movie.delete({ where: { id } });
    }
    catch (error) {
        res.status(500).send({ message: "Falha ao remover o registro" });
        return;
    }
    res.status(201).send();
}));
app.get("/movies/:genreName", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const moviesFilteredByGenreName = yield prisma.movie.findMany({
            include: {
                genres: true,
                languages: true,
            },
            where: {
                genres: {
                    name: {
                        equals: req.params.genreName,
                        mode: "insensitive",
                    },
                },
            },
        });
        res.status(201).send(moviesFilteredByGenreName);
    }
    catch (error) {
        res.status(500).send({ message: "Falha ao retornar filtro por gênero" });
    }
}));
app.listen(port, () => {
    console.log("Servidor em execução na porta 3000");
});
