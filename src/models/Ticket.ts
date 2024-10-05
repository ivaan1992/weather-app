import * as fs from 'fs';
import csv from 'csv-parser';
import { Request, Response } from 'express';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config()

const baseURL = `http://api.weatherapi.com/v1/current.json?key=${process.env.API_KEY}&q=iata:`;
const airports = new Map();

interface Ticket {
    origin: string;
    destination: string;
    airline: string;
    flight_num: string;
    origin_weather?: string;
    destination_weather?: string;
}

export const getTickets = async (req: Request, res: Response) => {
    const tickets: Ticket[] = [];
 
    fs.createReadStream('data/challenge_dataset.csv')
      .pipe(csv())
      .on('data', async (row: Ticket) => {
        const ticketFormatted = await ticketAdapter(row);
        tickets.push(ticketFormatted);
      })
      .on('end', () => {
        res.json(tickets);
      })
      .on('error', (error: any) => {
        console.error('Error al leer el archivo CSV:', error);
        res.status(500).send('Error al proacesar el archivo CSV');
      });
  }

async function ticketAdapter(ticket: Ticket) {

 const origin_weather = await airportsData(ticket.origin);
 const destination_weather = await airportsData(ticket.destination);

  return {
    ...ticket,
    origin_weather: origin_weather.current.temp_c,
    destination_weather: destination_weather.current.temp_c,
  }
}


async function airportsData(airportCode: string) {
  try {
    if(!airports.get(airportCode)) {
      const response = await axios.get(baseURL + airportCode)
      airports.set(airportCode, response.data)
    }
     return airports.get(airportCode);
  } catch(err) {
    console.error(err);
    return {};
  }

}


