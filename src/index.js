

const express = require("express");
const mongoose = require("mongoose");
require("dotenv").config();
const userRoute = require("./routes/user");
const mqtt = require("mqtt");
const client = mqtt.connect("mqtt://test.mosquitto.org");
const Schema = mongoose.Schema;

const MyModel = new Schema({
  Nombre: { type: String },
  Tarjeta: { type: String },
  Hora: { type: String },
  Fecha: { type: String },
  Precio: { type: String },
});

const MyModelModel = mongoose.model("estacionamiento", MyModel);

// Define an async function to get data
const getData = async () => {
  try {
    const documents = await MyModelModel.find();

    // Transforma los documentos a un array de objetos JSON
    const data = documents.map(document => {
      // Filtra las propiedades que no quieres incluir en el JSON si es necesario
      const { _id, __v, ...data } = document.toObject();
      console.log(data);
      return data;
    });

    return data;
  } catch (error) {
    console.error("Error al obtener datos:", error);
    throw error; // Puedes manejar el error según tus necesidades
  }
};




// Settings
const path = require('path')
const app = express();
const port = process.env.PORT || 3000;

app.set('views', path.join(__dirname, 'views')); // Ajusta la ruta según tu estructura
app.set('view engine', 'ejs');


// Middlewares
app.use(express.json());
app.use("/api", userRoute);
app.use(express.static(path.join(__dirname, 'public')));


app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Routes
app.get('/grafica2', async (req, res) => {
  try {
    const data = await getData();
    res.render('grafica2', { datos: data });
  } catch (error) {
    res.status(500).send('Error interno del servidor');
  }
});

client.on("connect", () => {
  client.subscribe("ESIoT/cobros", (err) => {
    if (!err) {
      client.publish("presence", "Hello mqtt");
    }
  });
});

client.on("message", (topic, message, req, res) => {
  var jotason = JSON.parse(message);
  console.log("Nombre: " + jotason.Nombre);
  console.log("Tarjeta: " + jotason.Tarjeta);
  console.log("Hora: " + jotason.Hora);
  console.log("Fecha: " + jotason.Fecha);
  console.log("Precio: " + jotason.Precio);
  console.log("\n");

  const document = new MyModelModel({
    Nombre: jotason.Nombre,
    Tarjeta: jotason.Tarjeta,
    Hora: jotason.Hora,
    Fecha: jotason.Fecha,
    Precio: jotason.Precio,
  });

  document.save((err) => {
    if (err) {
      console.log(err);
      return;
    }

    console.log("Documento insertado correctamente");
  });

  //client.end();
});

// mongodb connection
mongoose
  .connect(
    "mongodb+srv://george:Q91ApFhYcjLzChQ2@cluster0.18kab.mongodb.net/Aplicacion?retryWrites=true&w=majority"
  )
  .then(() => console.log("Connected to MongoDB Atlas"))
  .catch((error) => console.error(error));

// Call the async function to get data
app.listen(port, async () => {
  console.log("Server listening to", port);
  await getData();
});
