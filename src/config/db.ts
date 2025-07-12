//Configuracion y conexion a la DB

import {PrismaClient} from '@prisma/client'

export const dbConnection = new PrismaClient();