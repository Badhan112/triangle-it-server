const express = require('express');
const cors = require('cors');
require('dotenv').config();
const MongoClient = require('mongodb').MongoClient;
const ObjectId = require('mongodb').ObjectId;
const fileUpload = require('express-fileupload');
const app = express();
const port = 5000;
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.tinfh.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

app.use(express.json());
app.use(cors());
app.use(fileUpload());

app.get('/', (req, res) => {
  res.send('NodeJS Server App for Triangle IT');
});

client.connect(err => {
  const adminCollection = client.db(process.env.DB_NAME).collection("admins");
  const serviceCollection = client.db(process.env.DB_NAME).collection("services");
  const bookingCollection = client.db(process.env.DB_NAME).collection("bookings");
  const reviewCollection = client.db(process.env.DB_NAME).collection("reviews");
  console.log('MongoDB Connected');

  app.get('/services', (req, res) => {
    serviceCollection.find({})
    .toArray((err, documents) => res.send(documents));
  })

  app.post('/addService', (req, res) => {
    const file = req.files.file;
    const title = req.body.title;
    const price = req.body.price;
    const description = req.body.description;
    const imgData = file.data;
    const encImg = imgData.toString('base64');

    const image = {
      contentType: file.mimetype,
      size: file.size,
      img: Buffer.from(encImg, 'base64'),
    }

    serviceCollection.insertOne({title, price, description, image})
    .then(result => {
      res.send(result.insertedCount > 0);
    })
  })

  app.post('/addAdmin', (req, res) => {
    const email = req.query.email;
    adminCollection.insertOne({email})
    .then(result => {
      res.send(result.insertedCount > 0);
    })
  })

  app.post('/isAdmin', (req, res) => {
    const email = req.query.email;
    adminCollection.find({email: email})
    .toArray((err, documents) => {
      res.send(documents.length > 0);
    })
  })

  app.post('/addBooking', (req, res) => {
    bookingCollection.insertOne(req.body)
    .then(result => res.send(result.insertedCount > 0));
  })

  app.post('/allBooking', (req, res) => {
    const email = req.body.email;
    adminCollection.find({email: email})
    .toArray((err, admins) => {
      if(admins.length > 0){
        bookingCollection.find({})
        .toArray((err, documents) => res.send(documents));
      } else {
        bookingCollection.find({email: email})
        .toArray((err, documents) => res.send(documents));
      }
    })
  })

  app.get('/services/:id', (req, res) => {
    serviceCollection.findOne({ _id: ObjectId(req.params.id)})
    .then(document => res.send(document));
  })

  app.post('/addReview', (req, res) => {
    reviewCollection.insertOne(req.body)
    .then(result => res.send(result.insertedCount > 0));
  })

  app.get('/allReviews', (req, res) => {
    reviewCollection.find({})
    .toArray((err, documents) => res.send(documents));
  })
  
});


app.listen( process.env.PORT || port, () => {
  console.log(`NodeJS app listening at http://localhost:${port}`)
});