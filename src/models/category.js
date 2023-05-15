import mongoose from 'mongoose'
const Schema = mongoose.Schema

const CategorySchema = new Schema({
	name: {
		type: String,
		required: true
	},
	description: {
		type: String,
		required: true
	}
})

CategorySchema.pre('save', function (next) {
	this.name = this.name.charAt(0).toUpperCase() + this.name.slice(1)
	next()
})

// Cannot have category with too similar name in inventory
CategorySchema.index({ name: 1 }, {
	unique: true,
	collation: { locale: 'en', strength: 1 }
})

CategorySchema.virtual('url').get(function () {
	return '/inventory/category/' + this.id
})

export default mongoose.model('Category', CategorySchema)
