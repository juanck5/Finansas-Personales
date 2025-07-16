import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import moviminetosRouter from "./routes/movimientos.routes";
import userRouter from "./routes/user.routes";
import { verificarToken } from "./middlewares/auth.middleware";

dotenv.config();  //carga las variables de entorno

const app = express();  //crea una instancia de express


app.use(cors());        //permite el acceso a la api desde cualquier origen
app.use(express.json()); //permite el uso de json en la api

app.use('/api', userRouter);
// middleware
app.use(verificarToken);

app.use('/api', moviminetosRouter); //ruta de la api


app.get('/', (_req, res) => {
  res.send('API Finanzas funcionando 🚀');
});



const PORT = process.env.PORT || 5000; //puerto de la api

app.listen(PORT, () => {  //inicia el servidor
    console.log(`Server running on port ${PORT}`); //mensaje de inicio
})