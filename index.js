const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.a46jnic.mongodb.net/?retryWrites=true&w=majority`;

const app = express()
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json())

app.get('/', (req, res) => {
    res.send('Epic Rumble Server is running...........')
})



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
        client.connect();
        const categoryCollection = client.db("epicRumbleDB").collection("subCategories");
        const productsCollection = client.db("epicRumbleDB").collection("products");
        const reviewsCollection = client.db("epicRumbleDB").collection("customerReviews");
        const sellersCollection = client.db("epicRumbleDB").collection("sellers");

        // Get categoried
        app.get('/subCategories', async (req, res) => {
            const results = await categoryCollection.find().toArray();
            res.send(results)
        })

        // get data by subcetegory
        app.get('/subcategory/:id', async (req, res) => {
            let query = {}
            if (req.params?.id) {
                const id = parseInt(req.params.id); // Parse the id to an integer if necessary
                query = { subCategoryId: id };
            }
            console.log(query);
            const result = await productsCollection.find(query).toArray();
            res.send(result);
        });
        // // Get all products 
        app.get('/products', async (req, res) => {
            const limit = parseInt(req.query.limit); // Get the limit from the query parameter, default to 20
            const result = await productsCollection.find().limit(limit).toArray();
            res.send(result);
        });


        app.get('/products/:email', async (req, res) => {
            let filterBy = null; // Declare and initialize filterBy variable

            if (req.query.filterBy) {
                filterBy = parseInt(req.query.filterBy);
                result = await productsCollection.find({ ...req.params }).sort({ price: filterBy }).toArray();
            } else {
                result = await productsCollection.find({ ...req.params }).toArray();
            }

            console.log(filterBy);
            const filteredResult = result;

            res.send(filteredResult);
        });




        // Delete products by using ID
        app.delete('/products/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await productsCollection.deleteOne(query);
            res.send(result);
        });

        // Add a product in server

        app.post('/products', async (req, res) => {
            const doc = req.body;
            const result = await productsCollection.insertOne(doc)
            res.send(result)
        })

        // Edit A products by id
        app.put('/products/:id', async (req, res) => {
            const id = req.params.id
            const query = { _id: new ObjectId(id) };
            const updatedToy = req.body
            const updateDoc = {
                $set: {

                    price: updatedToy.price,
                    availableQuantity: updatedToy.availableQuantity,
                    detailDescription: updatedToy.detailDescription,
                    rating: updatedToy.rating,

                },
            };
            const result = await productsCollection.updateOne(query, updateDoc)
            res.send(result)

        })


        // Get products by id
        app.get('/allproducts/:id', async (req, res) => {
            const id = req.params.id;
            console.log(id);
            const filter = { _id: new ObjectId(id) };
            const result = await productsCollection.findOne(filter)
            console.log(result);
            res.send(result)
        })

        // Get Customer Reviews
        app.get('/reviews', async (req, res) => {
            const result = await reviewsCollection.find().toArray();
            res.send(result)
        })

        // Get Sellers
        app.get('/sellers', async (req, res) => {
            const result = await sellersCollection.find().toArray();
            res.send(result)
        })





        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {

    }
}
run().catch(console.dir);


app.listen(port, (req, res) => {
    console.log(`Rumble is running at port:${port}`);
})