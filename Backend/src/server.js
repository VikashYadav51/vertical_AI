import app from './app.js';
import connectDB from './database/database.js';

import dotenv from 'dotenv';
dotenv.config({});

connectDB()
.then(() => {
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
})
.catch((err) => {
    console.log("Error connecting to database", err);
});

