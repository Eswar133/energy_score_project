const csv = require('csv-parser');
const fs = require('fs');
const path = require('path');
const { connectDB, client } = require('../config/db');
const { ObjectId } = require('mongodb');

async function importData() {
    try {
        await connectDB();
        const db = client.db('energy_score_db');

        // Create users first
        const users = ['A', 'B'].map(userId => ({
            _id: new ObjectId(),
            name: `User ${userId}`,
            timezone: "America/Los_Angeles",
            version: 70,
            app: "Wysa",
            country: "US",
            createdAt: new Date(),
            updatedAt: new Date()
        }));

        // Store user mapping for reference
        const userMap = new Map(users.map(user => [user.name.split(' ')[1], user._id]));

        // Insert users
        await db.collection('User').insertMany(users);
        console.log('Users created');

        // Import activity data
        const activities = [];
        await new Promise((resolve, reject) => {
            fs.createReadStream(path.join(__dirname, '../../data/activity_data.csv'))
                .pipe(csv())
                .on('data', (data) => {
                    activities.push({
                        user: userMap.get(data.User),
                        date: new Date(data.Date),
                        startTime: data.StartTime,
                        endTime: data.EndTime,
                        duration: data.Duration,
                        activity: data.Activity,
                        logType: data.LogType,
                        steps: parseInt(data.Steps) || 0,
                        distance: parseFloat(data.Distance) || 0,
                        elevationGain: parseFloat(data.ElevationGain) || 0,
                        calories: parseInt(data.Calories) || 0
                    });
                })
                .on('end', resolve)
                .on('error', reject);
        });

        if (activities.length > 0) {
            await db.collection('Activity').insertMany(activities);
            console.log('Activity data imported');
        }

        // Import sleep data
        const sleep = [];
        await new Promise((resolve, reject) => {
            fs.createReadStream(path.join(__dirname, '../../data/sleep_data.csv'))
                .pipe(csv())
                .on('data', (data) => {
                    const [startTime, endTime] = data['DURATION IN BED'].split(' - ');
                    sleep.push({
                        user: userMap.get(data.USER),
                        date: new Date(data.DATE),
                        sleep_score: parseInt(data['SLEEP SCORE']) || 0,
                        hours_of_sleep: data['HOURS OF SLEEP'],
                        rem_sleep: parseFloat(data['REM SLEEP']) || 0,
                        deep_sleep: parseFloat(data['DEEP SLEEP']) || 0,
                        heart_rate_below_resting: parseFloat(data['HEART RATE BELOW RESTING']) || 0,
                        duration_in_bed: `${startTime} - ${endTime}`,
                        hours_in_bed: data['HOURS IN BED']
                    });
                })
                .on('end', resolve)
                .on('error', reject);
        });

        if (sleep.length > 0) {
            await db.collection('Sleep').insertMany(sleep);
            console.log('Sleep data imported');
        }

        // Create sample mood data
        const moodData = [];
        for (const [userId, userObjectId] of userMap) {
            moodData.push({
                field: "mood_score",
                user: userObjectId,
                value: Math.floor(Math.random() * 5) + 5, // Random score between 5-10
                createdAt: new Date(),
                updatedAt: new Date()
            });
        }

        await db.collection('Mood').insertMany(moodData);
        console.log('Mood data created');

    } catch (error) {
        console.error('Error importing data:', error);
    } finally {
        await client.close();
        console.log('Database connection closed');
    }
}

importData().catch(console.error);