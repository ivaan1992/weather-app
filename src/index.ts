import express, { Request, Response } from 'express';
import * as fs from 'fs';
import csv from 'csv-parser';

const app = express();
app.use(express.json());

const PORT = 3000;

interface Ticket {
  origin: string;
  destination: string;
  airline: string;
  flight_num: string;
}

app.get('/', (req: Request, res: Response) => {
    res.send('Hello World!!!!!!');
});

// Endpoint to tickets info
app.get('/tickets', (req: Request, res: Response) => {
  const tickets: Ticket[] = [];

  fs.createReadStream('data/challenge_dataset.csv')
    .pipe(csv())
    .on('data', (row: Ticket) => {
      tickets.push(row);
    })
    .on('end', () => {
      res.json(tickets);
    })
    .on('error', (error: any) => {
      console.error('Error al leer el archivo CSV:', error);
      res.status(500).send('Error al procesar el archivo CSV');
    });
});

// Iniciar la aplicación Express
app.listen(PORT, () => {
  console.log(`App listening at http://localhost:${PORT}`);
});
