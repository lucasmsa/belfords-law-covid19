/* eslint-disable jsx-a11y/accessible-emoji */
import React, { useState, useEffect, useMemo } from 'react'
import { Container, GraphContainer, PlaceContainer , ButtonsContainer } from './styles'
import api from '../../services/api'
import belfordsLawNumbers from '../../utils/belfordsLawNumbers'
import getNumberOcurrences  from '../../utils/extractNumbeOcurrences'
import { Link } from 'react-router-dom'
import GoBackIcon from '../../assets/left-arrow.png'
import Button from '../../components/Button'
import Globe from '../../assets/geography.png'
import BrazilDataImg from '../../assets/brazil-data.png'

import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend
} from 'recharts';


interface RouteParams {
  match: {
    path: string
  }
}

interface Response {
  Countries?: CountriesData[]
  data?: BrazilStatesData[]
}

interface CountriesData {
  TotalDeaths?: number,
  TotalConfirmed?: number
}

interface BrazilStatesData {
  deaths?: number,
  cases?: number
}

interface DataPercentage {
  [key: string]: number;
}

interface DataGraphInterface {
  name: string;
  Belfords_law?: number;
  Covid_cases?: number;
  Covid_deaths?: number;
}


const Graph: React.FC = (props) => {

  const propsRoute = props as RouteParams
  const dataToSearch = propsRoute.match.path
  const place = dataToSearch.split('/')[2]

  const [responseData, setResponseData] = useState<Response>()
  const [selector, setSelector] = useState<'deaths' | 'cases'>('cases')

  useEffect(() => {
    async function loadDataWorld(): Promise<void> {
      await api.get('https://api.covid19api.com/summary').then((response) => {
        setResponseData(response.data)
      }) 
    }

    async function loadDataBrazil(): Promise<void> {
      await api.get('https://covid19-brazil-api.now.sh/api/report/v1').then((response) => {
        setResponseData(response.data)
      }) 
    }

    place === 'world' && loadDataWorld()
    place === 'brazil' && loadDataBrazil()
  }, [place])

  const totalCasesData = useMemo(() => {
    const totalCases: number[] = []
    
    if (place === 'world' && responseData?.Countries){
      responseData.Countries.forEach((country) => {
        country.TotalConfirmed &&
          totalCases.push(Number(country.TotalConfirmed.toString()[0]))
      })
    } else if (place === 'brazil' && responseData?.data) {
      responseData.data.forEach((state) => {
        state.cases &&
          totalCases.push(Number(state.cases.toString()[0]))
      })
    }

    const valueCasesPercentage: DataPercentage = getNumberOcurrences(totalCases)

    return valueCasesPercentage
  }, [responseData, place])


  const totalDeathsData = useMemo(() => {
    const totalDeaths: number[] = []

    if (place === 'world' && responseData?.Countries){
      responseData.Countries.forEach((country) => {
        country.TotalDeaths &&
          totalDeaths.push(Number(country.TotalDeaths.toString()[0]))
      })
    } else if (place === 'brazil' && responseData?.data) {
      responseData.data.forEach((state) => {
        state.deaths &&
          totalDeaths.push(Number(state.deaths.toString()[0]))
      })
    }

    const valueDeathsPercentage: DataPercentage = getNumberOcurrences(totalDeaths)

    return valueDeathsPercentage
  }, [responseData, place])


  const dataToGraph = useMemo(() => {
    const data: DataGraphInterface[] = [{ name: '' }]

    for (var number = 1; number < 10; number++){
      let number_str = number.toString()

      data.push({
        name: number_str,
        Belfords_law: belfordsLawNumbers[number_str],
        Covid_cases: totalCasesData[number_str],
        Covid_deaths: totalDeathsData[number_str]
      })
    }

    data.push({ name: '' })
    console.log(data)
    return data
  }, [totalCasesData, totalDeathsData])

  return (
    <Container>
      <Link to='/'>
          <img src={GoBackIcon} alt="Go Back button"/>
          <img src={place === 'world' ? Globe : BrazilDataImg} alt='place symbol'/>
      </Link>
      <PlaceContainer>
       
      </PlaceContainer>
        <GraphContainer>
        {dataToGraph && (
          
          <LineChart
            data={dataToGraph}
            width={500}
            height={350}
            style={{background: 'none'}}
            margin={{
              top: 5, right: 30, left: 20, bottom: 5,
            }}
          >

            <CartesianGrid stroke='#000' fill='#a5bbad'/>
            <XAxis dataKey="name"  stroke='#000'/>
            <YAxis stroke='#000' label={{ value: '1st digit ocurrences (%)', angle: -90, position: 'insideLeft', fontSize: '12'}}/>
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="Belfords_law" stroke='#893' strokeDasharray="6" strokeWidth='6px'/>
            <Line type="monotone" dataKey={selector === 'cases' ? "Covid_cases" : "Covid_deaths"} stroke="#5e2a41" strokeWidth='6px' />
          </LineChart>  
        
        )}
        </GraphContainer>
        <ButtonsContainer>
          <span onClick={() => setSelector('cases')}>
            <Button>Cases 🦠</Button>
          </span>
          <span onClick={() => setSelector('deaths')}>
            <Button>Deaths 💀</Button>
          </span>
        </ButtonsContainer>
    </Container>
  )
}

export default Graph