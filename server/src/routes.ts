import express from 'express';
import multer from 'multer'
import multerConfig from "./config/multer"

import PointController from './controllers/PointController'
import ItemsController from './controllers/ItemsController'

const routes = express.Router();
const upload = multer(multerConfig)

const pointController = new PointController();
const itemsController = new ItemsController();


routes.get('/items', itemsController.Index);

routes.post('/points', upload.single('image'), pointController.Create);
routes.get('/points', pointController.Index);
routes.get('/points/:id', pointController.Show);

 
export default routes;
 