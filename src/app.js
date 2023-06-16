import express from 'express'
import path from 'path'
import indexRouter from './routes/indexRouter.js'
import { sendErrorPage } from './utils.js'

const app = express()

// View engine setup
app.set('views', 'src/views')
app.set('view engine', 'pug')

app.use(express.static(path.resolve('src', 'public')))
// For parsing posted forms req.body without using multer
app.use(express.urlencoded({ extended: false }))
app.use('/', indexRouter)

// Catch 404
app.use((req, res, next) => {
	res.render('error', { message: 'Page Not found - 404' })
})

// Error handler
app.use(async (err, req, res, next) => {
	console.log('ERROR HANDLER - Status code:', err.status)

	// Handle badly formatted id - will not be caught as a 404 but treat as such
	if (err.name === 'CastError') {
		return sendErrorPage(res, 'Page not found', 404)
	}
	else {
		console.error(err)
		sendErrorPage(res, 'Something went wrong with your request', err.status || 500)
	}
})

const port = 5000
export default () => app.listen(
	port,
	() => console.log(`Server listening on port ${port}`)
)
