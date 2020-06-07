import express from 'express';
import cors from 'cors';
import routes from './routes';
import path from 'path';

const app = express();

app.use(cors());

app.use(express.json()); 
app.use(routes);

app.use('/uploads', express.static(path.resolve(__dirname, '..', 'uploads')));

app.listen(3333);

// Rota - endereço completo da requisição
// Recurso - Qual entidadde estamos acesando do sistema

// requisições http - GET / POST / PUT / DELETE

//
// Request param - paramentros dentro da propria rota que identifica um recurso
// Query param - 







