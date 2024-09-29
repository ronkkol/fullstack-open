import { useState, useEffect } from 'react'

const baseUri = 'https://studies.cs.helsinki.fi/restcountries/api/'
const apiKey = import.meta.env.VITE_WEATHER_KEY

const Weather = ({ data }) => {
  return (
    <>
      <h2>Weather in {data.name}</h2>
      <div>
        <strong>temperature:</strong> {(data.main.temp - 273.15).toFixed(2)} Celsius
      </div>
      <img src={`http://openweathermap.org/img/w/${data.weather[0].icon}.png`} alt={data.weather[0].description} />
      <div>
        <strong>wind:</strong> {data.wind.speed} m/s
      </div>
    </>
  )
}

const CountryDetails = ({ country }) => {
  const [weather, setWeather] = useState(null)

  useEffect(() => {
    fetch(
      `https://api.openweathermap.org/geo/1.0/direct?q=${country.capital[0]}&limit=1&appid=${apiKey}`
    )
      .then(async (response) => {
        const data = await response.json()
        const { lat, lon } = data[0]
        return fetch(
          `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}`
        )
      })
      .then(async (response) => {
        const data = await response.json()
        console.log(data)
        setWeather(data)
      })
  }, [country])

  if (!weather) {
    return <div>Loading weather...</div>
  }

  return (
    <>
      <h1>{country.name.common}</h1>
      <div>capital {country.capital[0]}</div>
      <div>area {country.area}</div>
      <h2>languages</h2>
      <ul>
        {Object.entries(country.languages).map(([key, value]) => (
          <li key={key}>{value}</li>
        ))}
      </ul>
      <img src={country.flags.png} alt={country.name.common} width="100" />
      {weather && <Weather data={weather} />}
    </>
  )
}

function App() {
  const [countries, setCountries] = useState(null)
  const [selectedCountries, setSelectedCountries] = useState([])
  const [search, setSearch] = useState(null)

  const onChange = (event) => {
    setSearch(event.target.value)
  }

  useEffect(() => {
    if (!countries) {
      fetch(baseUri + 'all')
        .then((response) => response.json())
        .then((data) => setCountries(data))
    }

    if (search) {
      const filteredCountries = countries.filter(
        (country) =>
          country.name.common.toLowerCase().includes(search.toLowerCase()) ||
          country.name.official.toLowerCase().includes(search.toLowerCase())
      )

      setSelectedCountries(filteredCountries)
    }
  }, [search, countries])

  if (!countries) {
    return <div>Loading...</div>
  }

  return (
    <>
      find countries <input onChange={onChange} />
      <br />
      {selectedCountries.length > 10 ? (
        <div>Too many matches, specify another filter</div>
      ) : selectedCountries.length === 1 ? (
        <CountryDetails country={selectedCountries[0]} />
      ) : (
        selectedCountries.map((country) => (
          <div key={country.name.common}>
            {country.name.common}{' '}
            <button onClick={() => setSelectedCountries([country])}>
              show
            </button>
          </div>
        ))
      )}
    </>
  )
}

export default App
