import mysql from "mysql";
import { v4 as uuidv4 } from 'uuid'
import nodemailer from 'nodemailer'
import dotenv from 'dotenv'
dotenv.config({path:process.cwd() + '/.env'})
console.log(`host: ${process.env.DB_HOST}`)
console.log(`user: ${process.env.DB_USER}`)
console.log(`pw: ${process.env.DB_PW}`)
console.log(`db: ${process.env.DB}`)

const connection = mysql.createConnection({
	host: process.env.DB_HOST,
	user: process.env.DB_USER,
	password: process.env.DB_PW,
	database: process.env.DB,
});

connection.connect((err) => {
	if (err) {
		return err;
	}
});

const resolvers =  {
	Query: {
		// should declare parent to get argument args.kind. 
		// don't know why tho
		feedbacks: (parent, args) => {
			console.log(`Query: feedbacks: ${JSON.stringify(args)}`)
			const id = args.id
			return new Promise((resolve, reject) => {
				connection.query(
					`select * from feedback limit 0, 100`, function (err, res) {
						if (err) {
							console.log(`Error while getting feedback -- ERROR: ${err}`);
							reject(err)
						} else {
							console.log(`Succeeded while getting feedback ${JSON.stringify(res)}`);
							resolve(JSON.parse(JSON.stringify(res)))
						}
					}
				);
			})
		},
    subscribes: () => {},
    verification: (parent, args) => {
      console.log(`Query: verification: ${JSON.stringify(args)}`)
      const email = args.email
      const token = args.token

      return new Promise((resolve, reject) => {
				connection.query(
					`select * from subscribe where email='${email}' and token='${token}'`, function (err, res) {
						if (err) {
							console.log(`Error while verifing -- ERROR: ${err}`);
							reject(err)
						} else if(res.length > 0) {
							console.log(`Succeeded while verifing ${JSON.stringify(res)}`);
							resolve({
                res: 'existed'
              })
						} else {
              console.log(`Succeeded while verifing but not existing user ${JSON.stringify(res)}`);
							resolve({
                res: 'not_existed'
              })
            }
					}
				);
			})
    },
    videos: (parent, args) => {
      console.log(`Query: videos`)
      return new Promise((resolve, reject) => {
				connection.query(
					`select * from video`, function (err, res) {
						if (err) {
							console.log(`Error while getting videos -- ERROR: ${err}`);
							reject(err)
						} else {
              console.log(`Succeeded while getting videos ${JSON.stringify(res)}`);
							resolve(JSON.parse(JSON.stringify(res)))
            }
					}
				);
			})
    }
	},
	Mutation: {
		createFeedback: (parent, args) => {
			console.log(`Mutation: createFeedback: ${JSON.stringify(args)}`)
      const email = args.email
			const videoId = args.videoId
			const rating = args.rating
			const comment = args.comment
			const sql = 'insert into feedback (email, videoId, rating, comment) values ?'
      const values = [
        [email, videoId, rating, comment]
      ]
			return new Promise((resolve, reject) => {
				connection.query(sql, [values], function (err, res) {
					if (err) {
						console.log(`Error while createFeedback -- ERROR: ${err}`);
						reject(err)
					} else {
						console.log(`Succeeded while createFeedback`);
						resolve({
              success: 'success'
            })
					}
				})
			})
		},
    startSubscribe: (parent, args) => {
      console.log(`Mutation: startSubscribe: ${JSON.stringify(args)}`)
			const email = args.email
			const sql = 'insert into subscribe (email, token) values ?'
      const uuid = uuidv4()
      const values = [
        [email, uuid]
      ]
			return new Promise((resolve, reject) => {
				connection.query(sql, [values], async function (err, res) {
					if (err) {
						console.log(`Error while startSubscribe -- ERROR: ${err}`);
						reject(err)
					} else {
            const mailMeta = {
              from: 'dhtprbs12@gmail.com',
              to: email,
              subject: 'Thank your subscribing. Here is your token to watch tutorials for free',
              html: `
              <b>Hey There!</b>
              <br>This is your token</br>
              <p>${uuid}</p>
              `
            }

            const transporter = nodemailer.createTransport({
              service: 'gmail',
              auth: {
                user: 'dhtprbs12@gmail.com',
                pass: 'fhmmnbuhtpnfonhn'
              }
            })
            transporter.sendMail(mailMeta, function(err, info){
              if(err){
                console.log(err)
                reject(err)
              }else{
                console.log(`Succeeded while startSubscribe`);
                resolve({
                  success: 'success'
                })
              }
            })
					}
				})
			})
    }, 
		createContact: (parent, args) => {
			console.log(`Mutation: createContact: ${JSON.stringify(args)}`)
      const name = args.name
			const email = args.email
			const message = args.message
			const sql = 'insert into contact (name, email, message) values ?'
      const values = [
        [name, email, message]
      ]
			return new Promise((resolve, reject) => {
				connection.query(sql, [values], function (err, res) {
					if (err) {
						console.log(`Error while createContact -- ERROR: ${err}`);
						reject(err)
					} else {
						console.log(`Succeeded while createContact`);
						resolve({
              success: 'success'
            })
					}
				})
			})
		}
	}
};

export default resolvers