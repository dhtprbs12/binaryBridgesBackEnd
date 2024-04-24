const videos = [
	{
		id: '2-sum',
		poster: '/video/0/poster',
		duration: '3 mins',
		name: '2 sum',
		seq: 1,
	},
	{
		id: '3-sum',
		poster: '/video/1/poster',
		duration: '4 mins',
		name: '3 sum',
		seq: 2,
	},
	{
		id: 'container-with-most-water',
		poster: '/video/2/poster',
		duration: '2 mins',
		name: 'Container with most water',
		seq: 3,
	},
]

import express from 'express'
import fs from 'fs'
import path from 'path'
import cors from 'cors'
import thumbsupply from 'thumbsupply'
import { ApolloServer } from '@apollo/server'
import typeDefs from './assets/type/typeDefs.js'
import resolvers from './assets/resolver/resolvers.js'
import bodyParser from 'body-parser'
import { startStandaloneServer } from '@apollo/server/standalone'
import Stripe from 'stripe'
import multer from 'multer'
import mysql from 'mysql'
import dotenv from 'dotenv'
import nodemailer from 'nodemailer'
import sendProductToEmail from './assets/sendProtuctToEmail.js'
dotenv.config()
const __dirname = path.resolve()

const connection = mysql.createConnection({
	host: process.env.DB_HOST,
	user: process.env.DB_USER,
	password: process.env.DB_PW,
	database: process.env.DB,
})
connection.connect((err) => {
	if (err) {
		return err
	}
})

const server = new ApolloServer({ typeDefs, resolvers })
startStandaloneServer(server, {
	listen: { port: 4000 },
}).then(({ url }) => {
	console.log(`Express app listening on port ${url}`)
})

const app = express()
app.use(cors(), bodyParser.json())
app.use(express.json())
app.get('/videos', (req, res) => {
	res.json(videos)
})

const productMapper = {
	['MobileVersion']: 'Youtube Mobile Clone',
	['DesktopVersion']: 'Youtube Desktop Clone',
	['DesktopVersionAndScript']:
		'Youtube Desktop Clone and Behavior Questions Script',
}

// checkout

// video upload
const storage = multer.diskStorage({
	destination: function (req, file, cb) {
		cb(null, 'assets/')
	},
	filename: function (req, file, cb) {
		console.log(file.originalname)
		cb(null, file.originalname)
	},
})

const videoUpload = multer({
	storage: storage,
})

// video upload
app.post('/upload-video', (req, httpRes) => {
	videoUpload.single('file')(req, httpRes, function (err) {
		if (err) {
			// if the file upload fails, we throw an error
			httpRes.status(500).send(new Error(err))
		} else {
			const sql =
				'insert into video (videoName, fileName, takeaways, duration, sequence) values ?'
			const values = [
				[
					req.body.name,
					req.body.fileName,
					req.body.takeaways,
					req.body.duration,
					req.body.sequence,
				],
			]
			connection.query(sql, [values], function (err, res) {
				if (err) {
					console.log(`Error while uploading video -- ERROR: ${err}`)
					httpRes.status(500).send(new Error(err))
				} else {
					console.log(`Succeeded on uploading video`)
					httpRes.send({
						result: 'success',
					})
				}
			})
		}
	})
})

// stripe

const stripe = new Stripe(process.env.STRIPE_API_KEY)

app.post('/create-customer', async (req, res) => {
	try {
		const firstName = req.body.firstName
		const lastName = req.body.lastName
		const email = req.body.email
		console.log(req.body)
		const customer = await stripe.customers.create({
			name: `${firstName}, ${lastName}`,
			email: email,
		})
		res.send(customer)
	} catch (err) {
		console.log(`Error while create-customer: ${err}`)
		res.status(400)
		res.send({ error: err })
		return
	}
})

app.post('/create-setup-intent', async (req, res) => {
	try {
		const customerId = req.body.customerId
		const intent = await stripe.setupIntents.create({
			payment_method_types: ['card'],
			customer: customerId,
		})
		res.send(intent)
	} catch (err) {
		console.log(`Error while create-setup-intent: ${err}`)
		res.status(400)
		res.send({ error: err })
		return
	}
})

app.post('/confirm-setup-intent', async (req, res) => {
	try {
		const { id } = req.body
		const intent = await stripe.setupIntents.confirm(id)
		res.send(intent)
	} catch (err) {
		console.log(`Error while confirm-setup-intent: ${err}`)
		res.status(400)
		res.send({ error: err })
		return
	}
})

app.post('/create-payment-intent', async (req, res) => {
	const { amount, customerId, paymentMethodId } = req.body
	try {
		const paymentIntent = await stripe.paymentIntents.create({
			amount: amount,
			customer: customerId,
			payment_method: paymentMethodId,
			currency: 'usd',
			statement_descriptor_suffix: 'payment using stripe',
			automatic_payment_methods: {
				enabled: true,
			},
		})
		console.log(
			`create-payment-intent response: ${paymentIntent.client_secret}`
		)
		res.send({
			clientSecret: paymentIntent.client_secret,
		})
	} catch (err) {
		console.log(`Error while create-payment-intent: ${err}`)
		res.status(400)
		res.send({ error: err })
		return
	}
})

app.get('/download/:id', (req, res) => {
	const productName = req.params.id
	const docPath = path.join(__dirname, `/assets/${productName}.zip`)
	const file = fs.createWriteStream(docPath)
	console.log(`Start Dowloading: ${productName}.zip...`)
	res.download(docPath, `${productName}.zip`, function (err) {
		if (err) {
			// if the file download fails, we throw an error
			res.status(500).send(new Error(err))
			console.log(`Error While Dowloading: ${productName}.zip...`)
		}
	})
	console.log(`End Dowloading: ${productName}.zip...`)
})

app.post('/send-to-email', async (req, res) => {
	const { email, product, desktopSpecialOfferOver } = req.body
	const mailMeta = {
		from: 'binarybridgeonline@gmail.com',
		to: email,
		subject: 'Binary Bridge - Thank your purchasing. Here is your product.',
		html: sendProductToEmail(
			email.slice(0, email.indexOf('@')),
			product,
			desktopSpecialOfferOver
		),
		attachments: [
			{
				filename: `${product}.zip`, // <= Here: made sure file name match
				path: path.join(__dirname, `/assets/${product}.zip`), // <= Here
				contentType: 'application/zip',
			},
		],
	}

	const transporter = nodemailer.createTransport({
		service: 'gmail',
		auth: {
			user: 'binarybridgeonline@gmail.com',
			pass: 'qstwnjdayrackgkn',
		},
	})
	console.log(`Sending ${product} to ${email}`)
	transporter.sendMail(mailMeta, function (err, info) {
		if (err) {
			console.log(`Error while sending email: ${err}`)
			res.status(500).send({ res: 'fail' })
		} else {
			console.log(`Succeeded to send script to ${email}`)
			res.status(200).send({ res: 'success' })
		}
	})
})

app.get('/cancel', (req, res) => {
	res.send('Payment cancel')
})

// video player

app.get('/video/:id/data', (req, res) => {
	const id = parseInt(req.params.id, 10)
	res.json(videos[id])
})

app.get('/video/:id', (req, res) => {
	const path = `assets/${req.params.id}.mp4`
	const stat = fs.statSync(path)
	const fileSize = stat.size
	const range = req.headers.range
	if (range) {
		const parts = range.replace(/bytes=/, '').split('-')
		const start = parseInt(parts[0], 10)
		const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1
		const chunksize = end - start + 1
		const file = fs.createReadStream(path, { start, end })
		const head = {
			'Content-Range': `bytes ${start}-${end}/${fileSize}`,
			'Accept-Ranges': 'bytes',
			'Content-Length': chunksize,
			'Content-Type': 'video/mp4',
		}
		res.writeHead(206, head)
		file.pipe(res)
	} else {
		const head = {
			'Content-Length': fileSize,
			'Content-Type': 'video/mp4',
		}
		res.writeHead(200, head)
		fs.createReadStream(path).pipe(res)
	}
})

app.get('/video/:id/poster', (req, res) => {
	thumbsupply
		.generateThumbnail(`assets/${req.params.id}.mp4`)
		.then((thumb) => res.sendFile(thumb))
})

app.get('/video', (req, res) => {
	res.sendFile('assets/2sum-youtube-edited.mp4', { root: __dirname })
})

app.listen(4001, () => {
	console.log(`Express app listening on port ${4001}`)
})
