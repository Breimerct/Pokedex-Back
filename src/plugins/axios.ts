import axios from 'axios'

 const httpClient = axios.create({
	 baseURL: 'https://pokeapi.co/api/v2',
     headers: {
         "Content-Type": "application/json"
     }
 })

export {
    httpClient,
    axios
}
