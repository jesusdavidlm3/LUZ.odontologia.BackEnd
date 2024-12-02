import express from 'express'
import cors from 'cors'
import { createServer } from 'http'
import jwt from 'jsonwebtoken'
import * as db from './dbConnection.js'
import * as tokenVerification from './tokenVerification.js'

const port = process.env.PORT
const secret = process.env.SECRET

const app = express()
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({extended: true}))



app.post('/api/loginForTeachOrStud', async (req, res) => {
	const {identification, passwordHash} = req.body
	let dbResponse
	try{
		dbResponse = await db.login(req.body)
		if(dbResponse.length == 0){
			res.status(404).send('Usuario no encontrado')
		}else if(dbResponse[0].passwordSHA256 != passwordHash){
			res.status(401).send('Contraseña Incorrecta')
		}else if(dbResponse[0].active == false){
			res.status(404).send('Este usuario se encuentra inactivo')
		}else if(dbResponse[0].type != 1 || dbResponse[0].type != 2){
			res.status(401).send('Usted no es un profesor o alumno')
		}else{
			const token = jwt.sign({
				id: dbResponse[0].id,
				name: dbResponse[0].name,
				type: dbResponse[0].type,
				exp: Date.now() + 600000
			}, secret)
			res.status(200).send({...dbResponse[0], jwt: token})
		}
	}catch(err){
		console.log(err)
		res.status(500).send('error del servidor')
	}
})

app.post('/api/loginAdminSys', async (req, res) => {
	const {identification, passwordHash} = req.body
	let dbResponse
	try{
		dbResponse = await db.login(req.body)
		if(dbResponse.length == 0){
			res.status(404).send('Usuario no encontrado')
		}else if(dbResponse[0].passwordSHA256 != passwordHash){
			res.status(401).send('Contraseña Incorrecta')
		}else if(dbResponse[0].active == false){
			res.status(404).send('Este usuario se encuentra inactivo')
		}else if(dbResponse[0].type != 0){
			res.status(401).send('Usted no es un administrador de sistemas')
		}else{
			const token = jwt.sign({
				id: dbResponse[0].id,
				name: dbResponse[0].name,
				type: dbResponse[0].type,
				exp: Date.now() + 600000
			}, secret)
			res.status(200).send({...dbResponse[0], jwt: token})
		}
	}catch(err){
		console.log(err)
		res.status(500).send('error del servidor')
	}
})

app.post('/api/loginStudyControl', async (req, res) => {
	const {identification, passwordHash} = req.body
	let dbResponse
	try{
		dbResponse = await db.login(req.body)
		if(dbResponse.length == 0){
			res.status(404).send('Usuario no encontrado')
		}else if(dbResponse[0].passwordSHA256 != passwordHash){
			res.status(401).send('Contraseña Incorrecta')
		}else if(dbResponse[0].active == false){
			res.status(404).send('Este usuario se encuentra inactivo')
		}else if(dbResponse[0].type != 3){
			res.status(401).send('Usted no es un trabajador de control de estudios')
		}else{
			const token = jwt.sign({
				id: dbResponse[0].id,
				name: dbResponse[0].name,
				type: dbResponse[0].type,
				exp: Date.now() + 600000
			}, secret)
			res.status(200).send({...dbResponse[0], jwt: token})
		}
	}catch(err){
		console.log(err)
		res.status(500).send('error del servidor')
	}
})

app.get('/api/getAllUsers', tokenVerification.forSysAdmins, async (req, res) => {
	let dbResponse = await db.getAllUsers()
	res.status(200).send(dbResponse)
})

app.get('/api/getDeactivatedUsers', tokenVerification.forSysAdmins, async (req, res) => {
	let dbResponse = await db.getDeactivatedUsers()
	res.status(200).send(dbResponse)
})

app.post('/api/createUser', tokenVerification.forSysAdmins, async (req, res) => {
	try{
		let dbResponse = await db.createUser(req.body)
		res.status(200).send(dbResponse)
	}catch(err){
		console.log(err)
		res.status(500).send('Error del servidor')
	}
})

app.delete('/api/deleteUser/:id', tokenVerification.forSysAdmins, async (req, res) => {
	try{
		let dbResponse = await db.deleteUser(req.params.id)
		res.status(200).send(dbResponse)
	}catch(err){
		console.log(err)
		res.status(500).send('error del servidor')
	}
})

app.patch('/api/reactivateUser', tokenVerification.forSysAdmins, async (req, res) => {
	console.log(req.body)
	try{
		let dbResponse = await db.reactivateUser(req.body)
		res.status(200).send(dbResponse)
	}catch(err){
		console.log(err)
		res.status(500).send('error del servidor')
	}
})

const server = createServer(app)
server.listen(port, () => {
	console.log('Su puerto es: 3000')
})	