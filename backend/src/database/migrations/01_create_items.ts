import Knex from 'knex'

export async function up(knex: Knex){
    return knex.schema.createTable('items', x => {
        x.increments('id').primary();
        x.string('image').notNullable();
        x.string('title').notNullable();
    })
}

export async function down(knex: Knex){
    return knex.schema.dropTable('items')
}