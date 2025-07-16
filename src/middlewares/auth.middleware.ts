import  Jwt  from "jsonwebtoken"; //para generar, verificar y decodificar el token
import { Request, Response, NextFunction } from "express"; //importa el request y response de express


const SECRET_KEY = process.env.SECRET_KEY || "secret"; //obtiene la clave secreta de la variable de entorno

export const  verificarToken = async (req:Request, res:Response, next:NextFunction) => {
    
    const token = req.headers.authorization?.split(" ")[1]; //obtiene el token de la cabecera de la peticion

    if(!token){
        return res.status(401).json({message: "token no encontrado"});
    }
    
    try{
        const decoded = Jwt.verify(token, SECRET_KEY); //verifica el token
        (req as any).user = decoded; //agrega el usuario al request 
        next();
    }catch (error) {
        res.status(401).json({message: "token no valido"});
    }
}