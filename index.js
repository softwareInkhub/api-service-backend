import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import clientRoutes from './routes/clientRoutes.js';
import openApiRoutes from './routes/openApiRoutes.js';
import schemaRoutes from './routes/schemaRoutes.js';
import dataRoutes from './routes/dataRoutes.js';

dotenv.config();

const app = express()
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.send({ some: 'json' });
});

// Client routes
app.use('/api/clients', clientRoutes);
app.use('/api/openApi', openApiRoutes);
app.use('/api', schemaRoutes);
app.use('/api', dataRoutes);

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
