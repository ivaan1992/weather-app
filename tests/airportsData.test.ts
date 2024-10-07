import { 
    ticketAdapter, 
    Ticket
} from '../src/models/Ticket';

import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';

const mock = new MockAdapter(axios);

describe('testing ticketAdapter function', () => {
    const ticket: Ticket = {
        flight_num: '123',
        origin: 'MEX',
        destination: 'LAX',
        airline: '40'
    };

    test('Should display airport code without making API calls', async() => {
        const mockResponse = {
            flight_num: '123',
            origin: 'MEX',
            destination: 'LAX',
            airline: '40'
        };
        mock.onGet(`https://api.example.com/airports/${ticket.origin}`).reply(200, mockResponse);
        const airportInfo = await ticketAdapter(ticket);

        expect(airportInfo.origin).toEqual('MEX');
    });
});
