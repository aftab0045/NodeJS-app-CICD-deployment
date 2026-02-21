const express = require('express');
const app = express();
const port = 3000;

app.get('/', (req, res) => {
  res.send('Hello from Jenkins! This is version 5 successfully deployed using automated CI/CD with webhook');
});

app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`);
});
