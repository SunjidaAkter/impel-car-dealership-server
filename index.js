const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 5000;

//use middleware
app.use(cors());
app.use(express.json());

function verifyJWT(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).send({ massage: "Sorry Unauthorized" });
    }

    jwt.verify(
        authHeader,
        process.env.ACCESS_TOKEN_SECRET,
        function (err, decoded) {
            if (err) {
                return res
                    .status(403)
                    .send({ massage: " Forbidden, does not have access " });
            }

            req.decoded = decoded;
            next();
        }
    );
}


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.wb781.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
//      client.connect(err => {
//      const itemCollection = client.db("eleventhAssignment").collection("item");
//      DB_USER=dbassignment7
//      DB_PASS=7gUG47BwbfJP1UuD
//      ACCESS_TOKEN_SECRET=0f3c8859691897030dca96bec67e2d96e75e9cd574ed7c67565e31ceedf427603a9cbccfcd5068f5ac0a3e847f2777a9f89ae624a4b1de0c6b4159100c30dce0
//     // perform actions on the collection object
//     console.log('connected')
//     client.close();
// });
//require('crypto').randomBytes(64).toString('hex')



async function run() {
    try {
        await client.connect();
        const itemCollection = client.db("eleventhAssignment").collection("item");
        const supplierCollection = client.db("eleventhAssignment").collection("supplier");


        app.post('/signIn', async (req, res) => {
            const user = req.body;
            const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
                expiresIn: '1d'
            });
            res.send({ accessToken });
        })

        app.get('/item', async (req, res) => {
            const query = {};
            const cursor = itemCollection.find(query);
            const items = await cursor.toArray();
            res.send(items);
        })

        app.post("/item", async (req, res) => {
            const doc = req.body;
            const result = await itemCollection.insertOne(doc);
            res.send(result);
        });


        app.get('/item/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await itemCollection.findOne(query);
            res.send(result);

        })

        app.put('/item/:id', async (req, res) => {
            const id = req.params.id;
            const updatedItem = req.body;
            const filter = { _id: ObjectId(id) };
            const options = { upsert: true };
            const updateDoc = {
                $set: {
                    quantity: updatedItem.quantity
                }
            }
            const result = await itemCollection.updateOne(filter, updateDoc, options);
            res.send(result);
        })

        app.put('/item/:id', async (req, res) => {
            const id = req.params.id;
            const updatedItem = req.body;
            const filter = { _id: ObjectId(id) };
            const options = { upsert: true };
            const updateDoc = {
                $set: {
                    quantity: quantityMinus
                }
            }
            const result = await itemCollection.updateOne(filter, updateDoc, options);
            res.send(result);
        })

        app.get("/myItem", verifyJWT, async (req, res) => {
            const decodedEmail = req?.decoded?.email;
            const email = req?.query?.email;

            if (email === decodedEmail) {
                const query = { email };
                const cursor = itemCollection.find(query);
                const myItem = await cursor.toArray();

                res.send(myItem);
            } else {
                res.status(403).send({ massage: " Forbidden, does not have access " });
            }
        });


        app.delete("/myItem/:id", async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await itemCollection.deleteOne(query);
            res.send(result);
        });

        app.get("/supplier", async (req, res) => {
            const query = {};
            const cursor = supplierCollection.find(query);
            const result = await cursor.toArray();
            res.send(result);
        });



    }

    finally { }
}
run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('Running My Eleventh Assignment Server');
});
app.listen(port, () => {
    console.log('Eleventh Assignment Server is running on port :', port)
})

// const express = require('express');
// const cors = require('cors');
// const jwt = require('jsonwebtoken');
// require('dotenv').config();
// const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
// var nodemailer = require('nodemailer');
// var sgTransport = require('nodemailer-sendgrid-transport');
// const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// const app = express();
// const port = process.env.PORT || 5000;

// app.use(cors());
// app.use(express.json());


// const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.twtll.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

// const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

// function verifyJWT(req, res, next) {
//     const authHeader = req.headers.authorization;
//     if (!authHeader) {
//         return res.status(401).send({ message: 'UnAuthorized access' });
//     }
//     const token = authHeader.split(' ')[1];
//     jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function (err, decoded) {
//         if (err) {
//             return res.status(403).send({ message: 'Forbidden access' })
//         }
//         req.decoded = decoded;
//         next();
//     });
// }

// const emailSenderOptions = {
//     auth: {
//         api_key: process.env.EMAIL_SENDER_KEY
//     }
// }

// const emailClient = nodemailer.createTransport(sgTransport(emailSenderOptions));

// function sendAppointmentEmail(booking) {
//     const { patient, patientName, treatment, date, slot } = booking;

//     var email = {
//         from: process.env.EMAIL_SENDER,
//         to: patient,
//         subject: `Your Appointment for ${treatment} is on ${date} at ${slot} is Confirmed`,
//         text: `Your Appointment for ${treatment} is on ${date} at ${slot} is Confirmed`,
//         html: `
//       <div>
//         <p> Hello ${patientName}, </p>
//         <h3>Your Appointment for ${treatment} is confirmed</h3>
//         <p>Looking forward to seeing you on ${date} at ${slot}.</p>
        
//         <h3>Our Address</h3>
//         <p>Andor Killa Bandorban</p>
//         <p>Bangladesh</p>
//         <a href="https://web.programming-hero.com/">unsubscribe</a>
//       </div>
//     `
//     };

//     emailClient.sendMail(email, function (err, info) {
//         if (err) {
//             console.log(err);
//         }
//         else {
//             console.log('Message sent: ', info);
//         }
//     });

// }
// function sendPaymentConfirmationEmail(booking) {
//     const { patient, patientName, treatment, date, slot } = booking;

//     var email = {
//         from: process.env.EMAIL_SENDER,
//         to: patient,
//         subject: `We have received your payment for ${treatment} is on ${date} at ${slot} is Confirmed`,
//         text: `Your payment for this Appointment ${treatment} is on ${date} at ${slot} is Confirmed`,
//         html: `
//       <div>
//         <p> Hello ${patientName}, </p>
//         <h3>Thank you for your payment . </h3>
//         <h3>We have received your payment</h3>
//         <p>Looking forward to seeing you on ${date} at ${slot}.</p>
//         <h3>Our Address</h3>
//         <p>Andor Killa Bandorban</p>
//         <p>Bangladesh</p>
//         <a href="https://web.programming-hero.com/">unsubscribe</a>
//       </div>
//     `
//     };

//     emailClient.sendMail(email, function (err, info) {
//         if (err) {
//             console.log(err);
//         }
//         else {
//             console.log('Message sent: ', info);
//         }
//     });

// }


// async function run() {
//     try {
//         await client.connect();
//         const serviceCollection = client.db('doctors_portal').collection('services');
//         const bookingCollection = client.db('doctors_portal').collection('bookings');
//         const userCollection = client.db('doctors_portal').collection('users');
//         const doctorCollection = client.db('doctors_portal').collection('doctors');
//         const paymentCollection = client.db('doctors_portal').collection('payments');

//         const verifyAdmin = async (req, res, next) => {
//             const requester = req.decoded.email;
//             const requesterAccount = await userCollection.findOne({ email: requester });
//             if (requesterAccount.role === 'admin') {
//                 next();
//             }
//             else {
//                 res.status(403).send({ message: 'forbidden' });
//             }
//         }

//         app.post('/create-payment-intent', verifyJWT, async (req, res) => {
//             const service = req.body;
//             const price = service.price;
//             const amount = price * 100;
//             const paymentIntent = await stripe.paymentIntents.create({
//                 amount: amount,
//                 currency: 'usd',
//                 payment_method_types: ['card']
//             });
//             res.send({ clientSecret: paymentIntent.client_secret })
//         });

//         app.get('/service', async (req, res) => {
//             const query = {};
//             const cursor = serviceCollection.find(query).project({ name: 1 });
//             const services = await cursor.toArray();
//             res.send(services);
//         });

//         app.get('/user', verifyJWT, async (req, res) => {
//             const users = await userCollection.find().toArray();
//             res.send(users);
//         });

//         app.get('/admin/:email', async (req, res) => {
//             const email = req.params.email;
//             const user = await userCollection.findOne({ email: email });
//             const isAdmin = user.role === 'admin';
//             res.send({ admin: isAdmin })
//         })

//         app.put('/user/admin/:email', verifyJWT, verifyAdmin, async (req, res) => {
//             const email = req.params.email;
//             const filter = { email: email };
//             const updateDoc = {
//                 $set: { role: 'admin' },
//             };
//             const result = await userCollection.updateOne(filter, updateDoc);
//             res.send(result);
//         })

//         app.put('/user/:email', async (req, res) => {
//             const email = req.params.email;
//             const user = req.body;
//             const filter = { email: email };
//             const options = { upsert: true };
//             const updateDoc = {
//                 $set: user,
//             };
//             const result = await userCollection.updateOne(filter, updateDoc, options);
//             const token = jwt.sign({ email: email }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' })
//             res.send({ result, token });
//         });

//         // Warning: This is not the proper way to query multiple collection. 
//         // After learning more about mongodb. use aggregate, lookup, pipeline, match, group
//         app.get('/available', async (req, res) => {
//             const date = req.query.date;

//             // step 1:  get all services
//             const services = await serviceCollection.find().toArray();

//             // step 2: get the booking of that day. output: [{}, {}, {}, {}, {}, {}]
//             const query = { date: date };
//             const bookings = await bookingCollection.find(query).toArray();

//             // step 3: for each service
//             services.forEach(service => {
//                 // step 4: find bookings for that service. output: [{}, {}, {}, {}]
//                 const serviceBookings = bookings.filter(book => book.treatment === service.name);
//                 // step 5: select slots for the service Bookings: ['', '', '', '']
//                 const bookedSlots = serviceBookings.map(book => book.slot);
//                 // step 6: select those slots that are not in bookedSlots
//                 const available = service.slots.filter(slot => !bookedSlots.includes(slot));
//                 //step 7: set available to slots to make it easier 
//                 service.slots = available;
//             });


//             res.send(services);
//         })

//         /**
//          * API Naming Convention
//          * app.get('/booking') // get all bookings in this collection. or get more than one or by filter
//          * app.get('/booking/:id') // get a specific booking 
//          * app.post('/booking') // add a new booking
//          * app.patch('/booking/:id) //
//          * app.put('/booking/:id') // upsert ==> update (if exists) or insert (if doesn't exist)
//          * app.delete('/booking/:id) //
//         */

//         app.get('/booking', verifyJWT, async (req, res) => {
//             const patient = req.query.patient;
//             const decodedEmail = req.decoded.email;
//             if (patient === decodedEmail) {
//                 const query = { patient: patient };
//                 const bookings = await bookingCollection.find(query).toArray();
//                 return res.send(bookings);
//             }
//             else {
//                 return res.status(403).send({ message: 'forbidden access' });
//             }
//         });

//         app.get('/booking/:id', verifyJWT, async (req, res) => {
//             const id = req.params.id;
//             const query = { _id: ObjectId(id) };
//             const booking = await bookingCollection.findOne(query);
//             res.send(booking);
//         })


//         app.post('/booking', async (req, res) => {
//             const booking = req.body;
//             const query = { treatment: booking.treatment, date: booking.date, patient: booking.patient }
//             const exists = await bookingCollection.findOne(query);
//             if (exists) {
//                 return res.send({ success: false, booking: exists })
//             }
//             const result = await bookingCollection.insertOne(booking);
//             console.log('sending email');
//             sendAppointmentEmail(booking);
//             return res.send({ success: true, result });
//         });

//         app.patch('/booking/:id', verifyJWT, async (req, res) => {
//             const id = req.params.id;
//             const payment = req.body;
//             const filter = { _id: ObjectId(id) };
//             const updatedDoc = {
//                 $set: {
//                     paid: true,
//                     transactionId: payment.transactionId
//                 }
//             }

//             const result = await paymentCollection.insertOne(payment);
//             const updatedBooking = await bookingCollection.updateOne(filter, updatedDoc);
//             res.send(updatedBooking);
//         })

//         app.get('/doctor', verifyJWT, verifyAdmin, async (req, res) => {
//             const doctors = await doctorCollection.find().toArray();
//             res.send(doctors);
//         })

//         app.post('/doctor', verifyJWT, verifyAdmin, async (req, res) => {
//             const doctor = req.body;
//             const result = await doctorCollection.insertOne(doctor);
//             res.send(result);
//         });

//         app.delete('/doctor/:email', verifyJWT, verifyAdmin, async (req, res) => {
//             const email = req.params.email;
//             const filter = { email: email };
//             const result = await doctorCollection.deleteOne(filter);
//             res.send(result);
//         })

//     }
//     finally {

//     }
// }

// run().catch(console.dir);


// app.get('/', (req, res) => {
//     res.send('Hello From Doctor Uncle own portal!')
// })

// app.listen(port, () => {
//     console.log(`Doctors App listening on port ${port}`)
// })