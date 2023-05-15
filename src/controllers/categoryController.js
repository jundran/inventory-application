import { body } from 'express-validator'
import asyncHandler from '../asyncHandler.js'
import Category from '../models/category.js'
import Item from '../models/item.js'
import { sendErrorPage, addErrorsToRequestObject } from '../utils.js'

export async function getAllCategoryDocuments () {
	return await Category.find({}).sort({ name: 1}).exec()
}

export const itemsInCategory = asyncHandler(async (req, res, next) => {
	const categoryId = req.params.id
	const category = await Category.findById(categoryId).exec()
	if (!category) return sendErrorPage(res, 'Category not found', 404)
	const items = await Item.find({ category: categoryId }).sort({ name: 1}).exec()

	res.render('item_list', {
		categories: await getAllCategoryDocuments(),
		category,
		items
	})
})

export const categoryListDetail = asyncHandler(async (req, res, next) => {
	res.render('categories_detail', {
		categories: await getAllCategoryDocuments()
	})
})

export const categoryCreateGet = asyncHandler(async (req, res, next) => {
	res.render('category_form', {
		title: 'New Category',
		heading: 'Create Category',
		categories: await getAllCategoryDocuments(),
		category: { name: '', description: '' },
		errors: []
	})
})

export const categoryCreatePost = [
	validateFields(),
	(req, res, next) => addErrorsToRequestObject(req, next),

	asyncHandler(async (req, res, next) => {
		const category = getCategoryDocument(req)

		if (req.errors.length) {
			res.render('category_form', {
				title: 'New Category',
				heading: 'Create Category',
				categories: await getAllCategoryDocuments(),
				category,
				errors: req.errors
			})
		} else {
			category.save()
				.then(newCategory => res.redirect(newCategory.url))
				.catch(err => categoryPostErrorHandler(req, res, next, err))
		}
	})
]

export const categoryUpdateGet = asyncHandler(async (req, res, next) => {
	const categoryId = req.params.id
	const category = await Category.findById(categoryId).exec()
	if (!category) return sendErrorPage(res, 'Category not found', 404)

	res.render('category_form', {
		heading: 'Update Category',
		categories: await getAllCategoryDocuments(),
		category,
		errors: []
	})
})

export const categoryUpdatePost = [
	validateFields(),
	(req, res, next) => addErrorsToRequestObject(req, next),

	asyncHandler(async (req, res, next) => {
		const category = getCategoryDocument(req)

		if (req.errors.length) {
			res.render('category_form', {
				heading: 'Update Category',
				categories: await getAllCategoryDocuments(),
				category,
				errors: req.errors
			})
		} else {
			Category.findByIdAndUpdate(req.params.id, category, { new: true }).exec()
				.then(res.redirect('/inventory/category'))
				.catch(err => categoryPostErrorHandler(req, res, next, err))
		}
	})
]

export const categoryDeleteGet = asyncHandler(async (req, res, next) => {
	const category = await Category.findById(req.params.id).exec()
	if (!category) return sendErrorPage(res, 'Category not found', 404)

	const itemsInCategory = await Item.find({ category: req.params.id }).exec()

	res.render('confirm_category_delete', {
		title: `Delete category: | ${category.name}`,
		categories: await getAllCategoryDocuments(),
		category,
		items: itemsInCategory
	})
})

export const categoryDeletePost = asyncHandler(async (req, res, next) => {
	const itemsInCategory = await Item.find({ category: req.params.id }).exec()
	if (itemsInCategory.length) {
		categoryDeleteGet(req, res, next)
	} else {
		Category.findByIdAndRemove(req.params.id).exec()
		res.redirect('/inventory/category')
	}
})

function getCategoryDocument (req) {
	const category = new Category({
		name: req.body.name,
		description: req.body.description
	})
	if (req.params.id) category._id = req.params.id
	return category
}

function categoryPostErrorHandler (req, res, next, err) {
	if (err.code === 11000) {
		if (!req.errors) req.errors = []
		req.errors.push('Category name is too similar to another category in the inventory')
		categoryCreatePost(req, res, next)
	} else next(err)
}

function validateFields () {
	return [
		body('name', 'Name must not be empty').trim().isLength({ min: 1 }),
		body('description', 'Description must not be empty').trim().isLength({ min: 1 })
	]
}
