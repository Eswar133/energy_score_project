
require('dotenv').config();


const { connectDB, client } = require('./src/config/db');
const { getEnergyScoreData } = require('./src/services/energyScore');
const fs = require('fs').promises;

async function main() {
    try {
        // Connect to database
        await connectDB();

        // Get energy score data for a specific date
        const date = new Date('2022-04-01');
        const energyScoreData = await getEnergyScoreData(date);

        // Write results to JSON file
        await fs.writeFile(
            './data/energy_score_results.json',
            JSON.stringify(energyScoreData, null, 2)
        );

        console.log('Data successfully processed and saved to JSON file');

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await client.close();
        console.log('Database connection closed');
    }
}

main().catch(console.error);