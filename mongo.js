const mongoose = require('mongoose')

mongoose.set('strictQuery', true)

const generateId = () => {
  return (Math.floor(Math.random() * 10000))
}

if (process.argv.length < 3) {
  console.log('Please provide the password as an argument: node mongo.js <password>')
  process.exit(1)
}

const password = process.argv[2]

const url = `mongodb+srv://yeejin0406:${password}@cluster0.lxvgz9f.mongodb.net/phonebookApp?retryWrites=true&w=majority`

mongoose.connect(url)

const personSchema = new mongoose.Schema({
  id: Number,
  name: String,
  number: String,
})

const Person = mongoose.model('Person', personSchema)

if (process.argv.length === 3)
{
  console.log('phonebook:')
  Person.find({}).then(persons => {
    persons.forEach(person => {
      console.log(`${person.name} ${person.number}`)
    })
    mongoose.connection.close()
  })
}
else
{
  const person = new Person({
    id: generateId(),
    name: process.argv[3],
    number: process.argv[4],
  })

  person.save()
    .then(() => {
      console.log(`added ${process.argv[3]} ${process.argv[4]} to phonebook`)
      return mongoose.connection.close()
    })
    .catch((err) => console.log(err))
}

