import express from "express";
import ffmpeg from "fluent-ffmpeg";
import {uploadRawVideoToGCS, downloadRawVideoFromGCS, processVideo, uploadProcessedVideoToGCS,
rawVideosDirectory, processedVideosDirectory} from "./google_storage";
import fs from "fs";

const app = express();
app.use(express.json());


// we will upload the video and then process it
// process pretty much means we will download the raw video, process it and then upload it to a different bucket

app.post("/upload-raw-video", (req, res) => {
  const inputFilePath = req.body.inputFilePath as string;

  if (!inputFilePath) {
    res.status(400).send("Bad Request : Missing file path.");
    return;
  }

  if (!fs.existsSync(inputFilePath)) {
    res.status(404).send("File does not exist");
    return;
  }


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
    const videoName = req.body.videoName as string;

    if (!videoName) {
        res.status(400).send("Bad Request : Missing video name.");
        return;
    }

    downloadRawVideoFromGCS(videoName).then(async (result) => {
        if (result == "Path does not exist" || result == "Video name is missing") {
            res.status(400).send("Bad Request : Missing file path or Video Name Missing");
            return;
        } else if (result == "Something went wrong internally") {
            res.status(500).send("Something went wrong internally");
            return;
        } else if (result == "Video downloaded successfully") {
            const videoPath = `${rawVideosDirectory}/${videoName}`;
            try {
                await processVideo(videoName,videoPath);
                uploadProcessedVideoToGCS(videoName).then((result) => {
                if (result == "Video uploaded successfully") {
                    res.status(200).send("Video uploaded successfully");
                    return;
                } else if (result == "Video does not exist") {
                    res.status(400).send("VideoPath does not exist");
                    return;
                }
                else if (result == "Something went wrong internally") {
                    res.status(500).send("Something went wrong internally");
                    return;
                }
            })
            } catch (err) {
                console.log(err);
                res.status(500).send("Something went wrong internally");
                return;
            }

            res.status(200).send("Video processed and uploaded successfully");
        }
    })

})

const port = process.env.PORT || 8080;
app.listen(port, () =>{
    console.log(`Video Processing Service listening at http://localhost:${port}`);
})