import express from "express";
import ffmpeg from "fluent-ffmpeg";
import {
    uploadRawVideoToGCS, downloadRawVideoFromGCS, processVideo, uploadProcessedVideoToGCS,
    rawVideosDirectory, processedVideosDirectory, deleteRawVideoFromGCS, deleteRawAndProcessedFromDirectory
} from "./google_storage";
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

app.post("/process-video", (req, res) => {
    console.log(req.body);
   // Get the bucket and filename from the Cloud Pub/Sub message
  let data;
  try {
    const message = Buffer.from(req.body.message.data, 'base64').toString('utf8');
    data = JSON.parse(message);
    if (!data.name) {
      throw new Error('Invalid message payload received.');
    }
  } catch (error) {
    console.error(error);
    return res.status(400).send('Bad Request: missing filename.');
  }


  const videoName = data.Name;

  if (!videoName) {
    return res.status(400).send("Bad Request : Missing video name.");
  }

  downloadRawVideoFromGCS(videoName)
    .then(async (result) => {
      if (
        result == "Path does not exist" ||
        result == "Video name is missing"
      ) {
        return res
          .status(400)
          .send("Bad Request : Missing file path or Video Name Missing");
      } else if (result == "Something went wrong internally") {
        return res.status(500).send("Something went wrong internally");
      } else if (result == "Video downloaded successfully") {
        const videoPath = `${rawVideosDirectory}/${videoName}`;
        try {
          await processVideo(videoName, videoPath);
          uploadProcessedVideoToGCS(videoName)
            .then((result) => {
              if (result == "Video uploaded successfully") {
                // some clean up
                deleteRawVideoFromGCS(videoName);
                deleteRawAndProcessedFromDirectory(videoName);
                return res
                  .status(200)
                  .send("Video processed and uploaded successfully");
              } else if (result == "Video does not exist") {
                return res.status(400).send("VideoPath does not exist");
              } else if (result == "Something went wrong internally") {
                return res.status(500).send("Something went wrong internally");
              }
            })
            .catch((error) => {
              console.log(error);
              return res.status(500).send("Something went wrong");
            });
        } catch (err) {
          console.log(err);
          return res.status(500).send("Something went wrong internally");
        }
      }
    })
    .catch((error) => {
      console.log(error);
      return res.status(500).send("Something went wrong");
    });
});


const port = process.env.PORT || 3000;
app.listen(port,  () =>{
    console.log(`Video Processing Service listening at http://localhost:${port}`);
});