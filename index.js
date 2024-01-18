const express = require('express');
const cors = require('cors');
const app = express();
require('dotenv').config();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());




const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.xipfv.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        // await client.connect();
        const newsCollection = client.db('popular-news').collection('news');
        const userCollection = client.db('popular-news').collection('users');


        // user related api
        app.post('/users', async (req, res) => {
            const user = req.body;
            const result = await userCollection.insertOne(user);
            res.send(result)
        })



        // news related api

        app.get('/news', async (req, res) => {
            const filter = req.query;
            console.log(filter)
            let query = {}
            if (req.query.search) {
                query = { title: { $regex: filter.search, $options: 'i' } }
            }
            if (req.query.search) {
                query = { name: { $regex: filter.search, $options: 'i' } }
            }
            const cursor = newsCollection.find(query);
            const result = await cursor.toArray();
            res.send(result)
        })

        app.get('/news/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await newsCollection.findOne(query)
            res.send(result)
        })

        app.post('/news', async (req, res) => {
            const item = req.body;
            const result = await newsCollection.insertOne(item);
            res.send(result)
        })

        // Send a ping to confirm a successful connection
        // await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);



app.get('/', (req, res) => {
    res.send('server side is running bdjahid')
})


app.listen(port, () => {
    console.log(`server is running bdjahid on port: ${port}`)
})

