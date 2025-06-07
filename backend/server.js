import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { createPool } from 'mysql2/promise';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// Load environment variables
dotenv.config();

const app = express();
const server = http.createServer(app);

// Configure CORS with environment variable
const corsOrigin = process.env.CORS_ORIGIN || 'http://10.10.1.25';

// Configure CORS
app.use(cors({
  origin: corsOrigin,
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cache-Control', 'Accept'],
  credentials: true,
  optionsSuccessStatus: 204
}));

// Parse JSON bodies
app.use(express.json());

// Configure Socket.IO with CORS
const io = new Server(server, {
  cors: {
    origin: corsOrigin,
    methods: ['GET', 'POST'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization', 'Cache-Control', 'Accept']
  },
  transports: ['websocket', 'polling'],
  pingTimeout: 60000,
  pingInterval: 25000,
  allowEIO3: true,
  maxHttpBufferSize: 1e8
});

// Create MySQL connection pool with retry mechanism
const createPoolWithRetry = async (retries = 5, delay = 5000) => {
  for (let i = 0; i < retries; i++) {
    try {
      const pool = createPool({
        host: process.env.MYSQL_HOST || '10.10.11.27',
        user: process.env.MYSQL_USER || 'root',
        password: process.env.MYSQL_PASSWORD || 'bismillah123',
        database: process.env.MYSQL_DATABASE || 'suhu',
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,
        enableKeepAlive: true,
        keepAliveInitialDelay: 0,
        timezone: '+07:00',
        dateStrings: true
      });

      const connection = await pool.getConnection();
      connection.release();
      console.log('Database connection successful');
      return pool;
    } catch (error) {
      console.error(`Database connection attempt ${i + 1} failed:`, error.message);
      if (i < retries - 1) {
        console.log(`Retrying in ${delay/1000} seconds...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  throw new Error('Failed to connect to database after multiple attempts');
};

// Create a separate pool for access logs
const createAccessLogsPool = async () => {
  return createPool({
    host: '10.10.11.27',
    user: 'root',
    password: 'bismillah123',
    database: 'rfid_access_control',
    waitForConnections: true,
    connectionLimit: 5,
    queueLimit: 0,
    timezone: '+07:00',
    dateStrings: true
  });
};

let pool;
let accessLogsPool;

Promise.all([createPoolWithRetry(), createAccessLogsPool()])
  .then(([mainPool, logsPool]) => {
    pool = mainPool;
    accessLogsPool = logsPool;
    console.log('All database connections established successfully');
  })
  .catch(error => {
    console.error('Fatal database connection error:', error);
    process.exit(1);
  });

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};

// Check database connection
async function checkDatabaseConnection() {
  try {
    const connection = await pool.getConnection();
    console.log('Database connection successful');
    connection.release();
    return true;
  } catch (error) {
    console.error('Database connection failed:', error.message);
    return false;
  }
}

const fetchHistoricalData = async (timeRange) => {
  try {
    const now = new Date();
    let startDate = new Date(now);
    
    switch(timeRange) {
      case '7d':
        startDate.setDate(now.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(now.getDate() - 30);
        break;
      default: // 24h
        startDate.setDate(now.getDate() - 1);
    }
    
    const startDateStr = startDate.toISOString().slice(0, 19).replace('T', ' ');
    
    // Fetch temperature data
    const [nocTemp] = await pool.query(`
      SELECT waktu as timestamp, suhu as value
      FROM sensor_data
      WHERE waktu >= ?
      ORDER BY waktu ASC
    `, [startDateStr]);

    const [upsTemp] = await pool.query(`
      SELECT waktu as timestamp, suhu as value
      FROM sensor_data1
      WHERE waktu >= ?
      ORDER BY waktu ASC
    `, [startDateStr]);

    const [datacenterTemp] = await pool.query(`
      SELECT waktu as timestamp, suhu as value
      FROM sensor_data2
      WHERE waktu >= ?
      ORDER BY waktu ASC
    `, [startDateStr]);

    // Fetch humidity data
    const [nocHum] = await pool.query(`
      SELECT waktu as timestamp, kelembapan as value
      FROM sensor_data
      WHERE waktu >= ?
      ORDER BY waktu ASC
    `, [startDateStr]);

    const [upsHum] = await pool.query(`
      SELECT waktu as timestamp, kelembapan as value
      FROM sensor_data1
      WHERE waktu >= ?
      ORDER BY waktu ASC
    `, [startDateStr]);

    const [datacenterHum] = await pool.query(`
      SELECT waktu as timestamp, kelembapan as value
      FROM sensor_data2
      WHERE waktu >= ?
      ORDER BY waktu ASC
    `, [startDateStr]);

    // Fetch electrical data
    const [electrical] = await pool.query(`
      SELECT 
        waktu as timestamp,
        phase_r,
        phase_s,
        phase_t
      FROM listrik_noc
      WHERE waktu >= ?
      ORDER BY waktu ASC
    `, [startDateStr]);

    return {
      temperature: {
        noc: nocTemp,
        ups: upsTemp,
        datacenter: datacenterTemp
      },
      humidity: {
        noc: nocHum,
        ups: upsHum,
        datacenter: datacenterHum
      },
      electrical
    };
  } catch (error) {
    console.error('Error fetching historical data:', error);
    throw error;
  }
};

// API routes
app.get('/', (req, res) => {
  res.send('NOC Monitoring Backend is running');
});

app.get('/api/health', async (req, res) => {
  const dbConnected = await checkDatabaseConnection();
  res.json({
    status: 'ok',
    database: dbConnected ? 'connected' : 'disconnected'
  });
});

// Login endpoint
app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const [users] = await pool.query('SELECT * FROM users WHERE username = ?', [username]);

    if (users.length === 0) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    const user = users[0];
    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, {
      expiresIn: '24h'
    });

    res.json({ token });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Export data endpoints with authentication
app.get('/api/export/:type', authenticateToken, async (req, res) => {
  const { type } = req.params;
  const { timeRange = '24h' } = req.query;
  
  try {
    let data;
    let filename;
    let headers;
    
    // Calculate time range
    const now = new Date();
    let startDate = new Date(now);
    switch(timeRange) {
      case '7d':
        startDate.setDate(now.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(now.getDate() - 30);
        break;
      default: // 24h
        startDate.setDate(now.getDate() - 1);
    }
    
    const startDateStr = startDate.toISOString().slice(0, 19).replace('T', ' ');
    
    switch(type) {
      case 'temperature':
        [data] = await pool.query(`
          SELECT 
            waktu as timestamp,
            suhu as noc_temperature,
            (SELECT suhu FROM sensor_data1 s2 WHERE s2.waktu <= s1.waktu ORDER BY waktu DESC LIMIT 1) as ups_temperature,
            (SELECT suhu FROM sensor_data2 s3 WHERE s3.waktu <= s1.waktu ORDER BY waktu DESC LIMIT 1) as datacenter_temperature
          FROM sensor_data s1
          WHERE waktu >= ?
          ORDER BY waktu ASC
        `, [startDateStr]);
        
        headers = 'Timestamp,NOC Temperature (°C),UPS Temperature (°C),Data Center Temperature (°C)\n';
        filename = 'temperature_data';
        break;
        
      case 'humidity':
        [data] = await pool.query(`
          SELECT 
            waktu as timestamp,
            kelembapan as noc_humidity,
            (SELECT kelembapan FROM sensor_data1 s2 WHERE s2.waktu <= s1.waktu ORDER BY waktu DESC LIMIT 1) as ups_humidity,
            (SELECT kelembapan FROM sensor_data2 s3 WHERE s3.waktu <= s1.waktu ORDER BY waktu DESC LIMIT 1) as datacenter_humidity
          FROM sensor_data s1
          WHERE waktu >= ?
          ORDER BY waktu ASC
        `, [startDateStr]);
        
        headers = 'Timestamp,NOC Humidity (%),UPS Humidity (%),Data Center Humidity (%)\n';
        filename = 'humidity_data';
        break;
        
      case 'electrical':
        [data] = await pool.query(`
          SELECT 
            waktu as timestamp,
            phase_r,
            phase_s,
            phase_t,
            power_3ph,
            frequency_3ph,
            pf_3ph
          FROM listrik_noc
          WHERE waktu >= ?
          ORDER BY waktu ASC
        `, [startDateStr]);
        
        headers = 'Timestamp,Phase R (V),Phase S (V),Phase T (V),Power (kW),Frequency (Hz),Power Factor\n';
        filename = 'electrical_data';
        break;
        
      default:
        throw new Error('Invalid export type');
    }
    
    // Convert data to CSV
    const csvRows = data.map(row => {
      const values = Object.values(row);
      return values.map(val => typeof val === 'string' ? `"${val}"` : val).join(',');
    });
    
    const csv = headers + csvRows.join('\n');
    
    // Set response headers
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=${filename}_${timeRange}_${new Date().toISOString().slice(0,10)}.csv`);
    
    // Send CSV
    res.send(csv);
    
  } catch (error) {
    console.error('Export error:', error);
    res.status(500).json({ error: 'Failed to export data' });
  }
});

// Access logs endpoint with error handling and retries
app.get('/api/access-logs', authenticateToken, async (req, res) => {
  let retries = 3;
  while (retries > 0) {
    try {
      const [rows] = await accessLogsPool.query(`
        SELECT 
          al.access_time,
          al.access_granted,
          u.username,
          d.door_name
        FROM access_logs al
        LEFT JOIN users u ON al.user_id = u.user_id
        LEFT JOIN doors d ON al.door_id = d.door_id
        ORDER BY al.access_time DESC 
        LIMIT 5
      `);
      return res.json(rows);
    } catch (error) {
      console.error(`Error fetching access logs (attempt ${4 - retries}):`, error);
      retries--;
      if (retries === 0) {
        return res.status(500).json({ 
          error: 'Failed to fetch access logs',
          details: error.message 
        });
      }
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
});

// Fetch and emit data every 5 seconds
async function fetchAndEmitData() {
  try {
    // Fetch NOC temperature and humidity data
    const [nocData] = await pool.query('SELECT * FROM sensor_data ORDER BY id DESC LIMIT 1');
    if (nocData.length > 0) {
      io.emit('noc_temperature', { 
        suhu: parseFloat(nocData[0].suhu),
        kelembapan: parseFloat(nocData[0].kelembapan),
        waktu: nocData[0].waktu
      });
      
      io.emit('noc_humidity', { 
        suhu: parseFloat(nocData[0].suhu),
        kelembapan: parseFloat(nocData[0].kelembapan),
        waktu: nocData[0].waktu
      });
    }

    // Fetch UPS temperature and humidity data
    const [upsData] = await pool.query('SELECT * FROM sensor_data1 ORDER BY id DESC LIMIT 1');
    if (upsData.length > 0) {
      io.emit('ups_temperature', { 
        suhu: parseFloat(upsData[0].suhu),
        kelembapan: parseFloat(upsData[0].kelembapan),
        waktu: upsData[0].waktu
      });
      
      io.emit('ups_humidity', { 
        suhu: parseFloat(upsData[0].suhu),
        kelembapan: parseFloat(upsData[0].kelembapan),
        waktu: upsData[0].waktu
      });
    }

    // Fetch Data Center temperature and humidity data from sensor_data2
    const [datacenterData] = await pool.query('SELECT * FROM sensor_data2 ORDER BY id DESC LIMIT 1');
    if (datacenterData.length > 0) {
      io.emit('datacenter_temperature', { 
        suhu: parseFloat(datacenterData[0].suhu),
        kelembapan: parseFloat(datacenterData[0].kelembapan),
        waktu: datacenterData[0].waktu
      });
      
      io.emit('datacenter_humidity', { 
        suhu: parseFloat(datacenterData[0].suhu),
        kelembapan: parseFloat(datacenterData[0].kelembapan),
        waktu: datacenterData[0].waktu
      });
    }

    // Fetch electrical data
    const [electricalData] = await pool.query('SELECT * FROM listrik_noc ORDER BY id DESC LIMIT 1');
    if (electricalData.length > 0) {
      io.emit('electrical_data', electricalData[0]);
    }

    // Fetch fire and smoke detection data
    const [fireSmokeData] = await pool.query('SELECT * FROM api_asap_data ORDER BY id DESC LIMIT 1');
    if (fireSmokeData.length > 0) {
      io.emit('fire_smoke_data', fireSmokeData[0]);
    }

    // Fetch access logs from rfid_access_control database with user and door info
    const [accessLogs] = await accessLogsPool.query(`
      SELECT 
        al.access_time,
        al.access_granted,
        u.username,
        d.door_name
      FROM access_logs al
      LEFT JOIN users u ON al.user_id = u.user_id
      LEFT JOIN doors d ON al.door_id = d.door_id
      ORDER BY al.access_time DESC 
      LIMIT 5
    `);
    if (accessLogs.length > 0) {
      io.emit('access_logs', accessLogs);
    }

  } catch (error) {
    console.error('Error fetching or emitting data:', error);
  }
}

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('Client connected');
  
  socket.on('disconnect', (reason) => {
    console.log('Client disconnected:', reason);
  });

  socket.on('error', (error) => {
    console.error('Socket error:', error);
  });

  socket.on('request_historical_data', async ({ timeRange }) => {
    try {
      const historicalData = await fetchHistoricalData(timeRange);
      socket.emit('historical_data_update', historicalData);
    } catch (error) {
      console.error('Error sending historical data:', error);
    }
  });
});

// Start data emission interval
setInterval(fetchAndEmitData, 5000);

// Start server
const PORT = process.env.PORT || 3000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
  checkDatabaseConnection();
});