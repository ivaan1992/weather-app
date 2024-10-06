import { getTickets } from '../src/models/Ticket';
import { Response } from 'express';

describe('CSV and Weather API Integration Test', () => {
  it('should process the CSV and fetch real weather data for origin and destination', async () => {
    const mockReq = {};
    const mockRes = {
      json: jest.fn(),
    };

 
    await getTickets(mockReq as any, mockRes as unknown as Response);

    
    expect(mockRes.json).toHaveBeenCalled();
    const tickets = mockRes.json.mock.calls[0][0];

    expect(Array.isArray(tickets)).toBe(true);
    expect(tickets.length).toBeGreaterThan(0);


    tickets.forEach((ticket: any) => {
      expect(ticket.origin_weather).toBeDefined();
      expect(ticket.destination_weather).toBeDefined();
      expect(ticket.origin_weather).not.toBe('N/A');
      expect(ticket.destination_weather).not.toBe('N/A');
    });

  });
});
