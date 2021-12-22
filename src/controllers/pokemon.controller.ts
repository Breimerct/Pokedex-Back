import {httpClient, axios} from '../plugins/axios'
import {Request, Response} from 'express';
import {AxiosResponse} from 'axios';

export const getPokemonStats = async (req: Request, res: Response) => {

    const {pokemonName, pokeUrl} = req.query
    let urlPokemonSpecie: string
    let pokeName: string
    let pokeIndex: number
    try {
        if (pokemonName || pokeUrl) {
            if (pokeUrl) {
                if (pokeUrl.toString().includes('https')) {
                    const endPoint: string          = typeof pokeUrl === 'string' ? pokeUrl : ''
                    const pokemonApi: AxiosResponse = await httpClient.get(endPoint)
                    urlPokemonSpecie                = pokemonApi.data.species.url
                    pokeName                        = pokemonApi.data.name
                }
            } else {
                urlPokemonSpecie = null
            }
            const url: string                   = pokemonName ? `/pokemon-species/${pokemonName}` : urlPokemonSpecie
            const pokemonSpecies: AxiosResponse = await httpClient.get(url)

            pokeIndex                    = pokemonSpecies.data.varieties
                .findIndex(val => val.pokemon.name === pokeName)
            pokeIndex                    = pokeIndex > 0 ? pokeIndex : 0
            const pokemonUrl: string     = pokemonSpecies.data
                .varieties[pokeIndex].pokemon.url
            const pokemon: AxiosResponse = await httpClient.get(pokemonUrl)
            const stats: []              = pokemon.data.stats.map(val => ({
                value: val.base_stat,
                name : val.stat.name
            }))
            if (pokemon.status === 200) {
                res.send({
                    pokemon: {
                        name : pokemonSpecies.data.varieties[pokeIndex].pokemon.name,
                        stats: stats
                    }
                })
            } else {
                res.status(pokemon.status)
                    .send({
                        message: pokemon.statusText,
                    })
            }
        } else {
            res.status(500).send({
                message: 'The pokemonName or pokeUrl parameter is missing'
            })
        }
    } catch (e) {
        res.status(500).send({
            message: 'Error',
            ...e
        })
    }

}

export const getAboutPokemon = async (req: Request, res: Response) => {
    const {pokemonName} = req.query
    try {
        if (pokemonName) {
            const pokemonSpecies: AxiosResponse = await httpClient.get('/pokemon-species/' + pokemonName)
            const genera: string                = pokemonSpecies.data.genera
                .filter(val => val.language.name === 'en')[0].genus
            const flavorText: string            = pokemonSpecies.data.flavor_text_entries
                .filter(
                    val =>
                        val.language.name === 'en' &&
                        (val.version.name === 'sword' ||
                            val.version.name === 'x' ||
                            val.version.name === 'lets-go-pikachu' ||
                            val.version.name === 'ultra-sun')
                )[0].flavor_text
            const gender_rate: number           = pokemonSpecies.data.gender_rate
            const female: number                = gender_rate > -1 ? (gender_rate / 8) * 100 : 0
            const male: number                  = gender_rate > -1 ? 100 - female : 0

            if (pokemonSpecies.status === 200) {
                res.send({
                    about: {
                        pokemonName   : pokemonSpecies.data.name,
                        description   : flavorText,
                        gendersPercent: {
                            female: female + '%',
                            male  : male + '%'
                        },
                        genera        : genera,
                    }
                })
            } else {
                res.status(500).send({
                    message: 'error'
                })
            }
        } else {
            res.status(500).send({
                message: 'The pokemonName parameter is missing'
            })
        }
    } catch (e) {
        res.status(500).send({
            message: 'Error',
            ...e
        })
    }
}

export const getEvolutionsPokemon = async (req: Request, res: Response) => {
    const {pokemonName}      = req.query
    let pokemonsImg: any[]   = []
    let pokemonsEvol2: any[] = []

    try {
        if (pokemonName) {

            const pokemonSpecies: AxiosResponse = await httpClient.get('/pokemon-species/' + pokemonName)
            const evolution: AxiosResponse      = await axios.get(pokemonSpecies.data.evolution_chain.url)
            const chain: any                    = evolution.data.chain
            const evolutions                    = {
                nameFirstPokemon : chain.species.name,
                firstPokemonImg  : '',
                evolutionsPokemon: chain.evolves_to
                    .map(
                        val => val.evolution_details.reduce((acc, el) => ({
                            ...acc,
                            trigger     : el.trigger.name,
                            minLevel    : el.min_level,
                            name        : val.species.name,
                            gender      : el.gender,
                            location    : el.location,
                            minHappiness: el.min_happiness,
                            timeOfDay   : el.time_of_day,
                            minAffection: el.min_affection,
                            minBeauty   : el.min_beauty,
                            item        : !el.item ? null : el.item.name,
                            img         : null,
                            evolutions  : val.evolves_to
                                .map(
                                    val => val.evolution_details.reduce((acc, el) => ({
                                        ...acc,
                                        trigger     : el.trigger.name,
                                        minLevel    : el.min_level,
                                        name        : val.species.name,
                                        gender      : el.gender,
                                        location    : el.location,
                                        item        : !el.item ? null : el.item.name,
                                        minBeauty   : el.min_beauty,
                                        minAffection: el.min_affection,
                                        minHappiness: el.min_happiness,
                                        timeOfDay   : el.time_of_day,
                                        img         : null,
                                    }), {})
                                )
                        }), {})
                    )
            }

            const firstPokemon: AxiosResponse   = await httpClient.get('/pokemon-species/' + evolutions.nameFirstPokemon)
            const firstEvolution: AxiosResponse = await httpClient.get(firstPokemon.data.varieties[0].pokemon.url)
            evolutions.firstPokemonImg          = firstEvolution.data.sprites.other['official-artwork'].front_default

            for (let item of evolutions.evolutionsPokemon) {

                const pokeSpecieApi: AxiosResponse      = await httpClient.get('/pokemon-species/' + item.name)
                const url: string                       = pokeSpecieApi.data.varieties[0].pokemon.url
                const evolutionsResponse: AxiosResponse = await httpClient.get(url)
                pokemonsImg.push({
                    img : evolutionsResponse.data.sprites.other['official-artwork'].front_default,
                    name: evolutionsResponse.data.name,
                })

                if (item.evolutions.length > 0) {
                    for (let evo of item.evolutions) {
                        const pokeSpecieEvoApi: AxiosResponse = await httpClient.get('/pokemon-species/' + evo.name)
                        const urlEvo: string                  = pokeSpecieEvoApi.data.varieties[0].pokemon.url
                        const evoResponse: AxiosResponse      = await httpClient.get(urlEvo)
                        pokemonsEvol2.push({
                            img : evoResponse.data.sprites.other['official-artwork'].front_default,
                            name: evoResponse.data.name,
                        })
                    }

                }
            }

            for (let i = 0; i < pokemonsImg.length; i++) {
                if (pokemonsImg.length === evolutions.evolutionsPokemon.length) {
                    evolutions.evolutionsPokemon[i].img = pokemonsImg[i].img
                }
            }

            for (let item of evolutions.evolutionsPokemon) {
                if (item.evolutions.length > 0) {
                    for (let i = 0; i < item.evolutions.length; i++) {
                        for (let pokeImg of pokemonsEvol2) {
                            if (item.evolutions[i].name === pokeImg.name) {
                                item.evolutions[i].img = pokeImg.img
                            }
                        }
                    }
                }
            }

            if (
                pokemonSpecies.status === 200 &&
                evolution.status === 200
            ) {
                res.send({
                    evolutions: evolutions
                })
            } else {
                res.status(500).send({
                    message : pokemonSpecies.statusText,
                    message2: evolution.statusText
                })
            }
        } else {
            res.status(500).send({
                message: 'The pokemonName parameter is missing'
            })
        }
    } catch (e) {
        res.status(500).send({
            message: 'Error',
            ...e
        })
    }
}

export const getPokemonVarieties = async (req: Request, res: Response) => {

    const {pokemonName}          = req.query
    let pokemonsVarieties: any[] = []
    try {
        if (pokemonName) {

            const pokemonSpecies: AxiosResponse = await httpClient.get('/pokemon-species/' + pokemonName)
            const eggGroups: any[]              = pokemonSpecies.data.egg_groups.map(val => val.name)
            const varieties: any[]              = pokemonSpecies.data.varieties.map(val => ({
                isDefault: val.is_default,
                name     : val.pokemon.name,
                url      : val.pokemon.url
            }))

            for (let item of varieties) {
                const pokeVarieties: AxiosResponse = await httpClient.get(item.url)
                const abilities: any[]             = pokeVarieties.data.abilities.map(val => (val.ability.name))
                pokemonsVarieties.push({
                    img          : pokeVarieties.data.sprites.other['official-artwork'].front_default,
                    name         : pokeVarieties.data.name,
                    types        : pokeVarieties.data.types.map(val => (val.type.name)),
                    eggGroups    : eggGroups,
                    abilities    : abilities,
                    pokemonHeight: (pokeVarieties.data.height / 10) + ' m',
                    pokemonWeight: (pokeVarieties.data.weight / 10) + ' kg',
                    url          : item.url
                })
            }

            if (
                pokemonSpecies.status === 200
            ) {
                res.send({
                    Pokemon: {
                        name     : pokemonName,
                        varieties: pokemonsVarieties,
                    }
                })
            } else {
                res.status(500).send({
                    message: 'error'
                })
            }
        } else {
            res.status(500).send({
                message: 'The pokemonName parameter is missing'
            })
        }
    } catch (e) {
        res.status(500).send({
            message: 'Error',
            ...e
        })
    }
}
