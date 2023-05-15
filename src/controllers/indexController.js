import asyncHandler from '../asyncHandler.js'
import Category from '../models/category.js'
import Item from '../models/item.js'
import { getAllCategoryDocuments } from './categoryController.js'

async function getStats () {
	const aggregateArray = await Item.aggregate([
		{ $group: {
			_id: null,
			totalValueUnique: { $sum: '$price' },
			totalValueAllStock: { $sum: { $multiply: ['$price', '$stock_count'] }}
		}}
	])
	return aggregateArray[0]
}

export const homepage = asyncHandler(async (req, res, next) => {
	const [
		categories,
		numCategories,
		numItems,
		stats
	] = await Promise.all([
		getAllCategoryDocuments(),
		Category.countDocuments({}).exec(),
		Item.countDocuments({}).exec(),
		getStats()
	])

	res.render('index', {
		categories,
		numCategories,
		numItems,
		totalValueUnique: stats.totalValueUnique.toLocaleString(),
		totalValueAllStock: stats.totalValueAllStock.toLocaleString()
	})
})
