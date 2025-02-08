import express from 'express';

const app = express();
const port = 3000;

//process in JSON
app.use(express.json());

app.get("/", function(req, res) {
    res.send("Hello world");
});

app.listen(port, () => {
    console.log(
        `Example app listening at http://localhost:${port}`
    )
});