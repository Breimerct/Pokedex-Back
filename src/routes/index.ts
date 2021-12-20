import { Router } from 'express'
import * as pokedexController from '../controllers/pokedex.controller'
import * as pokemonDetailController from '../controllers/pokemon.controller'
import * as filterController from '../controllers/filter.controller'
const router = Router()

router.get('/pokedex', pokedexController.getPokedex)
router.get('/pokemons', pokedexController.getPokemons)
router.get('/filters/types', filterController.getTypes)
router.get('/filters/regions', filterController.getRegions)
router.get('/filters/pokedexes', filterController.getPokedexes)
router.get('/pokemon-detail/stats', pokemonDetailController.getPokemonStats)
router.get('/pokemon-detail/about', pokemonDetailController.getAboutPokemon)
router.get('/pokemon-detail/evolutions', pokemonDetailController.getEvolutionsPokemon)
router.get('/pokemon-detail/varieties', pokemonDetailController.getPokemonVarieties)

export default router
