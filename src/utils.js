import { validationResult } from 'express-validator'
import { getAllCategoryDocuments } from './controllers/categoryController.js'

export const THUMBNAIL_DEFAULT = '/default-thumbnail.png'

export function formatName (name) {
	return name.charAt().toUpperCase() + name.slice(1).replace('-', ' ')
}

export function createError (message, code) {
	const error = new Error(message)
	error.status = code
	return error
}

export async function sendErrorPage (res, message, statusCode) {
	res.statusCode = statusCode
	res.render('error', {
		categories: await getAllCategoryDocuments(),
		message
	})
}

export function addErrorsToRequestObject (req, next) {
	const errors = validationResult(req).array().map(err => err.msg)
	if (!req.errors) req.errors = []
	req.errors = [...req.errors, ...errors]
	next()
}
