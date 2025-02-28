const request = require('supertest');
const { app, server } = require('../app');
const fs = require('fs');

jest.mock('fs');
jest.mock('ssh2-sftp-client');

afterAll((done) => {
    server.close(done);
});

afterEach((done) => {
    server.close(done);
});

describe('GET /', () => {
    it('should return correct title on main page', async () => {
        const res = await request(app).get('/');
        console.log(res.text);
        expect(res.statusCode).toEqual(200);
        expect(res.text).toContain('Control B-Heaters');
    });
});

// describe('POST /execute', () => {
//     it('should execute a valid command on a remote host', async () => {
//         const mockExecCommand = jest.fn().mockResolvedValue({ code: 0, stdout: 'success', stderr: '' });
//         require('ssh2-sftp-client').mockImplementation(() => ({ connect: jest.fn(), execCommand: mockExecCommand, end: jest.fn() }));

//         const res = await request(app).post('/execute').send({ host: '127.0.0.1', command: 'start' });
//         expect(res.statusCode).toEqual(200);
//         expect(res.body).toEqual(expect.objectContaining({ host: '127.0.0.1', command: '/etc/init.d/bosminer start', exit_code: 0, output: 'success', error: '' }));
//     });

//     it('should return error for invalid command', async () => {
//         const res = await request(app).post('/execute').send({ host: '127.0.0.1', command: 'invalid' });
//         expect(res.statusCode).toEqual(400);
//         expect(res.body).toEqual({ error: 'Invalid command. Available commands: start, stop' });
//     });
// });

// describe('GET /commands', () => {
//     it('should list available named commands', async () => {
//         const res = await request(app).get('/commands');
//         expect(res.statusCode).toEqual(200);
//         expect(res.body).toEqual({ available_commands: { start: '/etc/init.d/bosminer start', stop: '/etc/init.d/bosminer stop' } });
//     });
// });

// describe('GET /heaters', () => {
//     it('should list available heaters', async () => {
//         const mockHeaters = [{ heaterName: 'Heater1', ipAddress: '192.168.1.1', type: 'default' }];
//         fs.readFileSync.mockReturnValue(JSON.stringify(mockHeaters));

//         const res = await request(app).get('/heaters');
//         expect(res.statusCode).toEqual(200);
//         expect(res.body).toEqual(mockHeaters);
//     });

//     it('should return error if heaters data cannot be read', async () => {
//         fs.readFileSync.mockImplementation(() => { throw new Error('Error reading file'); });

//         const res = await request(app).get('/heaters');
//         expect(res.statusCode).toEqual(500);
//         expect(res.body).toEqual({ error: 'Error reading heaters data' });
//     });
// });

// describe('POST /set_heater', () => {
//     it('should set heater configuration', async () => {
//         const mockHeaters = [{ heaterName: 'Heater1', ipAddress: '192.168.1.1', type: 'default' }];
//         fs.readFileSync.mockReturnValue(JSON.stringify(mockHeaters));
//         const mockPut = jest.fn().mockResolvedValue();
//         require('ssh2-sftp-client').mockImplementation(() => ({ connect: jest.fn(), put: mockPut, end: jest.fn() }));

//         const res = await request(app).post('/set_heater').send({ heaterName: 'Heater1', action: 'low' });
//         expect(res.statusCode).toEqual(200);
//         expect(res.body).toEqual({ message: "Heater 'Heater1' configuration updated to 'low' mode for type 'default'" });
//     });

//     it('should return error for invalid action', async () => {
//         const res = await request(app).post('/set_heater').send({ heaterName: 'Heater1', action: 'invalid' });
//         expect(res.statusCode).toEqual(400);
//         expect(res.body).toEqual({ error: "Invalid action. Valid actions are 'low', 'medium', 'high'" });
//     });

//     it('should return error if heater not found', async () => {
//         const mockHeaters = [{ heaterName: 'Heater2', ipAddress: '192.168.1.2', type: 'default' }];
//         fs.readFileSync.mockReturnValue(JSON.stringify(mockHeaters));

//         const res = await request(app).post('/set_heater').send({ heaterName: 'Heater1', action: 'low' });
//         expect(res.statusCode).toEqual(404);
//         expect(res.body).toEqual({ error: "Heater 'Heater1' not found" });
//     });
// });
