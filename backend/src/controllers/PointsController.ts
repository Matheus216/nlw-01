import {Request, Response} from 'express'
import knex from '../database/connection'

class PointsController {
    
    async index(request: Request, response: Response){
        const { city, uf, items } = request.query;

        const parsedItems = String(items)
            .split(',')
            .map(x => Number(x.trim()));

        const point = await knex('points')
            .join('point_items', 'points.id', '=', 'point_items.point_id')
            .whereIn('point_items.item_id', parsedItems)
            .where('city', String(city))
            .where('uf', String(uf))
            .distinct()
            .select('points.*');


        const serializedPoints = point.map(x => {
            return {
                ...x,
                image_url: `http://192.168.0.12:3333/uploads/${x.image}`,
            };
        });
        

        return response.json( serializedPoints ); 
    }

    async show(request: Request, response: Response) {
        const { id } = request.params; 

        const point = await knex('points').where('id', id).first();

        if (!point) {
            return response.status(400).json({ message: 'point not found.' });
        }

        const serializedPoints = {
            ...point,
            image_url: `http://192.168.0.12:3333/uploads/${point.image}`,
        };
        
        const items = await knex('items')
            .join('point_items', 'items.id', '=', 'point_items.item_id')
            .where('point_items.point_id', id)
            .select('items.title');

        return response.json( { serializedPoints, items } );
    }
    
    async create(request: Request, response: Response) {
        const {
            name,
            email,
            whatsapp,
            latitude,
            longitude,
            city,
            uf,
            items
        } = request.body;
    
        // transaction é usado quando um código para inserir dados vem logo depois de outro dependente
        // caso de algum erro no último a ser inserido os outros são executados um rollback
        const trx = await knex.transaction();
        
        const point = {
            image: request.file.filename,
            name,
            email,
            whatsapp,
            latitude,
            longitude,
            city,
            uf
        };
        
        const insertedIds = await trx('points').insert(point);
        const point_id = insertedIds[0];
        const pointItems = items
            .split(',')
            .map((x: string) => Number(x.trim()))
            .map((x: number) => {
            
                return {
                item_id: x,
                point_id
            }
        });
    
        await trx('point_items').insert(pointItems);

        trx.commit();

        return response.json( {
            id: point_id,
            ...point
         })
    }
}

export default PointsController;