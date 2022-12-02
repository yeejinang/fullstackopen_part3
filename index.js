const express = require('express')
const morgan = require('morgan');
const app = express()

let persons = [
	{ 
		"id": 1,
		"name": "Arto Hellas", 
		"number": "040-123456"
	  },
	  { 
		"id": 2,
		"name": "Ada Lovelace", 
		"number": "39-44-5323523"
	  },
	  { 
		"id": 3,
		"name": "Dan Abramov", 
		"number": "12-43-234345"
	  },
	  { 
		"id": 4,
		"name": "Mary Poppendieck", 
		"number": "39-23-6423122"
	  }
]

app.use(express.json())
// app.use(morgan('tiny'));
morgan.token('user-type', function(req, res) {
    return req.headers['user-type']
})
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'));

morgan.token('body', req => {
	return JSON.stringify(req.body)
  })

const generateId = () => {
	return (Math.floor(Math.random() * 10000))
}

app.post('/api/persons', (request, response) => {
	const body = request.body
	if (!body.name || !body.number) {
		// console.log("missing name or number")
		return response.status(400).json({
			error: 'name or number missing'
		})
	}
	if (persons.some(person => person.name === body.name))
	{
		// console.log("duplicate name")
		return response.status(400).json({
			error: 'name must be unique'
		})
	}

	const newPerson = {
		id: generateId(),
		name: body.name,
		number: body.number,
	}
	persons = persons.concat(newPerson)
	response.json(newPerson)
})

app.get('/', (request, response) => {
	response.send('<h1>hello world!</h1>')
})

app.get('/api/persons', (request, response) => {
	response.json(persons)
})

app.get('/api/persons/:id', (request, response) => {
	const id = Number(request.params.id)
	const person = persons.find(person => person.id === id)
	if (person) {
		response.json(person)
	}
	else {
		response.status(404).end()
	}
})

app.delete('/api/persons/:id', (request, response) => {
	const id = Number(request.params.id)
	persons = persons.filter(person => person.id !== id)
	response.status(204).end()
})

app.get('/info', (request, response) => {
	response.send(`
					<p>Phonebook has info for ${persons.length} people</p>
					<p>${new Date}</p>`)
	
})

const PORT = 3001
app.listen(PORT)
console.log(`Server running on port ${PORT}`)