export async function getCategoryNames () {
	try {
		const response = await fetch('https://dummyjson.com/products/categories')
		return await response.json()
	} catch (err) {
		console.log(err)
	}
}

export async function getCategoryProducts (categoryName) {
	return new Promise((resolve, reject) => {
		fetch(`https://dummyjson.com/products/category/${categoryName}`)
			.then(res => res.json())
			.then(json => resolve(json.products))
			.catch(err => reject(err))
	})
}
