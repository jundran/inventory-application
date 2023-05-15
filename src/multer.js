import { unlink } from 'fs/promises'
import path from 'path'
import { THUMBNAIL_DEFAULT } from './utils.js'
import Item from './models/item.js'

export function getImages (req) {
	const uploaded = req.files.imageUploads ?
		req.files.imageUploads.map(upload =>'/images/' + upload.filename) : []

	// Two or more existing images remain selected
	if (Array.isArray(req.body.images)) {
		return [...req.body.images, ...uploaded]
	}
	// Only 1 existing image remains selected
	else if (typeof req.body.images === 'string') {
		return [req.body.images, ...uploaded]
	}
	// No existing images remain selected
	else return uploaded
}

export async function getThumbnail (req) {
	if (!req.files.thumbnailUpload) {
		const originalItem = req.params.id ? await Item.findById(req.params.id).exec() : null
		return originalItem ? originalItem.thumbnail : THUMBNAIL_DEFAULT
	}
	return '/images/' + req.files.thumbnailUpload[0].filename
}

export function removeDeletedImagesFromStorage (originalItem, updatedItem) {
	const deletedImages = originalItem.images.filter(originalImage => {
		if (
			!originalImage.startsWith('http') &&
			!updatedItem.images.includes(originalImage)
		) return originalImage
	})

	if (
		!originalItem.thumbnail.startsWith('http') &&
		originalItem.thumbnail !== THUMBNAIL_DEFAULT &&
		originalItem.thumbnail !== updatedItem.thumbnail
	)	deletedImages.push(originalItem.thumbnail)

	for (const image of deletedImages) {
		unlink(path.resolve('src', 'public' + image))
			.then(console.log('Deleted ' + image))
			.catch(err => console.log(err))
	}
}
