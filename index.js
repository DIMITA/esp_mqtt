
const mqtt = require('mqtt')
const axios = require('axios');

const protocol = 'mqtt'
const host = 'mqtt-dashboard.com'
const port = '1883'
const clientId = "Symfony-Client-ynov-lyon-2023esp32-teddy"

const topic = "/ynov-lyon-2023/esp32-teddy/in"

const backendUrl = "http://127.0.0.1:8000/api/"

const connectUrl = `${protocol}://${host}:${port}`


const client = mqtt.connect(connectUrl, {
    clientId,
    clean: true,
    connectTimeout: 4000,
    username: 'emqx',
    password: 'public',
    reconnectPeriod: 1000,
})

client.on('connect', () => {
    console.log('Connected')
    client.subscribe([topic], () => {
        console.log(`Subscribe to topic '${topic}'`)
    })
})

client.on('disconnect', () => {
    console.log('disconnected')

})

client.on('message', (topic, payload) => {

    if (payload.toString() !== "test") {
        console.log(payload.toJSON(), 'json')
        console.log(payload.toString(), 'string')
        console.log(payload, 'simple')
        const temperatures = JSON.parse(payload.toString()).temperature
        console.log(temperatures, "temperatures")
        const now = new Date();
        for (let index = 0; index < temperatures.length; index++) {
            const newDate = now.setSeconds(now.getSeconds() - 5)
            console.log(newDate);
            const obj = {
                name: "esp_temp",
                value: temperatures[temperatures.length - (1 + index)].toString(),
                dateTimeOffset: now
            }

            console.log(obj);

            axios.post(backendUrl + 'times_series/', obj)
                .then(res => {
                    const headerDate = res.headers && res.headers.date ? res.headers.date : 'no response date';
                    console.log('Status Code:', res.status);
                    console.log('Date in Response header:', headerDate);
                })
                .catch(err => {
                    console.log('Error: ', err.message);
                });

        }

    }

})