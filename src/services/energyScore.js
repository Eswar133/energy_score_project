const { client } = require('../config/db');

async function getEnergyScoreData(date) {
    const db = client.db('energy_score_db');
    
    const pipeline = [
        {
            $lookup: {
                from: "Mood",
                localField: "_id",
                foreignField: "user",
                as: "mood_data"
            }
        },
        {
            $lookup: {
                from: "Activity",
                localField: "_id",
                foreignField: "user",
                as: "activity_data"
            }
        },
        {
            $lookup: {
                from: "Sleep",
                localField: "_id",
                foreignField: "user",
                as: "sleep_data"
            }
        },
        {
            $project: {
                user: "$_id",
                date: date,
                mood_score: { $arrayElemAt: ["$mood_data.value", 0] },
                activity: {
                    $map: {
                        input: "$activity_data",
                        as: "activity",
                        in: {
                            activity: "$$activity.Activity",
                            steps: "$$activity.Steps",
                            distance: "$$activity.Distance",
                            duration: "$$activity.Duration",
                            calories: "$$activity.Calories"
                        }
                    }
                },
                sleep: {
                    sleep_score: { $arrayElemAt: ["$sleep_data.sleep_score", 0] },
                    hours_of_sleep: { $arrayElemAt: ["$sleep_data.hours_of_sleep", 0] },
                    hours_in_bed: { $arrayElemAt: ["$sleep_data.hours_in_bed", 0] }
                }
            }
        }
    ];

    return await db.collection('User').aggregate(pipeline).toArray();
}

module.exports = { getEnergyScoreData };