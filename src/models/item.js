import mongoose from 'mongoose'
const Schema = mongoose.Schema

const ItemSchema = new Schema({
	name: {
		type: String,
		required: true
	},
	description: {
		type: String,
		required: true
	},
	category: {
		type: Schema.ObjectId,
		ref: 'Category',
		required: true
	},
	price: {
		type: Number,
		required: true
	},
	stock_count: {
		type: Number,
		required: true
	},
	discount_percentage: {
		type: Number,
		required: true
	},
	rating: {
		type: Number,
		required: true
	},
	brand: {
		type: String,
		required: true
	},
	thumbnail: {
		type: String,
		required: true
	},
	images: {
		type: [String],
		required: false
	}
})

ItemSchema.pre('save', function (next) {
	this.name = this.name.charAt(0).toUpperCase() + this.name.slice(1)
	next()
})

// Cannot have item with too similar name in same category
ItemSchema.index({ name: 1, category: 1 }, {
	unique: true,
	collation: { locale: 'en', strength: 1 }
})

ItemSchema.virtual('url').get(function () {
	return '/inventory/item/' + this.id
})


export default mongoose.model('Item', ItemSchema)
