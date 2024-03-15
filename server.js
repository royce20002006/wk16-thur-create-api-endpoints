const http = require('http');

const dogs = [
  {
    dogId: 1,
    name: "Fluffy",
    age: 2
  }
];

let nextDogId = 2;

function getNewDogId() {
  const newDogId = nextDogId;
  nextDogId++;
  return newDogId;
}

const server = http.createServer((req, res) => {
  console.log(`${req.method} ${req.url}`);

  // assemble the request body
  let reqBody = "";
  req.on("data", (data) => {
    reqBody += data;
  });

  req.on("end", () => { // request is finished assembly the entire request body
    // Parsing the body of the request depending on the Content-Type header
    if (reqBody) {
      switch (req.headers['content-type']) {
        case "application/json":
          req.body = JSON.parse(reqBody);
          break;
        case "application/x-www-form-urlencoded":
          req.body = reqBody
            .split("&")
            .map((keyValuePair) => keyValuePair.split("="))
            .map(([key, value]) => [key, value.replace(/\+/g, " ")])
            .map(([key, value]) => [key, decodeURIComponent(value)])
            .reduce((acc, [key, value]) => {
              acc[key] = value;
              return acc;
            }, {});
          break;
        default:
          break;
      }
      console.log(req.body);
      console.log(dogs);
    }

    /* ======================== ROUTE HANDLERS ======================== */

    // GET /dogs
    if (req.method === 'GET' && req.url === '/dogs') {
      res.setHeader('Content-Type', 'application/json');
      res.statusCode = 200;
      let resBody = JSON.stringify(dogs);
      
      return res.end(resBody);
    }

    // GET /dogs/:dogId
    if (req.method === 'GET' && req.url.startsWith('/dogs/')) {
      const urlParts = req.url.split('/'); // ['', 'dogs', '1']
      let dog;
      if (urlParts.length === 3) {
        const dogId = urlParts[2];
        // Your code here 
        dog = dogs.find(el => el.dogId === Number(dogId));
        console.log(dog);
      
      }
      res.statusCode = 200;
      res.setHeader('content-type', 'application/json');
      return res.end(JSON.stringify(dog));
    }

    // POST /dogs
    if (req.method === 'POST' && req.url === '/dogs') {
      const { name, age } = req.body;
      let newDog = {dogId : getNewDogId(), name : name, age : age}
      dogs.push(newDog);
      
      res.setHeader('content-type', 'application/json');

      res.statusCode = 201;
      console.log(dogs);
      return res.end(JSON.stringify(newDog));
    }

    // PUT or PATCH /dogs/:dogId
    if ((req.method === 'PUT' || req.method === 'PATCH')  && req.url.startsWith('/dogs/')) {
      const urlParts = req.url.split('/');
      if (urlParts.length === 3) {
        const dogId = urlParts[2];
        let dog = dogs.find(el => el.dogId === Number(dogId));
        dog.name = req.body.name;
        dog.age = req.body.age;
        res.setHeader('content-type','application/json')
        res.statusCode = 200;
        res.write(JSON.stringify(dog))
        console.log(dog)
      }
      return res.end();
    }

    // DELETE /dogs/:dogId
    if (req.method === 'DELETE' && req.url.startsWith('/dogs/')) {
      const urlParts = req.url.split('/');
      if (urlParts.length === 3) {
        const dogId = urlParts[2];
        let dog = dogs.findIndex(el => el.dogId === Number(dogId));
        console.log(dog)
        dogs.splice(dog ,1);
        console.log(dogs)
        
      }
      res.setHeader('content-type', 'application/json')
      res.statusCode = 200;
      return res.end(JSON.stringify({message: "Successfully deleted"}));
    }

    // No matching endpoint
    res.statusCode = 404;
    res.setHeader('Content-Type', 'application/json');
    return res.end('Endpoint not found');
  });

});


if (require.main === module) {
    const port = 8000;
    server.listen(port, () => console.log('Server is listening on port', port));
} else {
    module.exports = server;
}
