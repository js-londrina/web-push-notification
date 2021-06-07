const dotenv = require("dotenv")
dotenv.config()

const Koa = require("koa") 
const Cors = require("@koa/cors")
const BodyParser = require("koa-bodyparser") 
const Router = require("koa-router") 
const Mongoose = require("mongoose") 
const Subscription = require("./models/Subscription")

const webPush = require("web-push")

// WEBPUSH CONFIGS
webPush.setVapidDetails(
  process.env.VAPID_SUBJECT,
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
)

// KOA CONFIGS
const app = new Koa()

app.use(BodyParser())
app.use(Cors({}))

// MONGODB CONFIGS
Mongoose.connect(process.env.MONGODB_URL, {
  useUnifiedTopology: true,
  useNewUrlParser: true,
  useCreateIndex: true
})

//ROTAS DA API
const router = new Router({ prefix: "/api" })

router.post("/subscription", async (ctx, next) => {
  const { data } = ctx.request.body
  const subscription = await Subscription.findOne({ endpoint: data.endpoint })

  if(!subscription){
    const newSubscription = await Subscription.create(data)

    if(newSubscription){
      ctx.body = { message: "Inscrição criada com sucesso!" }
    }
  }else{
    ctx.body = { message: "" }
  }

});

router.delete("/subscription", async (ctx, next) => {
  const { endpoint } = ctx.request.body

  const result = await Subscription.deleteOne({ endpoint })

  if(result.deletedCount){
    ctx.body = { message: "Inscrição delatado com sucesso!" }
  }else{
    ctx.body = { message: ""}
  }
});

router.post("/push-notification", async (ctx, next) => {
  const { title, content } = ctx.request.body
  const subscriptions = await Subscription.aggregate().project({ _id: 0, __v: 0 })

  subscriptions.map(async(subscription) => {
    delete subscription._id
    
    await webPush.sendNotification(subscription, JSON.stringify({ title, content }))
  })
  
  ctx.body = { message: "Notificações enviadas com sucesso!" }
})

app.use(router.routes())

app.listen(3333, () => {
  console.log("Servidor rodando\nBASE_URL: http://localhost:3333/api")
})