const { Schema, model } = require("mongoose")

const SubscriptionSchema = new Schema({
  endpoint: String,
  expirationTime: String,
  keys: Object
})

module.exports = model('subscription', SubscriptionSchema)
