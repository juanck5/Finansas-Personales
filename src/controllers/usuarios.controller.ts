import { Response, Request } from "express";
import { dbConnection } from "../config/db";
import  bcrypt  from "bcrypt";  //para encriptar la contraseña
import  Jwt  from "jsonwebtoken";  //para generar el token
import { email, z } from "zod";



const SECRET_KEY = process.env.SECRET_KEY || "secret";

const usuarioSchema = z.object({
    email: z.string(),
    password: z.string(),
   
    userName: z.string()
})
export const usuariosController = {
//Login///////////////////////////////////////////////////////////////////////
    login: async (req:Request, res:Response) => {
        
        const { email, password } = req.body; //obtiene los datos del body\

        try{
            const user = await dbConnection.usuario.findUnique({
                where: {
                    email: email
                }
            })

            if(!user){
                return res.status(400).json({message: "El usuario no existe"});
            }

            const esValido = await bcrypt.compare(password, user.password);  //compara la contraseña con la encriptada

            if(!esValido){
               return res.status(400).json({message: "La contraseña es incorrecta"});
            }

            const token = Jwt.sign({id: user.id, email: user.email}, SECRET_KEY);

            res.status(200).json({token, user: {id: user.id, email: user.email, userName: user.userName}});

        }catch (error) {
            res.status(400).json({messa: "Error al loguear el usuario", error} );
        }
    }

//Logout///////////////////////////////////////////////////////////////////////
,   logout: async (req:Request, res:Response) => {
        
    }

//Register///////////////////////////////////////////////////////////////////////
,   register: async (req:Request, res:Response) => {
    const SALT_ROUNDS = 10; //numero de veces que se encripta la contraseña

    const {email, password, confirmPassword, userName} = req.body; //obtiene los datos del body
        
        try{
            //validar si el usuario o correo  ya esta registrado
            const existeuser = await dbConnection.usuario.findUnique({
                where: {
                    email: email
                }
            })

            if(existeuser){
                return res.status(400).json({message: "El usuario ya existe"});
            }
            //Verificar que las contraseñas coincidan 
            if(existeuser){
                return res.status(400).json({message: "El usuario ya existe"});
            }

            if(password !== confirmPassword){
                return res.status(400).json({message: "Las contraseñas no coinciden"});
            }
            const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

            const data = usuarioSchema.parse({email, password: hashedPassword, userName}); //valida el body con el esquema de usuario

            const response = await dbConnection.usuario.create({
                data
            })

            res.status(201).json(response);


        }catch (error) {
                res.status(400).json({messa: "Error al registart el usuario", error} );
        }
    }


}