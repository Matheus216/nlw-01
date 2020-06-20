import React, { useEffect, useState, ChangeEvent, FormEvent } from 'react'
import { Link, useHistory } from 'react-router-dom';
import { FiArrowLeft } from 'react-icons/fi'
import { Map, TileLayer, Marker } from 'react-leaflet'
import { LeafletMouseEvent } from 'leaflet';

import api from '../../services/api';
import axios from 'axios';
import logo from '../../assets/logo.svg';

import Dropzone from '../../components/dropzone';

import './style.css'

/*
    array ou objeto em estado: manualmente informar o tipo da variavel
*/

interface Item {
    id: number,
    title: string,
    image_url: string
}

interface IBGEUFResponse {
    sigla: string
}

interface IBGECityResponse {
    nome: string
}

const CreatePoint = () => {

    const [initialPosition, setInitialPosition] = useState<[number, number]>([0,0])
    const [items, setItems] = useState<Item[]>([]);
    const [selectedUf, setSelectedUf] = useState('0'); 
    const [selectedCity, setSelectedCity] = useState('0')
    const [ufs, setUfs] = useState<string[]>([]);
    const [cities, setCity] = useState<string[]>([])
    const [selectedPosition, setselectedPosition] = useState<[number, number]>(initialPosition)
    
    const history = useHistory();

    const [inputData, setinputData] = useState({
        email: '',
        name: '',
        whatsapp: ''
    });
    
    const [selectedItems, setSelectedItems] = useState<number[]>([])
    const [selectedFile, setSelectedFile] = useState<File>();
    /**
     *  use effect é feito para impedir que esse metodo que está sendo 
     *  referenciado nela seja executado toda vez que o codigo for m
     *  mudado
     */
    useEffect(()=> {
        api.get('items')
        .then(response =>{
          setItems(response.data)  
        });
    }, []);

    useEffect(() => {
        axios.get<IBGEUFResponse[]>('https://servicodados.ibge.gov.br/api/v1/localidades/estados/')
            .then(response => {
                const ufInitials = response.data.map(x => x.sigla);
                setUfs(ufInitials)
            });
    }, []);

    useEffect(() =>{
        api.get<IBGECityResponse[]>(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${selectedUf}/municipios`)
            .then(response => {
                const cityNames = response.data.map(x => x.nome);
                setCity(cityNames)
            });
    }, [selectedUf])

    useEffect(() => {
        navigator.geolocation.getCurrentPosition(position => {
            const { latitude, longitude } = position.coords;

            setInitialPosition([latitude, longitude]);
        })
    })

    function handleSelectedUfs(event: ChangeEvent<HTMLSelectElement>) {
        setSelectedUf(event.target.value)
    }

    function handleSelectedCity(event: ChangeEvent<HTMLSelectElement>) {
        setSelectedCity(event.target.value)
    }

    function handleMapClick(event: LeafletMouseEvent){
        setselectedPosition([event.latlng.lat, event.latlng.lng])
    }

    function handleInputChange(event: ChangeEvent<HTMLInputElement>){
        setinputData({...inputData, [event.target.name]:[event.target.value]});
    }

    function handleSelectedItem(id: number){
        const alreadySelected = selectedItems.findIndex(x => x === id);
        
        if(alreadySelected > 0){
            const filteredItems = selectedItems.filter(x => x !== id);
            setSelectedItems(filteredItems);
        } else{
            setSelectedItems([...selectedItems, id]);     
        }
    }

    async function handleSubmit(event: FormEvent){

        event.preventDefault();
        
        const obj = new FormData();
        
        obj.append('name', inputData.name[0]);
        obj.append('email', inputData.email[0]);
        obj.append('whatsapp', inputData.whatsapp[0]);
        obj.append('latitude', String(selectedPosition[0]));
        obj.append('longitude', String(selectedPosition[1]));
        obj.append('city', selectedCity);
        obj.append('uf', selectedUf);
        obj.append('items', selectedItems.join(','));

        if (selectedFile){
            obj.append('image', selectedFile);
        }
        
        await api.post('points', obj);

        alert('ponto de coleta criado!')

        history.push('/');
    }

    return (
        <div id="page-create-point">
            <header>
                <img src={logo} alt="" />

                <Link to="/">
                    <FiArrowLeft />
                    Voltar para home
                </Link>
            </header>

            <form onSubmit={handleSubmit}> 
                <h1>Cadastro do <br /> ponto de coleta </h1>
                
                <Dropzone onFileUpload={setSelectedFile} />

                <fieldset>
                    <legend>
                        <h2>Dados</h2>
                    </legend>

                    <div className="field">
                        <label htmlFor="name">Nome da entidade</label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            onChange={handleInputChange}
                        />
                    </div>

                    <div className="field-group">
                        <div className="field">
                            <label htmlFor="name">E-mail</label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                onChange={handleInputChange}
                            />
                        </div>

                        <div className="field">
                            <label htmlFor="name">Whatsapp</label>
                            <input
                                type="text"
                                id="whatsapp"
                                name="whatsapp"
                                onChange={handleInputChange}
                            />
                        </div>
                    </div>

                </fieldset>

                <fieldset>
                    <legend>
                        <h2>Endereço</h2>
                        <span>selecione o endereço no mapa</span>
                    </legend>

                    <Map center={initialPosition} zoom={15} onClick={handleMapClick} >
                        <TileLayer 
                            attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                        <Marker position={selectedPosition} />
                    </Map>

                    <div className="field-group">
                        <div className="field">
                            <label htmlFor="name">Estado (UF)</label>
                            <select 
                                id="uf" 
                                name="uf" 
                                value={selectedUf} 
                                onChange={handleSelectedUfs} 
                            >
                                <option value="0">Selecione um UF</option>
                                {
                                    ufs.map(x =>{
                                        return(
                                            <option 
                                                key={x} 
                                                value={x}>{x}
                                            </option>
                                        )
                                    })
                                }
                            </select>
                        </div>

                        <div className="field">
                            <label htmlFor="name">Cidade</label>
                            <select id="city" name="city" onChange={handleSelectedCity} >
                                <option value={selectedCity}>Selecione uma cidade</option>
                                {
                                    cities.map(x => {
                                        return(
                                            <option key={x} value={x}>
                                                {x}
                                            </option>
                                        )
                                    })
                                }
                            </select>
                        </div>
                    </div>
                </fieldset>

                <fieldset>
                    <legend>
                        <h2>Itens de coleta</h2>
                        <span>selecione um ou mais ítens abaixo</span>
                    </legend>

                    <ul className="items-grid">
                        {
                            items.map(x => {
                                return (
                                <li  
                                    onClick={() => handleSelectedItem(x.id)} 
                                    key={x.id}
                                    className={selectedItems.includes(x.id) ? 'selected' : ''}
                                > 
                                    <img src={x.image_url} alt=""/>
                                    <span>{x.title}</span>
                                </li>)
                            })
                        }
                    </ul>

                </fieldset>

                <button type="submit" >
                    Cadastrar ponto de coleta
                </button>
            </form>
        </div>
    )
}

export default CreatePoint; 