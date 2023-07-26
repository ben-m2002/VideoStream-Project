import express from "express";
import ffmpeg from "fluent-ffmpeg";
import {uploadRawVideoToGCS} from "./google_storage";
import fs from "fs";

const app = express();
app.use(express.json());


// we will upload the video and then process it
// process pretty much means we will download the raw video, process it and then upload it to a different bucket

app.post("/upload-raw-video", (req, res) => {
  const inputFilePath = req.body.inputFilePath as string;

  console.log("Starting upload");

  if (!inputFilePath) {
    res.status(400).send("Bad Request : Missing file path.");
    return;
  }

  if (!fs.existsSync(inputFilePath)) {
    res.status(404).send("File does not exist");
    return;
  }

  console.log("Uploading video to GCS");

  uploadRawVideoToGCS(inputFilePath).then(( result) => {
    if (result === "Video uploaded successfully") {
        res.status(200).send("Video uploaded successfully")
    }
    else if (result === "Path does not exist") {
        res.status(400).send("Bad Request : Missing file path.");
    }
    else{
        res.status(500).send("Something went wrong");
    }

})

})

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

const port = process.env.PORT || 8080;
app.listen(port, () =>{
    console.log(`Video Processing Service listening at http://localhost:${port}`);
})