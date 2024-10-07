import * as fs from 'fs';
import csv from 'csv-parser';
import { Request, Response } from 'express';
import axios from 'axios';
import dotenv from 'dotenv';
import readLine  from 'readline';

dotenv.config();

const baseURL = `http://api.weatherapi.com/v1/current.json?key=${process.env.API_KEY}&q=iata:`;
const airports = new Map();
const cacheExpirationTime = 3 * 60 * 60 * 1000;

export interface Ticket {
  origin: string;
  destination: string;
  airline: string;
  flight_num: string;
  origin_weather?: string;
  destination_weather?: string;
}

export const flightInterface = readLine.createInterface({
  input: process.stdin,
  output: process.stdout
});


export const getTickets = async (req: Request, res: Response) => {
  const tickets: Ticket[] = [];

  try {
    await new Promise<void>((resolve, reject) => {
      fs.createReadStream('data/challenge_dataset.csv')
        .pipe(csv())
        .on('data', async (row: Ticket) => {
          try {
            tickets.push(await ticketAdapter(row));
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

    getTicketByFlightNumber(tickets);
    res.json(tickets);
  } catch (error) {
    console.error('Error al procesar los tickets:', error);
    res.status(500).send('Error al procesar los tickets');
  }
};


export const getTicketByFlightNumber = (tickets: Ticket[]) => {
  return new Promise((resolve) => {

    flightInterface.question("Ingresa el numero de vuelo: ", async(flight_num:string) => {
      const ticketData = tickets.find(ticket => ticket.flight_num === flight_num);
      
      if (ticketData) {
        const ticketInfo = await ticketAdapter(ticketData);
        console.log(`Información del vuelo ${flight_num}:`);
        console.log(ticketInfo);
        resolve(ticketInfo)
      } else {
        console.log(`No se encontró ningún vuelo con el número ${flight_num}.`);
        resolve(undefined);
      }
  
      getTicketByFlightNumber(tickets);
    });
  });
};

export async function ticketAdapter(ticket: Ticket) {
  const origin_weather = await airportsData(ticket.origin);
  const destination_weather = await airportsData(ticket.destination);

  return {
    ...ticket,
    origin_weather: origin_weather.current.temp_c + '°C',
    destination_weather: destination_weather.current.temp_c + '°C',
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
