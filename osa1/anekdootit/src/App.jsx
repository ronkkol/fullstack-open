import { useState } from 'react'

const Button = ({ onClick, text }) => (
  <button onClick={onClick}>
    {text}
  </button>
)

const App = () => {
  const anecdotes = [
    'If it hurts, do it more often.',
    'Adding manpower to a late software project makes it later!',
    'The first 90 percent of the code accounts for the first 90 percent of the development time...The remaining 10 percent of the code accounts for the other 90 percent of the development time.',
    'Any fool can write code that a computer can understand. Good programmers write code that humans can understand.',
    'Premature optimization is the root of all evil.',
    'Debugging is twice as hard as writing the code in the first place. Therefore, if you write the code as cleverly as possible, you are, by definition, not smart enough to debug it.',
    'Programming without an extremely heavy use of console.log is same as if a doctor would refuse to use x-rays or blood tests when dianosing patients.',
    'The only way to go fast, is to go well.'
  ]
  const initalVotes = Array(anecdotes.length).fill(0)

  const handleRandomClick = () => {
    const random = Math.floor(Math.random() * anecdotes.length)
    setSelected(random)
  }

  const handleVoteClick = () => {
    const newVotes = [...votes]
    newVotes[selected] += 1
    setVotes(newVotes)
  }
   
  const [selected, setSelected] = useState(0)
  const [votes, setVotes] = useState(initalVotes)

  return (
    <>
    <div>
      {anecdotes[selected]}
      <br />
      has {votes[selected]} votes
      <Button onClick={handleVoteClick} text='vote' />
      <Button onClick={handleRandomClick} text='next anecdote' />
    </div>
    <div>
      <h2>Anecdote with most votes</h2>
      {anecdotes[votes.indexOf(Math.max(...votes))]}
      <br />
      has {Math.max(...votes)} votes
    </div>
    </>
  )
}

export default App