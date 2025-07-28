import { app } from "./app.js";
import 'dotenv/config';
import connectDB from "./db/index.js";

const port = process.env.PORT;

connectDB()
    .then(() => {
        app.listen(port, () => {
            console.log(`server is running on port ${port}`);
        });
    })
    .catch((err) => {
        console.log(`MogoDB connection error: ${err}`);
        
    })

