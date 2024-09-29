import { useEffect, useState } from 'react'

import client from './personService'

const NameFilter = ({ filter, onFilterChange }) => (
  <div>
    filter shown with <input value={filter} onChange={onFilterChange} />
  </div>
)
const PersonForm = ({
  onSubmit,
  onNameChange,
  onNumberChange,
  name,
  number
}) => (
  <form onSubmit={onSubmit}>
    <div>
      name: <input onChange={onNameChange} value={name} />
    </div>
    <div>
      number: <input onChange={onNumberChange} value={number} />
    </div>
    <div>
      <button type="submit">add</button>
    </div>
  </form>
)
const PersonList = ({ onDelete, persons, filter }) => (
  <ul>
    {persons.map((person) =>
      person.name.toLowerCase().includes(filter.toLowerCase()) ? (
        <li key={person.id}>
          {person.name} {person.number}{' '}
          <button onClick={() => onDelete(person)}>delete</button>
        </li>
      ) : null
    )}
  </ul>
)

const App = () => {
  const [persons, setPersons] = useState([])
  const [newName, setNewName] = useState('')
  const [newNumber, setNewNumber] = useState('')
  const [filter, setFilter] = useState('')

  useEffect(() => {
    client.getAll().then((data) => {
      console.log(data)
      setPersons(data)
    })
  }, [])

  const onSubmit = (event) => {
    event.preventDefault()
    const existing = persons.find((person) => person.name === newName)
    if (existing) {
      if(window.confirm(`${newName} is already added to phonebook, replace the old number with a new one?`)) {
        const newValue = { ...existing, number: newNumber }
        client.update(existing.id, newValue).then((data) => {
          setPersons(persons.map((p) => (p.id !== existing.id ? p : data)))
        }).catch((error) => {
          alert(error)
        })
        .finally(() => {
          setNewName('')
          setNewNumber('')
        })
      }
      return
    }

    client
      .create({ name: newName, number: newNumber })
      .then((data) => {
        setPersons(persons.concat(data))
      })
      .catch((error) => {
        alert(error)
      })
      .finally(() => {
        setNewName('')
        setNewNumber('')
      })
  }
  const onDelete = (person) => {
    if (window.confirm(`Delete ${person.name}?`)) {
      client
        .deletePerson(person.id)
        .then(() => {
          setPersons(persons.filter((p) => p.id !== person.id))
        })
        .catch((error) => {
          alert(error)
        })
    }
  }

  const onNameChange = (event) => {
    setNewName(event.target.value)
  }
  const onNumberChange = (event) => {
    setNewNumber(event.target.value)
  }
  const onFilterChange = (event) => {
    setFilter(event.target.value)
  }

  return (
    <div>
      <h2>Phonebook</h2>
      <NameFilter filter={filter} onFilterChange={onFilterChange} />
      <h2>add a new</h2>
      <PersonForm
        onSubmit={onSubmit}
        onNameChange={onNameChange}
        onNumberChange={onNumberChange}
        name={newName}
        number={newNumber}
      />
      <h2>Numbers</h2>
      <PersonList persons={persons} filter={filter} onDelete={onDelete} />
    </div>
  )
}

export default App
