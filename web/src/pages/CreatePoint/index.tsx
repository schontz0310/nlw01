import React, {useEffect, useState, ChangeEvent, FormEvent} from 'react';
import {Link, useHistory} from 'react-router-dom'
import {FiArrowLeft} from 'react-icons/fi'
import MaskedInput from 'react-text-mask'
import { Map, TileLayer, Marker } from 'react-leaflet'
import {LeafletMouseEvent} from 'leaflet'
import axios from 'axios'
import api from '../../services/api'
import Dropzone from '../../components/dropzone/index'


import './styles.css'
import logo from '../../assets/logo.svg'


interface Item {
  id: number;
  title: string;
  image_url: string 
}

interface IIBGEUFResponse  {
  sigla: string; 
}
interface IIBGECityResponse  {
  nome: string; 
}

const Creatpoint = () => {

  const [items, setItems] = useState<Item[]>([])
  const [ufs, setUfs] = useState<string[]>([])
  const [cities, setCities] = useState<string[]>([])
  const [selectedFile, setSelectedFile] = useState<File>()
  
  const [initialPosition, setInitialPosition] = useState<[number, number]>([0,0])
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    whatsapp: '',
  })

  const [selecteduf, setSelecteduf] = useState('0')
  const [selectedCity, setSelectedCity] = useState('0')
  const [selectedItems, setSelectedItems] = useState<number[]>([])
  const [selectedPosition, setSelectedPosition] = useState<[number, number]>([0,0])
  
  const history = useHistory()
  
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(position => {
      const { latitude, longitude} = position.coords
      setInitialPosition([latitude, longitude])
    })
  },[])

  useEffect(() => {
    api.get('items').then(response =>{
      setItems(response.data)
    })
  }, [])

  useEffect(() =>{
    axios.get<IIBGEUFResponse[]>('https://servicodados.ibge.gov.br/api/v1/localidades/estados?orderBy=nome')
    .then(response =>{
      const ufInitials = response.data.map(uf => uf.sigla )
      setUfs(ufInitials);
    })
    
  },[])

  useEffect(() => {
    if (selecteduf === '0'){
      return
    }

    axios
    .get<IIBGECityResponse[]>(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${selecteduf}/municipios`)
    .then(response =>{
      const citiesNames = response.data.map(city => city.nome )
      setCities(citiesNames);
    })


  },[selecteduf])

  function handleSelectUf(event: ChangeEvent<HTMLSelectElement>){
    const uf = event.target.value
    setSelecteduf(uf)
  }
  function handleSelectCity(event: ChangeEvent<HTMLSelectElement>){
    const city = event.target.value
    setSelectedCity(city)
  }
  function handleMapClick(event: LeafletMouseEvent){
    setSelectedPosition([
      event.latlng.lat,
      event.latlng.lng
    ])
  }

  function handleInputChange(event: ChangeEvent<HTMLInputElement> ){
    const {name, value} = event.target
    setFormData({...formData, [name]: value})
    console.log(formData)
  }

  function handleSelectItem(id: number){
    const alreadySelected = selectedItems.findIndex(item => item === id)

    if(alreadySelected >= 0){
      const filtereditems = selectedItems.filter(item => item !== id)
      setSelectedItems(filtereditems)
    } else {
      setSelectedItems([...selectedItems, id])
    }


  }

  async function handleSubmit(event: FormEvent){
    event.preventDefault()
    const {name, email, whatsapp} = formData
    const uf = selecteduf
    const city = selectedCity
    const[latitude, longitude] = selectedPosition
    const items = selectedItems
    
    const data = new FormData()
      data.append('name',name)
      data.append('email',email)
      data.append('whatsapp',whatsapp)
      data.append('uf',uf)
      data.append('city',city)
      data.append('latitude',String(latitude))
      data.append('longitude',String(longitude))
      data.append('items',items.join(','))
      if (selectedFile){
        data.append('image', selectedFile)
      }
  
    await api.post('points', data)
    alert('Ponto de coleta cadastrado!')
    history.push('/')

  }
  
  return (
    <div id="page-create-point">
      <header>
        <img src={logo} alt="Logomarca"/>
        <Link to='/'>
          <FiArrowLeft/>
          Voltar para home
        </Link>
      </header>
      <form  onSubmit={handleSubmit}>
        <h1>
          Cadastro do 
          <br/> ponto de coleta
        </h1>
        <Dropzone onFileUpload={setSelectedFile}/>
        <fieldset>
          <legend>
            <h2>Dados</h2>
          </legend>
          <div className="field">
            <label htmlFor="name">Nome da Entidade</label>
            <input 
              type="text"
              name="name"
              id="name"
              onChange={handleInputChange}
            />
          </div>
          <div className="field-group">
            <div className="field">
            <label htmlFor="email">E-mail</label>
            <input 
              type="email"
              name="email"
              id="email"
              onChange={handleInputChange}
            />
            </div>
            <div className="field">
            <label htmlFor="Whatsapp">Whatsapp</label>
              <MaskedInput
              type="tel"
              mask={['(', /[1-9]/, /\d/, ')', ' ', /\d/, ' ', /\d/, /\d/, /\d/, /\d/, '-', /\d/, /\d/, /\d/, /\d/]}
              className="form-control"
              placeholder="Enter a phone number"
              guide={false}
              onBlur={() => {}}
              onChange={handleInputChange}
              name='whatsapp'
              />
            </div>
          </div> 
        </fieldset>
        <fieldset>
          <legend>
            <h2>Endereço</h2>
            <span>Selecioe o endereço no mapa</span>
          </legend>

          <Map center={initialPosition} zoom={15} onClick={handleMapClick}>
            <TileLayer
            attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker position={selectedPosition} />            
          </Map>

          <div className="field-group">
            <div className="field">
              <label htmlFor="uf">Estado (UF)</label>
              <select name="uf" id="uf" value={selecteduf} onChange={handleSelectUf}>
                <option value="0">Selecione uma UF</option>
                {ufs.map(uf => (
                  <option key={uf} value={uf}>{uf}</option>
                ))}
              </select>
            </div>
            <div className="field">
              <label htmlFor="city">Cidade</label>
              <select 
                name="city" 
                id="city"
                value={selectedCity}
                onChange={handleSelectCity}
              >
                <option value="0">Selecione uma Cidade</option>
                {cities.map(city => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
            </div>
          </div>

        </fieldset>
        <fieldset>
          
          <legend>
            <h2>Ítens de Coleta</h2>
            <span>Selecione um ou mais itens abaixo</span>
          </legend>

          <ul className="items-grid">

            {items.map(item => (
              <li 
                key={item.id} 
                onClick={()=> 
                handleSelectItem(item.id)}
                className = {selectedItems.includes(item.id) ? 'selected' : ''}
              >
              <img src={item.image_url} alt={`Icone ${item.title}`}/>
              <span>
                {item.title}
              </span>
            </li>
            ))}  
            
          </ul>

        </fieldset>
        <button type="submit">
          Cadastrar ponto de coleta
        </button>
      </form>
    </div>
  )  
}

export default Creatpoint;
