const APP_SERVER_KEY = "BOsUrym5NcW-ockgs5DdQIk2oxsEvhoDltPhpANWtjwuAMpxIVN8CKoJl5FYopY3WD0oOytNdDJNCIq0I2rmm3g"

const BASE_URL = "http://localhost:3333/api"

function notify(){
  if ("Notification" in window) {
    if (Notification.permission === "granted") {
      new Notification(
        "Notificação", 
        { body: "Está é uma notificação" }
      )
    } else {
      Notification.requestPermission()
    }
  }
}

const buttonNotify = document.querySelector("button.notify")

buttonNotify.onclick = () => { notify() }

async function subscribe(){
  if ("serviceWorker" in navigator) {
    if ("Notification" in window) {
      if (Notification.permission === "granted") {
        const registration = await navigator.serviceWorker.register("/service-worker.js", { scope: "/" })
        
        const options = {
          userVisibleOnly: true,
          applicationServerKey: APP_SERVER_KEY
        }

        const pushSubscription = await registration.pushManager.subscribe(options)

        const response = await fetch(`${BASE_URL}/subscription`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ data: pushSubscription })
        })

        const result = await response.json()
        
        if(result.message == "Inscrição criada com sucesso!"){
          alert("Inscrito para receber notificação!")
        }  
      } else {
        Notification.requestPermission()
      }
    }
  }
}

const buttonSubscribe = document.querySelector("button.subscribe")

buttonSubscribe.onclick = () => { subscribe() }

async function unsubscribe(){
  const serviceWorker = await navigator.serviceWorker.ready
  if(serviceWorker){
    const pushSubscription = await serviceWorker.pushManager.getSubscription()
    if(pushSubscription){
      const response = await fetch(`${BASE_URL}/subscription`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ endpoint: pushSubscription.endpoint })
      })
    
      const result = await response.json()

      if(result.message == "Inscrição delatado com sucesso!"){
        alert("Desinscrito com sucesso!")
      }  
    }
  }
}

const buttonUnsubscribe = document.querySelector("button.unsubscribe")

buttonUnsubscribe.onclick = () => { unsubscribe() }

function validateInput(value){
  if(!value) return false

  return true
}

async function sendNewNotification(){
  const inputTitle = document.querySelector("input.title") 
  const inputContent = document.querySelector("textarea.content") 

  if(!validateInput(inputTitle.value) || 
     !validateInput(inputContent.value)
  ) return

  const body = {
    title: inputTitle.value,
    content: inputContent.value
  }

  const response = await fetch(`${BASE_URL}/push-notification`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  })
 
  const result = await response.json()

  if(result.message == "Notificações enviadas com sucesso!"){
    alert("Notificações enviadas!")
  }  

  inputTitle.value = ""
  inputContent.value = ""
}

const buttonPushNotification = document.querySelector("button.submit-push-notification")

buttonPushNotification.onclick = (event) => {
  event.preventDefault()
  sendNewNotification() 
}