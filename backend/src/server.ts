import express from 'express'
import routes from './routes'
import path from 'path'
import cors from 'cors';
import { errors } from 'celebrate';

const app = express();

app.use(cors())
app.use(express.json())
app.use(routes);
app.use(errors);

// express static usado para referenciar locais staticos como rotas
// path sempre é usado para referenciar paths locais de arquivos
app.use('/uploads', express.static( path.resolve(__dirname, '..' ,'uploads')))

app.listen(3333);