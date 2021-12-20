import {Request, Response} from 'express';
import {httpClient} from '../plugins/axios';
import {AxiosResponse} from 'axios';

export const getTypes = async (req: Request, res: Response) => {
    let types: any[] = []
    try {
        const type: AxiosResponse = await httpClient.get('/type', {
            params: {
                limit: 20
            }
        })

        types = type.data.results.map(val => val.name)

        res.send({
            types: types
        }).status(200)
    } catch (e) {
        res.status(500).send({
            message: 'Error al tratar de obtener los typos!',
            ...e
        })
    }
}

export const getRegions = async (req: Request, res: Response) => {
    let regions: any[] = []
    try {
        const region = await httpClient.get('/region', {
            params: {
                limit: 8
            }
        })

        regions = region.data.results.map(val => val.name)

        res.send({
            regions: regions
        }).status(200)
    } catch (e) {
        res.status(500).send({
            message: 'Error al tratar de obtener las regiones!',
            ...e
        })
    }
}

export const getPokedexes = async (req: Request, res: Response) => {
    const {region} = req.query
    try {
        let pokedexesArray: any[] = []
        if (region) {
            const pokedexes: AxiosResponse = await httpClient.get(`/region/${region}`, {
                params: {
                    limit: 8
                }
            })

            pokedexesArray = pokedexes.data.pokedexes.map(val => val.name)

            res.send({
                pokedexes: pokedexesArray
            }).status(200)
        } else {
            res.status(500).send({
                message: 'Hace falta el parametro del nombre de la región'
            })
        }
    } catch (e) {
        res.status(500).send({
            message: 'error al tratar de obtener las pokedexes!',
            ...e
        })
    }
}
