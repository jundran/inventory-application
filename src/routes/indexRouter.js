import express from 'express'
import multer from 'multer'
import { 	homepage } from '../controllers/indexController.js'
import {
	itemsInCategory,
	categoryListDetail,
	categoryCreateGet,
	categoryCreatePost,
	categoryUpdateGet,
	categoryUpdatePost,
	categoryDeleteGet,
	categoryDeletePost
} from '../controllers/categoryController.js'
import {
	itemDetail,
	itemCreateGet,
	itemCreatePost,
	itemUpdateGet,
	itemUpdatePost,
	itemDeleteGet,
	itemDeletePost
} from '../controllers/itemController.js'

const router = express.Router()

// Multer
function uploadFile (req, res, next) {
	const storage = multer.diskStorage({
		destination: 'src/public/images/',
		filename: ( req, file, cb ) => {
			cb(null, Date.now() + '-' + file.originalname)
		}
	})

	const fieldsArray = [
		{ name: 'thumbnailUpload', maxCount: 1 },
		{ name: 'imageUploads' }
	]

	function fileFilter (req, file, cb) {
		const acceptedMimeTypes = ['image/gif','image/jpeg','image/png','image/svg+xml','image/webp']
		if (acceptedMimeTypes.includes(file.mimetype)) cb(null, true)
		else {
			cb(null, false) // Reject file and forward error on req
			// Will be first error so create array here
			req.errors = [`Cannot accept files with type ${file.mimetype}`]
		}
	}

	const upload = multer({ storage, fileFilter }).fields(fieldsArray)
	upload(req, res, function (err) {
		if (err) next(err)
		else next()
	})
}

router.get('/', homepage)
router.get('/inventory/category', categoryListDetail)

router.get('/inventory/category/create', categoryCreateGet)
router.post('/inventory/category/create', categoryCreatePost)
router.get('/inventory/category/:id/update', categoryUpdateGet)
router.post('/inventory/category/:id/update', categoryUpdatePost)
router.get('/inventory/category/:id/delete', categoryDeleteGet)
router.post('/inventory/category/:id/delete', categoryDeletePost)
router.get('/inventory/category/:id', itemsInCategory)

router.get('/inventory/item/create', itemCreateGet)
router.post('/inventory/item/create', uploadFile, itemCreatePost)
router.get('/inventory/item/:id/update', itemUpdateGet)
router.post('/inventory/item/:id/update', uploadFile, itemUpdatePost)
router.get('/inventory/item/:id/delete', itemDeleteGet)
router.post('/inventory/item/:id/delete', itemDeletePost)
router.get('/inventory/item/:id', itemDetail)

export default router
