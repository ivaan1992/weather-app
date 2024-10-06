import * as fs from 'fs';
import csv from 'csv-parser';
import { Request, Response } from 'express';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const baseURL = `http://api.weatherapi.com/v1/current.json?key=${process.env.API_KEY}&q=iata:`;
const airports = new Map();
const cacheExpirationTime = 3 * 60 * 60 * 1000;

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

  try {
    await new Promise<void>((resolve, reject) => {
      fs.createReadStream('data/challenge_dataset.csv')
        .pipe(csv())
        .on('data', async (row: Ticket) => {
          try {
            const ticketFormatted = await ticketAdapter(row);
            tickets.push(ticketFormatted);
          } catch (error) {
            reject(error);
          }
        })
        .on('end', () => {
          resolve();
        })
        .on('error', (error: any) => {
          console.error('Error al leer el archivo CSV:', error);
          reject(error);
        });
    });

    res.json(tickets);
  } catch (error) {
    console.error('Error al procesar los tickets:', error);
    res.status(500).send('Error al procesar los tickets');
  }
};

export async function ticketAdapter(ticket: Ticket) {
  const origin_weather = await airportsData(ticket.origin);
  const destination_weather = await airportsData(ticket.destination);

  return {
    ...ticket,
    origin_weather: origin_weather.current.temp_c,
    destination_weather: destination_weather.current.temp_c,
  };
}

export async function airportsData(airportCode: string) {
  try {
    const cachedData = airports.get(airportCode);
    const currentTime = Date.now();

    if (cachedData && currentTime - cachedData.timestamp < cacheExpirationTime) {
      return cachedData.data;
    }

    const response = await axios.get(baseURL + airportCode);

    airports.set(airportCode, {
      data: response.data,
      timestamp: currentTime
    });

    return response.data;
  } catch (err) {
    console.error(`Error fetching weather for ${airportCode}:`, err);
    return { current: { temp_c: 'N/A' } };
  }
}
