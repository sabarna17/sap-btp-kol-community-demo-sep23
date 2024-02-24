const express = require('express')
const app = express()
const axios = require('axios');

var options = {
    type: 'application/json'
  };

app.use(express.json());
app.use(
    express.raw({
      limit: '5mb',
      type: 'application/json',
      verify: (req, res, buf) => {
        req.rawBody = buf.toString();
        console.log(req.rawBody);
      },
    })
  )

var ngrokhost = process.env['NGROK_HOST'];
if (!ngrokhost) {
    ngrokhost = 'https://b2b7-136-185-52-66.ngrok-free.app';
}

var port = process.env['INTERNAL_PORT'];
if (!port) {
    port = 8080;
}

var ngrok = async function (url, header, body) {
    if (body) {
        // POST NGROK
        let config = {
            method: 'post',
            maxBodyLength: Infinity,
            url: url,
            headers: header,
            data: body
        };

        return await axios.request(config)
            .then((response) => {
                console.log(JSON.stringify(response.data));
                return response.data
            })
            .catch((error) => {
                console.log(error);
            });
    }
    else {
        // GET NGROK
        console.log("Get is triggered")
        return new Promise((resolve, reject) => {
            axios.get(url, header)
                .then(response => {
                    console.log(response.data);
                    // resolve(response.data.results.messages[0].content)
                    resolve(response.data)
                })
                .catch(function (error) {
                    if (error.response) {
                        // Request made and server responded
                        console.log(error.response.data);
                        console.log(error.response.status);
                        console.log(error.response.headers);
                    } else if (error.request) {
                        // The request was made but no response was received
                        console.log(error.request);
                    } else {
                        // Something happened in setting up the request that triggered an Error
                        console.log('Error', error.message);
                    }
                })
        })
    }
}

app.get('*', async (req, res) => {
    const url = req.originalUrl;
    var fullUrl = ngrokhost + url;
    console.log(fullUrl);
    var response = await ngrok(fullUrl, {
        'Content-Type': 'application/json'
    });
    res.json(response);
})

app.post('*', async (req, res) => {
    console.log('Post Triggered Start-------------');
    const url = req.originalUrl;
    var fullUrl = ngrokhost + url;
    if(req.is('application/json')){
        console.log("I am here");
        var data = JSON.stringify(req.body);
    }
    else{
        data = req.rawBody;
    }
    console.log('DATA---------------------------');
    console.log(data);
    console.log('DATA---------------------------');
    var response = await ngrok(fullUrl, {
        'Content-Type': 'application/json'
    }, data);
    console.log('Post Triggered End-------------');
    res.json(response);

})

app.listen(port)

console.log(`Server Listening in Port:: ${port}`)
