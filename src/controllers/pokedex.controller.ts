import {AxiosResponse} from 'axios'
import {httpClient} from '../plugins/axios'
import {Response, Request} from 'express'

export const getPokedex = async (req: Request, res: Response) => {
    const {region, page} = req.query
    try {
        let pokemons: any[] = []
        if (region) {

            let perPage: number     = 12
            let currentPage: number = parseInt(typeof page === 'string' ? page : '0')
            let start: number       = perPage * (currentPage - 1)
            let end: number         = currentPage * perPage

            const pokedexNames: AxiosResponse = await httpClient.get(`/pokedex/${region}`)
            pokemons           = pokedexNames.data.pokemon_entries.map((val) => val.pokemon_species.name)

            let pokemonsData: any[] = []

            for (let poke of pokemons.slice(start, end)) {
                const pokeSpecies: AxiosResponse = await httpClient.get(`/pokemon-species/${poke}`)
                const pokeData: AxiosResponse    = await httpClient.get(pokeSpecies.data.varieties[0].pokemon.url)

                pokemonsData.push({
                    types: pokeData.data.types.map(val => val.type.name),
                    img  : pokeData.data.sprites.other['official-artwork'].front_default,
                    name : pokeSpecies.data.name
                })
            }

            res.send({
                pokemons: {
                    perPage      : perPage,
                    page         : currentPage,
                    maxPage      : Math.ceil(pokemons.length / 12),
                    totalPokemons: pokemons.length,
                    region       : region,
                    data         : pokemonsData
                }
            })
        } else {
            res.send({
                status : 500,
                message: 'Region parameter missing'
            })
        }
    } catch (e) {
        res.status(500).send({
            message: 'Query error',
            ...e
        })
    }
}

export const getPokemons = async (req: Request, res: Response) => {
    let pokemons: any[] = []

    const {data, status} = await httpClient.get(`/pokedex/national`)

    if (status === 200) {
        pokemons = data.pokemon_entries.map((val) => val.pokemon_species.name)
        res.send(pokemons)
    } else {
        res.send({
            message: 'query error',
            status : status
        }).status(status)
    }
}
