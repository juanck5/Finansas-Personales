import { Router } from "express";

import { usuariosController } from "../controllers/usuarios.controller";

const router = Router(); //crea una instancia de router

router.post("/auth/login", usuariosController.login); //ruta de la api login
router.post("/auth/logout", usuariosController.logout); //ruta de la api logout
router.post("/auth/register", usuariosController.register); //ruta de la api register

export default router;