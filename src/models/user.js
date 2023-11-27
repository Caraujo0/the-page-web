const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
  
  alumno: {
    type: String,
    required: true,
  },
  edad: {
    type: Number,
    required: true
  },
  cuenta: {
    type: Number,
    required: true

  },

  correo: {
    type: String,
    required: true

  },

  hora_fecha: {
    type: Date, default: Date.now,

  }
});

module.exports = mongoose.model('User', userSchema);