const express = require ('express');
const app = express();
const cors = require('cors');
require('dotenv').config();
const port = process.env.PORT || 5000;

// middlewares
app.use(cors());
app.use(express.json());


const { MongoClient, ServerApiVersion ,ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.jwbcngj.mongodb.net/?retryWrites=true&w=majority`;

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
    
  const foodCollection = client.db('AssignmentElevenDb').collection('food')
  const requestedFoodCollection = client.db('AssignmentElevenDb').collection('requestedFood')
  const userCollection = client.db('AssignmentElevenDb').collection('users')

// add a request food to requested food 
app.post('/requestedFood', async(req, res)=>{
    const requestFood = req.body;
    const result = await requestedFoodCollection.insertOne(requestFood)
    res.send(result);
})

// add user
app.post('/users', async (req, res)=>{
   const newUser = req.body;
   const result = await userCollection.insertOne(newUser);
   res.send(result);
})
// get user
app.get('/users', async(req, res)=>{
  const cursor = userCollection.find();
  const result = await cursor.toArray();
  res.send(result);
})

// add a food to food collection
app.post('/food', async (req, res) => {
  try {
    const foodItem = req.body;
    const result = await foodCollection.insertOne(foodItem);
    if (result.insertedId) {
      const userId = foodItem.donatorEmail; 
      const user = await userCollection.findOne({ email: userId });
      if (user) {
        const updatedDonatePoint = user.donatePoint + 1;
        await userCollection.updateOne({ email: userId }, { $set: { donatePoint: updatedDonatePoint } });

        res.status(201).json({ success: true, message: 'Food added successfully' });
      } else {
        res.status(404).json({ success: false, message: 'User not found' });
      }
    } else {
      res.status(400).json({ success: false, message: 'Failed to add food' });
    }
  } catch (error) {
    console.error('Error adding food:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});


// get requested food
app.get('/requestedFood', async(req,res)=>{
  const cursor = requestedFoodCollection.find();
  const result = await cursor.toArray();
  res.send(result);
})

// Add a food to food collection
app.post('/food', async(req,res)=>{
    const foodItem = req.body;
    const result = await foodCollection.insertOne(foodItem);
    res.send(result);
})

// get all food item
app.get('/food', async (req, res)=>{
    const cursor = foodCollection.find();
    const result = await cursor.toArray();
    res.send(result);
})

// get a single food by id
app.get('/food/:id', async(req, res)=>{
    const id = req.params.id
    const query ={_id: new ObjectId (id)}
    const result = await foodCollection.findOne(query);
    res.send(result);
})

// delete a  food
app.delete('/food/:id' , async(req, res)=>{
  const id = req.params.id;
 const query = {_id: new ObjectId(id)}
 const result = await foodCollection.deleteOne(query);
 res.send(result);
})

// update a food
 app.put('/food/:id', async(req, res)=>{
    const id = req.params.id;
    const filter ={_id: new ObjectId(id) };
    const options ={ upsert: true};
    const updateFood = req.body;
    const product ={
      $set:{
        FoodName :updateFood.FoodName ,
        quantity:updateFood.quantity,
          photo:updateFood.photo,
          location: updateFood.location,
          time:updateFood.time, 
          comment:updateFood.comment
      }
    }
    const result = await foodCollection.updateOne(filter,product,options);
    res.send(result);
  })


    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    
     // await client.close();
  }
}
run().catch(console.dir);





app.get('/', (req, res)=>{
    res.send('Assignment eleven is running')
})

app.listen(port, ()=>{
   console.log(`Assignment eleven is running on port ${port}`);
})