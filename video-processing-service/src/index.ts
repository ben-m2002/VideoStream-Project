import express from "express";
import ffmpeg from "fluent-ffmpeg";

const app = express();
app.use(express.json());

app.post("/process-video", (req, res) =>{
   // Get the path of the input video
    const inputFilePath = req.body.inputFilePath as string;
    const outputFilePath = req.body.outputFilePath as string;


    if (!inputFilePath || !outputFilePath) {
        res.status(400).send("Bad Request : Missing file path.");
        return;
    }

    // Process the video

    ffmpeg(inputFilePath).outputOption("-vf", "scale=1080:-1") // convert into 1080p
        .on("end", () => {
             res.status(200).send("Video Processing Completed")
        })
        .on("error", (err) => {
            console.log(err);
            res.status(500).send("Something went wrong");
        }).save(outputFilePath);

})

const port = process.env.PORT || 3000;
app.listen(port, () =>{
    console.log(`Video Processing Service listening at http://localhost:${port}`);
})