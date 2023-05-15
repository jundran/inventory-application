import mongoose from 'mongoose'
import dotenv from 'dotenv'
import { LoremIpsum } from 'lorem-ipsum'
import Category from './models/category.js'
import Item from './models/item.js'
import { getCategoryNames, getCategoryProducts } from './dummy.js'
import { formatName } from './utils.js'

dotenv.config()
await connectToDatabase().catch(() => process.exit(1))
await dropDatabase().catch(() => closeConnection())
populateDatabase().finally(() => closeConnection())

async function connectToDatabase () {
	try {
		const db = await mongoose.connect(process.env.MONGO_DB_CONNECTION_STRING)
		console.log(`Connected to MongoDB on port ${db.connections[0].port}`)
	} catch (err) {
		console.log('Error connecting to database:', err)
	}
}

async function dropDatabase () {
	return mongoose.connection.dropDatabase()
		.then(() => console.log('Database dropped'))
		.catch(err => console.log('Error dropping database:', err))
}

async function closeConnection () {
	return mongoose.connection.close()
		.then(console.log('Connection closed'))
		.catch(err => console.log('Error closing connection:', err))
}

async function populateDatabase () {
	console.log('Populating database')
	try {
		const categoryNames = await getCategoryNames()
		for (const categoryName of categoryNames) {
			const categoryDocument = await createCategory(categoryName)
			const categoryProducts = await getCategoryProducts(categoryName)
			const createFunctions = categoryProducts.map(product =>
				createItem(categoryDocument, product))
			await Promise.all(createFunctions)
		}
	} catch (err) {
		console.log(err)
	}
}

async function createCategory (name) {
	const lorem = new LoremIpsum({
		wordsPerSentence: {
			max: 16,
			min: 4
		}
	})

	console.log('Adding category:', name)
	const category = new Category({
		name: formatName(name),
		description: lorem.generateSentences(5)
	})
	await category.save()
	return category
}

async function createItem (categoryDocument, product) {
	const data = {
		category: categoryDocument,
		name: formatName(product.title),
		description: product.description,
		price: product.price,
		discount_percentage: product.discountPercentage,
		rating: product.rating,
		stock_count: product.stock,
		brand: product.brand,
		thumbnail: product.thumbnail,
		images: product.images.slice(0, -1)
	}
	console.log('Adding item:', product.title)
	return new Item(data).save()
}
