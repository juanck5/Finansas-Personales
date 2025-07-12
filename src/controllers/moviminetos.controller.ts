//Controlador de movimientos
// es el encargado de la logica de la api esta se comunica directamente con la db y se conecta con los archivos de rutas

import { Request, Response } from "express"; //importa el request y response de express
import { dbConnection } from "../config/db";
import { z } from "zod";
import ca from "zod/v4/locales/ca.cjs";
import tr from "zod/v4/locales/tr.cjs";

const movimientoSchema = z.object({
    descripcion: z.string(),
    monto: z.number(),
    tipo: z.string()
})

export const getMovimientos = {

    //trae todos los movimientos/////////////////////////////////////////////////////////////////////////////////
    all: async (_req:Request, res:Response) => {

        
        const response = await dbConnection.movimiento.findMany();
        res.json(response); //responde con los movimientos
    },

    //moviminetos con filtro/////////////////////////////////////////////////////////////////////////////////////
  
    filter: async (req:Request, res:Response) => {
        try{
            
        
console.log("trae todos los movimientos", req);
        //opciones de paginacion 
        const page = parseInt(req.query.page as string) || 1; //obtiene la pagina a mostrar
        const pageSize = parseInt(req.query.pageSize as string) || 20; //obtiene el tamaño de la pagina a mostrar
        const skip = (page - 1) * pageSize; //obtiene el numero de movimientos a saltar

        //filtros opcionales
        const tipo = req.query.tipo as string || undefined; //obtiene el tipo de movimiento

        //estas fechas se usaran para traer los movimientos entre estas fechas
        const fechaInicio = req.query.fechaInicio as string || undefined; //obtiene la fecha de inicio
        const fechaFin = req.query.fechaFin as string || undefined; //obtiene la fecha de fin

        const where: any = {}; //crea un objeto donde se guardaran los filtros
        console.log("filtrso inicio ", where);

        if (tipo){
            where.tipo = tipo; //agrega el filtro de tipo
        }

        if (fechaInicio && fechaFin){
            where.fecha = {
                gte: new Date(fechaInicio), //agrega el filtro de fecha de inicio  gte = greater than or equal (mayor o igual)
                lte: new Date(fechaFin) //agrega el filtro de fecha de fin lte = less than or equal (menor o igual)
            }
        }

        console.log("filtros", where);

        try{
            const [ movimientos, count] = await Promise.all([  //obtiene el numero de movimientos y los movimientos se realiza en un apromesa para que se ejecute en paralelo
                dbConnection.movimiento.findMany({
                    where,  //agrega los filtros
                    skip,   //agrega el numero de movimientos a saltar
                    take: pageSize,  //agrega el tamaño de la pagina
                    orderBy: {
                        fecha: "desc"
                    }
                }),
                dbConnection.movimiento.count({
                    where
                })
            ]);

            //respuesta
            res.json({
                page,  //pagina
                pageSize, //tamaño de la pagina
                count, //numero de movimientos
                totalPage: Math.ceil(Number(count) / pageSize), //numero de paginas
                moviminetos:movimientos  //movimientos
            });
        }catch (error) {
            res.status(500).json(error); //responde con el error
        }}catch (error) {
            res.status(400).json(error);
        }
    },

    //crea un movimiento///////////////////////////////////////////////////////////////////////////////////////////

    create: async (req:Request, res:Response) => {

        try{
   const data = movimientoSchema.parse(req.body); //valida el body con el esquema de movimiento
    const response = await dbConnection.movimiento.create({
        data,
    })
    res.status(201).json(response); //responde con el movimiento
    
} catch (error) {
    res.status(400).json(error); //responde con el error
}
    },

//ACTUALIZAR MOVIMIENTO//////////////////////////////////////////////////////////////////////////////////////////////
    update: async (req:Request, res:Response) => {
        try{
            const data = movimientoSchema.parse(req.body); //valida el body con el esquema de movimiento
            const response = await dbConnection.movimiento.update({
                where: {
                    id: parseInt(req.params.id) //obtiene el id del movimiento
                },
                data
            })
            res.status(200).json(response);
        }catch (error) {
            res.status(400).json(error);
            
        }
    },
// DELETE MOVIMIENTO////////////////////////////////////////////////////////////////////////////////////////////////
    delete: async (req:Request, res:Response) => {
        try{
            const response = await dbConnection.movimiento.delete({
                where: {
                    id: parseInt(req.params.id) //obtiene el id del movimiento
                }
            })
            res.status(200).json(response);
        }catch (error) {
            res.status(400).json(error);
            
        }
    },

    //FindOneMovimiento
    findXId: async (req:Request, res:Response) => {
        try{
            const response = await dbConnection.movimiento.findUnique({
                where:{
                    id: parseInt(req.params.id)
                }
            })

            res.status(200).json(response);
        }catch (error) {
            res.status(400).json(error);
        }
    },

    //Funcion re resumen por mes
    resumenMes: async (req:Request, res:Response) => {
        try{
            const {anio, mes} = req.params; //obtiene el anio y el mes
            console.log("anio", anio, "mes", mes);

            const fechaInicio = new Date(`${anio}-${mes}-01`); //obtiene la fecha de inicio setoma el primer dia del mes
            const fechaFin = new Date(fechaInicio); 
            fechaFin.setMonth(fechaFin.getMonth() + 1); //obtiene la fecha de fin se roma el primer dia del mes siguiente

            const ingreso = await dbConnection.movimiento.aggregate({  //obtiene el ingreso
                _sum: {  //suma el monto
                    monto: true 
                },
                where: { //obtiene los movimientos de ingreso
                    tipo: "Ingreso",
                    fecha: {
                        gte: fechaInicio,
                        lt: fechaFin
                    }
                }

            })

            const egresos = await dbConnection.movimiento.aggregate({  //obtiene el egreso
                _sum: {  //suma el monto
                    monto: true 
                },
                where: { //obtiene los movimientos de egreso
                    tipo: "Egreso",
                    fecha: {
                        gte: fechaInicio,
                        lt: fechaFin
                    }
                }

            })

            res.json({
                ingreso: ingreso._sum.monto || 0, //responde con el ingreso
                egresos: egresos._sum.monto || 0,//responde con el egreso
                balance: (ingreso._sum.monto || 0 )- (egresos._sum.monto || 0), //responde con el balance
            })

               

        }
        catch (error) {
            res.status(400).json({message: "Error al obtener el resumen", error});
        }
    }



    
}
