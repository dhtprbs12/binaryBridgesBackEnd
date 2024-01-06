const videos = [
    {
        id: '2-sum',
        poster: '/video/0/poster',
        duration: '3 mins',
        name: '2 sum',
        seq: 1
    },
    {
        id: '3-sum',
        poster: '/video/1/poster',
        duration: '4 mins',
        name: '3 sum',
        seq: 2
    },
    {
        id: 'container-with-most-water',
        poster: '/video/2/poster',
        duration: '2 mins',
        name: 'Container with most water',
        seq: 3
    },
];

import express from 'express';
import fs from 'fs';
import path  from 'path' ;
import  cors  from 'cors' ;
import thumbsupply  from 'thumbsupply' ;
import { ApolloServer } from '@apollo/server';
import typeDefs  from  './assets/type/typeDefs.js';
import resolvers  from  './assets/resolver/resolvers.js';
import bodyParser from 'body-parser';
import { startStandaloneServer } from  '@apollo/server/standalone';
import Stripe from 'stripe'
import multer from 'multer'
import mysql from "mysql";
import apiKey from './credentials/stripeApiKey.js'
import dbInfo from './credentials/db.js'

const connection = mysql.createConnection({
	host: dbInfo.host,
	user: dbInfo.user,
	password: dbInfo.password,
	database: dbInfo.database,
});

connection.connect((err) => {
	if (err) {
		return err;
	}
});

const server = new ApolloServer({ typeDefs, resolvers });
startStandaloneServer(server, {
  listen: { port: 4000 },
}).then(({ url }) => {
  console.log(`Express app listening on port ${url}`);
});


const app = express();
app.use(cors(), bodyParser.json());
app.use(express.json())
app.get('/videos', (req, res) => {
  res.json(videos)
});

// video upload
const storage = multer.diskStorage({
  destination: function (req, file, cb){
    cb(null, 'assets/')
  },
  filename: function (req, file, cb) {
    console.log(file.originalname)
    cb(null, file.originalname)
  }
})

const videoUpload = multer({
  storage: storage
})

// video upload
app.post('/upload-video', (req, httpRes) => {
  videoUpload.single('file')(req, httpRes, function(err) {
    if(err){
      // if the file upload fails, we throw an error
      httpRes.status(500).send(new Error(err))
    }else {
      const sql = 'insert into video (videoName, fileName, takeaways, duration, sequence) values ?'
      const values = [
        [req.body.name, req.body.fileName, req.body.takeaways, req.body.duration, req.body.sequence]
      ]
      connection.query(sql, [values], function (err, res) {
					if (err) {
						console.log(`Error while uploading video -- ERROR: ${err}`);
						httpRes.status(500).send(new Error(err))
					} else {
						console.log(`Succeeded on uploading video`);
						httpRes.send({
              result: 'success'
            })
					}
			})
    }
  })
})

// stripe

const stripe = new Stripe(apiKey)

app.post('/create-payment-intent', async (req, res) => { 
  const { amount } = req.body
  console.log(`amount: ${amount}`)
  const paymentIntent = await stripe.paymentIntents.create(
    {
      amount: amount,
      currency: 'usd',
      statement_descriptor_suffix: 'payment using stripe',
      automatic_payment_methods: {
        enabled: true
      }
    }
  )
  res.send({
    clientSecret: paymentIntent.client_secret
  })
}); 

app.get('/success', (req, res) => {
  res.send('Payment successful')
})

app.get('/cancel', (req, res) => {
  res.send('Payment cancel')
})

// video player

app.get('/video/:id/data', (req, res) => {
    const id = parseInt(req.params.id, 10);
    res.json(videos[id]);
});

app.get('/video/:id', (req, res) => {
    const path = `assets/${req.params.id}.mp4`;
    const stat = fs.statSync(path);
    const fileSize = stat.size;
    const range = req.headers.range;
    if (range) {
        const parts = range.replace(/bytes=/, "").split("-");
        const start = parseInt(parts[0], 10);
        const end = parts[1]
            ? parseInt(parts[1], 10)
            : fileSize-1;
        const chunksize = (end-start) + 1;
        const file = fs.createReadStream(path, {start, end});
        const head = {
            'Content-Range': `bytes ${start}-${end}/${fileSize}`,
            'Accept-Ranges': 'bytes',
            'Content-Length': chunksize,
            'Content-Type': 'video/mp4',
        };
        res.writeHead(206, head);
        file.pipe(res);
    } else {
        const head = {
            'Content-Length': fileSize,
            'Content-Type': 'video/mp4',
        };
        res.writeHead(200, head);
        fs.createReadStream(path).pipe(res);
    }
});

app.get('/video/:id/poster', (req, res) => {
    thumbsupply.generateThumbnail(`assets/${req.params.id}.mp4`)
    .then(thumb => res.sendFile(thumb));
});

app.get('/video', (req, res) => {
    res.sendFile('assets/2sum-youtube-edited.mp4', { root: __dirname });
});

app.get('/download-docx/:id', (req, res) => {
  const scriptId = req.params.id
  const __dirname = path.resolve()
  console.log(__dirname)
  const docPath = path.join(__dirname, `/assets/${scriptId}.docx`);
  res.download(docPath, `${scriptId}.docx`, function(err){
    if (err) {
      // if the file download fails, we throw an error
      res.status(500).send(new Error(err))
    }
  });
})



app.listen(4001, () => {
  console.log(`Express app listening on port ${4001}`)
})

