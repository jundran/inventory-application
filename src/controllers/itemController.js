import { body } from 'express-validator'
import asyncHandler from '../asyncHandler.js'
import { getImages, getThumbnail, removeDeletedImagesFromStorage } from '../multer.js'
import { getAllCategoryDocuments } from './categoryController.js'
import Item from '../models/item.js'
import { THUMBNAIL_DEFAULT, sendErrorPage, addErrorsToRequestObject } from '../utils.js'

export const itemDetail = asyncHandler(async (req, res, next) => {
	const itemId = req.params.id
	const item = await Item.findById(itemId).populate('category').exec()
	if (!item) return sendErrorPage(res, 'Item not found', 404)

	res.render('item_detail', {
		categories: await getAllCategoryDocuments(),
		item
	})
})

export const itemCreateGet = asyncHandler(async (req, res, next) => {
	const itemTemplate = {
		name: '',
		description: '',
		category: { _id: 0 },
		price: 0,
		stock_count: 0,
		discount_percentage: 0,
		rating: 0,
		brand: '',
		thumbnail: THUMBNAIL_DEFAULT,
		images: []
	}

	res.render('item_form', {
		title: 'New Item',
		heading: 'Create Item',
		categories: await getAllCategoryDocuments(),
		item: itemTemplate,
		errors: []
	})
})

export const itemCreatePost = [
	validateFields(),
	(req, res, next) => addErrorsToRequestObject(req, next),

	asyncHandler(async (req, res, next) => {
		const item = await getNewItemDocumentFromBody(req)

		if (req.errors.length) {
			res.render('item_form', {
				title: 'New Item',
				heading: 'Create Item',
				categories: await getAllCategoryDocuments(),
				item,
				errors: req.errors
			})
		} else {
			item.save()
				.then(newItem => res.redirect(newItem.url))
				.catch(err => itemPostErrorHandler(req, res, next, err))
		}
	})
]

export const itemUpdateGet = asyncHandler(async (req, res, next) => {
	const itemId = req.params.id
	const item = await Item.findById(itemId).populate('category').exec()
	if (!item) return sendErrorPage(res, 'Item not found', 404)

	res.render('item_form', {
		heading: 'Update Item',
		categories: await getAllCategoryDocuments(),
		item,
		errors: []
	})
})

export const itemUpdatePost = [
	validateFields(),
	(req, res, next) => addErrorsToRequestObject(req, next),

	asyncHandler(async (req, res, next) => {
		const item = await getNewItemDocumentFromBody(req)

		if (req.errors.length) {
			res.render('item_form', {
				heading: 'Update Item',
				categories: await getAllCategoryDocuments(),
				item,
				errors: req.errors
			})
		} else {
			const originalItem = await Item.findById(req.params.id).exec()
			Item.findByIdAndUpdate(req.params.id, item, { new: true }).exec()
				.then(updatedItem => {
					removeDeletedImagesFromStorage(originalItem, updatedItem)
					res.redirect(updatedItem.url)
				})
				.catch(err => itemPostErrorHandler(req, res, next, err))
		}
	})
]

export const itemDeleteGet = asyncHandler(async (req, res, next) => {
	const item = await Item.findById(req.params.id).exec()
	if (!item) sendErrorPage(res, 'Item not found', 404)
	else res.render('confirm_item_delete', {
		title: `Delete item: | ${item.name}`,
		categories: await getAllCategoryDocuments(),
		document: item,
		type: 'item'
	})
})

export const itemDeletePost = asyncHandler(async (req, res, next) => {
	const document = await Item.findByIdAndRemove(req.params.id).populate('category').exec()
	if (document) res.redirect(document.category.url)

	// If user uses back button to return to delete confirmation page and tries
	// to delete again then they will be redirected to the 404 page for the item
	else res.redirect(req.url)
})

async function getNewItemDocumentFromBody (req) {
	const item = new Item({
		name: req.body.name,
		description: req.body.description,
		category: req.body.category,
		price: req.body.price,
		stock_count: req.body.stock_count,
		discount_percentage: req.body.discount_percentage,
		rating: req.body.rating,
		brand: req.body.brand,
		thumbnail: await getThumbnail(req),
		images: getImages(req)
	})
	if (req.params.id) item._id = req.params.id
	return item
}

function itemPostErrorHandler (req, res, next, err) {
	if (err.code === 11000) {
		if (!req.errors) req.errors = []
		req.errors.push('Item name is too similar to another item in this category')
		itemUpdatePost(req, res, next)
	} else {
		next(err)
	}
}

function validateFields () {
	return [
		body('name', 'Name must not be empty').trim().isLength({ min: 1 }),
		body('description', 'Description must not be empty').trim().isLength({ min: 1 }),
		body('brand', 'Brand must not be empty').trim().isLength({ min: 1 })
	]
}
