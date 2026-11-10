import { Request, Response, NextFunction } from "express";
import { UserSchema } from "@/database/entities/User";

class User {
    constructor() { };

    create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const em = req.em;
            const { name, lastName, email, password } = req.body;

            const user = em.create(UserSchema, {
                name,
                lastName,
                email,
                password
            });

            await em.flush();
            res.status(201).send({
                id: user.id,
                name: user.name,
                lastName: user.lastName,
                email: user.email,
            });
        } catch (error) {
            next(error);
        }
    }

    update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const em = req.em;
            const { id } = req.user!;
            const { name, lastName, email, password } = req.body;

            const user = await em.findOne(UserSchema, { id });

            if (!user) {
                res.status(404).json({ message: "User not found" });
                return;
            }

            user.name = name;
            user.lastName = lastName;
            user.email = email;

            if (password) {
                user.password = password;
            }

            await em.flush();

            res.status(200).send({
                id: user.id,
                name: user.name,
                lastName: user.lastName,
                email: user.email,
            });
        } catch (error) {
            next(error);
        }
    }

    block = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const em = req.em;
            const { id } = req.params;

            const user = await em.findOne(UserSchema, { id });
            if (!user) {
                res.status(404).json({ message: "User not found" });
                return;
            }

            user.isBlocked = true;
            await em.flush();

            res.sendStatus(200);
        } catch (error) {
            next(error);
        }
    }

    unblock = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const em = req.em;
            const { id } = req.params;

            const user = await em.findOne(UserSchema, { id });
            if (!user) {
                res.status(404).json({ message: "User not found" });
                return;
            }

            user.isBlocked = false;
            await em.flush();

            res.sendStatus(200);
        } catch (error) {
            next(error);
        }
    }

    delete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const em = req.em;
            const { id } = req.params;

            const user = await em.findOne(UserSchema, { id });
            if (!user) {
                res.status(404).json({ message: "User not found" });
                return;
            }

            user.deletedAt = new Date();
            await em.flush();

            res.sendStatus(204);
        } catch (error) {
            next(error);
        }
    }

    restore = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const em = req.em;
            const { id } = req.params;

            const user = await em.findOne(UserSchema, { id }, { filters: { softDelete: false } });
            if (!user) {
                res.status(404).json({ message: "User not found" });
                return;
            }

            user.deletedAt = null;
            await em.flush();

            res.sendStatus(200);
        } catch (error) {
            next(error);
        }
    }

    deleteHard = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const em = req.em;
            const { id } = req.params;

            const user = await em.findOne(UserSchema, { id }, { filters: { softDelete: false } });
            if (!user) {
                res.status(404).json({ message: "User not found" });
                return;
            }

            em.remove(user);
            await em.flush();

            res.sendStatus(204);
        } catch (error) {
            next(error);
        }
    }
}

export default User;