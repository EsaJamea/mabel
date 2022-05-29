
//production, devlopment
const NODE_ENV = process.env.NODE_ENV || "devlopment";

// if(NODE_ENV === "devlopment"){
//     //devlopment config
// }

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/mabel_db";

const PORT = process.env.PORT || 3000;

const SESSION_SECRET = process.env.SESSION_SECRET || "some-secret";

module.exports = {
    NODE_ENV,
    MONGO_URI,
    PORT,
    SESSION_SECRET
}