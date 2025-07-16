import { Router } from "express"; //importa el router de express

import { getMovimientos } from "../controllers/moviminetos.controller" //importa el controlador de movimientos


const router = Router(); //crea una instancia de router

    //ruta de la api buscar por filtros
router.get("/movimientos/filter", getMovimientos.filter); 

    //ruta de la api resumen por mes se usa de esta forma para que siempre se envie el anio y el mes y 
    // por la forma en que se obtienen los paraetros en el controlador
router.get("/movimientos/resumenMes/:anio/:mes", getMovimientos.resumenMes);

    //ruta de la api resumen por año se usa de esta forma para que siempre se envie el anio
router.get("/movimientos/resumenAnual/:anio", getMovimientos.resumenAnual);

//otras rutas simples

router.get("/movimientos", getMovimientos.all); //ruta de la api traer todos
router.post("/movimientos", getMovimientos.create); //ruta de la api crear
router.put("/movimientos/:id", getMovimientos.update); //ruta de la api actualizar
router.delete("/movimientos/:id", getMovimientos.delete); //ruta de la api eliminar
router.get("/movimientos/:id", getMovimientos.findXId); //ruta de la api buscar por id





export default router;