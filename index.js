const express = require('express')
const morgan = require('morgan')
const app = express()
const cors = require('cors')
require('dotenv').config()
const Person = require('./models/person')

// mongoose.set('strictQuery', false);

// let persons = [
// 	{
// 		"id": 1,
// 		"name": "Arto Hellas",
// 		"number": "040-123456"
// 	  },
// 	  {
// 		"id": 2,
// 		"name": "Ada Lovelace",
// 		"number": "39-44-5323523"
// 	  },
// 	  {
// 		"id": 3,
// 		"name": "Dan Abramov",
// 		"number": "12-43-234345"
// 	  },
// 	  {
// 		"id": 4,
// 		"name": "Mary Poppendieck",
// 		"number": "39-23-6423122"
// 	  }
// ]

app.use(express.json())
app.use(express.static('build'))
morgan.token('user-type', function(req) {
  return req.headers['user-type']
})
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))
app.use(cors())

morgan.token('body', req => {
  return JSON.stringify(req.body)
})

app.post('/api/persons', (request, response, next) => {
  const body = request.body
  if (!body.name || !body.number) {
    return response.status(400).json({
      error: 'name or number missing'
    })
  }
  // const duplicate = Person.find({ name: body.name }).limit(1)
  // console.log(duplicate)
  // if (duplicate)
  // {
  // 	return response.status(400).json({
  // 		error: 'name must be unique'
  // 	})
  // }

  const newPerson = new Person({
    name: body.name,
    number: body.number,
  })

  newPerson.save()
    .then(savedPerson => {
      response.json(savedPerson)})
    .catch(error => next(error))
})

app.get('/', (request, response) => {
  response.send('<h1>hello world!</h1>')
})

app.get('/api/persons', (request, response) => {
  Person.find({}).then(persons => {
    response.json(persons)
  })
})

app.get('/api/persons/:id', (request, response, next) => {
  Person.findById(request.params.id)
    .then(person => {
      if (person) {
        response.json(person)}
      else {
        response.status(404).end}
    })
    .catch(error => { next(error) })
})

app.put('/api/persons/:id', (request, response, next) => {
  const body = request.body

  const person = {
    name: body.name,
    number: body.number,
  }
  Person.findByIdAndUpdate(request.params.id,
    person,
    { new: true, runValidators: true, context: 'query' })
    .then(updatedPerson => {
      response.json(updatedPerson)
    })
    .catch(error => { next(error) })
})

app.delete('/api/persons/:id', (request, response, next) => {
  Person.findByIdAndRemove(request.params.id)
    .then(() => {
      response.status(204).end
    })
    .catch(error => { next(error) })
})

app.get('/info', (request, response) => {
  response.send(`
					<p>Phonebook has info for ${Person.length} people</p>
					<p>${new Date}</p>`)
})

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

app.use(unknownEndpoint)

const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  }

  next(error)
}

app.use(errorHandler)

const port = process.env.PORT
console.log(port)
app.listen(port, () => {
  console.log(`Server running on port ${port}`)
})