import knex from 'knex';
import path from 'path'

const connection = knex({
    client: 'sqlite3',
    connection: {
        filename: path.resolve(__dirname, 'database.sqlite')
    },
    useNullAsDefault: true
})

export default connection;

/**
Migrations = histórico de banco de dados
para cada alteração é criado um migration para o banco de dados 
 */


