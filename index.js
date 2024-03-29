const express = require('express');
const cors = require('cors');
const app = express();
require('dotenv').config();
const jwt = require('jsonwebtoken');
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


        // jwt api 
        app.post('/jwt', async (req, res) => {
            const user = req.body;
            const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
                expiresIn: '10h'
            });
            res.send({ token })
        })

        // middleware
        const verifyToken = (req, res, next) => {
            console.log("inside verify token", req.headers.authorization);
            if (!req.headers.authorization) {
                return res.status(401).send({ message: 'unauthorized access' });
            }

            const token = req.headers.authorization.split(' ')[1];
            jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
                if (err) {
                    return res.status(401).send({ message: 'unauthorized access' });
                }
                req.decoded = decoded
                next()
            })

        }
        // user related api
        app.get('/users', verifyToken, async (req, res) => {
            // console.log("inside verify token", req.headers);
            const result = await userCollection.find().toArray();
            res.send(result)
        })

        app.post('/users', async (req, res) => {
            const user = req.body;
            const query = { email: user.email }
            const existingUser = await userCollection.findOne(query);
            if (existingUser) {
                return res.send({ message: 'user already exists', insertedId: null })
            }
            const result = await userCollection.insertOne(user);
            res.send(result)
        })

        app.patch('/users/:id', async (req, res) => {
            const id = req.params.id;
            console.log('patch', id)
            const filter = { _id: new ObjectId(id) };
            const updateDoc = {
                $set: {
                    role: 'admin'
                }
            }
            const result = await userCollection.updateOne(filter, updateDoc);
            res.send(result)
        })

        app.delete('/users/:id', async (req, res) => {
            const id = req.params.id;
            // console.log('users', id)
            const query = { _id: new ObjectId(id) }
            const result = await userCollection.deleteOne(query);
            res.send(result)
        })

        // news related api

        app.get('/news', async (req, res) => {
            const filter = req.query;
            const page = parseInt(filter.page)
            const size = parseInt(filter.size)
            // console.log(filter, page, size)
            let query = {}
            if (req.query.search) {
                query = { title: { $regex: filter.search, $options: 'i' } }
            }
            // if (req.query.search) {
            //     query = { tags: { $regex: filter.search, $options: 'i' } }
            // }
            // if (req.query.search) {
            //     query = { publisher_name: { $regex: filter.search, $options: 'i' } }
            // }
            const cursor = newsCollection.find(query);
            const result = await cursor
                .skip(page * size)
                .limit(size)
                .toArray();
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


        // page count
        app.get('/newsCount', async (req, res) => {
            const count = await newsCollection.estimatedDocumentCount();
            res.send({ count })
        })



        // Send a ping to confirm a successful connection
        // await client.db("admin").command({ ping: 1 });
        // console.log("Pinged your deployment. You successfully connected to MongoDB!");
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

