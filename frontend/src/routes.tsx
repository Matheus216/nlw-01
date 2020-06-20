import React from 'react';
import { Route, BrowserRouter } from 'react-router-dom';

import Home from './pages/home/index'
import CreatePoint from './pages/createPoint/index'

const Routes = () => {
    return (
        <BrowserRouter>
            <Route component={Home} path='/' exact />
            <Route component={CreatePoint} path='/create-point' />
        </BrowserRouter>
    )
}

/* 
    O PARAMETRO EXACT É PARA COMPARAR EXATAMENTE O CAMINHO DO ARQUIVO 
    NÃO SOMENTE O INICIO COMO DE DEFAULT DO REACT
*/


export default Routes;