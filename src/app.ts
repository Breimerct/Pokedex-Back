import express from 'express'
import cors from 'cors'
import morgan from 'morgan'
import path from 'path'
import indexRoutes from './routes'
const app = express()

//settings
app.set('port', process.env.PORT || 3000)

//middlewares
app.use(cors())
app.use(morgan('dev'))
app.use(express.urlencoded({ extended: false }) )
app.use(express.json())
app.use(express.static(path.join(__dirname, '../public')))

//Routes
app.use('/api', indexRoutes)

export default app
