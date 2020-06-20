import express  from 'express';
import multer from 'multer';
import multerConfig from './config/multer';

import PointsController from './controllers/PointsController';
import ItemsController from './controllers/ItemsController';

const pointController = new PointsController();
const itemsController = new ItemsController();
const upload = multer(multerConfig);
const routes = express();

import { celebrate, Joi } from 'celebrate';

routes.get('/points/:id', pointController.show)
routes.get('/points',pointController.index)
routes.get('/items',itemsController.index);

routes
    .post('/points',
        upload.single('image'),
        celebrate({
            body: Joi.object().keys({
            name: Joi.string().required(),
            email: Joi.string().required(),
            whatsapp: Joi.number().required(),
            latitude: Joi.number().required(),
            longitude: Joi.number().required(),
            city: Joi.string().required(),
            uf: Joi.number().required(),
            items: Joi.number().required()
            })
        }, {
            abortEarly: false
        }),
        pointController.create);

export default routes; 