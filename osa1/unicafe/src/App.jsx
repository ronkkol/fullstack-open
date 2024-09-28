import { useState } from 'react'

const ControlPanel = ({ handleGood, handleNeutral, handleBad }) => {
  return (
    <div>
      <h1>give feedback</h1>
      <button onClick={handleGood}>good</button>
      <button onClick={handleNeutral}>neutral</button>
      <button onClick={handleBad}>bad</button>
    </div>
  )
}

const StatisticLine = ({ text, value }) => <tr><td>{text}</td><td>{value}</td></tr>

const Statistics = ({ good, neutral, bad }) => {
  const sum = good + neutral + bad
  const avg = (good - bad) / sum
  return (
    <div>
      <h1>statistics</h1>
      {sum > 0 ? 
        <table>
          <tbody>
            <StatisticLine text="good" value={good} />
            <StatisticLine text="neutral" value={neutral} />
            <StatisticLine text="bad" value={bad} />
            <StatisticLine text="all" value={sum} />
            <StatisticLine text="average" value={avg} />
            <StatisticLine text="positive" value={good * 100 / sum + " %"} />
          </tbody>
        </table>
      : <p>No feedback given</p>}
    </div>
  )
}

const App = () => {
  // tallenna napit omaan tilaansa
  const [good, setGood] = useState(0)
  const [neutral, setNeutral] = useState(0)
  const [bad, setBad] = useState(0)

  return (
    <div>
      <ControlPanel handleGood={() => setGood(good + 1)}
                    handleNeutral={() => setNeutral(neutral + 1)}
                    handleBad={() => setBad(bad + 1)} />
      <Statistics good={good} neutral={neutral} bad={bad} />
    </div>
  )
}

export default App