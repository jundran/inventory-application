import dotenv from 'dotenv'
import mongoose from 'mongoose'
import expressApp from './app.js'

dotenv.config()
mongoose.connect(process.env.MONGO_DB_CONNECTION_STRING)
	.then(db => {
		console.log(`Connected to MongoDB on port ${db.connections[0].port}`)
		expressApp()
	})
	.catch(error => console.log(error))
