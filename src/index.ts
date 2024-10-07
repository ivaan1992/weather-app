import express, { Request, Response } from 'express';
import { getTickets } from './models/Ticket';


const app = express();
app.use(express.json());

const PORT = 3000;

app.get('/', (req: Request, res: Response) => {
    res.send('Hello World!!!!!!');
});

// Endpoint to tickets info
app.get('/tickets', getTickets);

// Iniciar la aplicación Express
app.listen(PORT, () => {
  console.log(`App listening at http://localhost:${PORT}`);
});
