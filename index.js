const express = require('express');
const cors = require('cors');
require('dotenv').config();
const MongoClient = require('mongodb').MongoClient;
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
});


app.listen( process.env.PORT || port, () => {
  console.log(`NodeJS app listening at http://localhost:${port}`)
});