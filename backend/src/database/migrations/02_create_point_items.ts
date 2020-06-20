import Knex from 'knex'

export async function up(knex: Knex){
    return knex.schema.createTable('point_items', x => {
        x.increments('id').primary();

        x.string('point_id')
            .notNullable()
            .references('id')
            .inTable('points');

        x.string('item_id')
            .notNullable()
            .references('id')
            .inTable('items');
    });
}

export async function down(knex: Knex){
    return knex.schema.dropTable('point_items')
}