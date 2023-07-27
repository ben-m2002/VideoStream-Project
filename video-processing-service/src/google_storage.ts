// Hold all of our Google Cloud Storage related functions
// Download videos from google cloud storage and upload videos to google cloud storage

import { Storage } from '@google-cloud/storage';
import fs from "fs";
import ffmpeg from "fluent-ffmpeg";

const storage = new Storage();

const rawVideosBucketName = "video-service-raw12345-videos2002";
const processedVideosBucketName = "video-service-processed12345-videos2002";

const rawVideosDirectory = "./raw-videos";
const processedVideosDirectory = "./processed-videos";

// this will create a local directory to hold our videos locally (raw and unprocessed)
export function setUpDirectories() {
    if (!fs.existsSync(rawVideosDirectory)) {
        fs.mkdirSync(rawVideosDirectory);
    }

    if (!fs.existsSync(processedVideosDirectory)) {
        fs.mkdirSync(processedVideosDirectory);
    }
}
setUpDirectories()

/**
 * Uploads a video to a google cloud storage bucket
 * @param path
 */
export async function uploadRawVideoToGCS(path: string) {
    if (!fs.existsSync(path)) {
        return "Path does not exist"
    }

    console.log(path + " exists for raw video upload")

    try{
        await storage.bucket(rawVideosBucketName).upload(path)
        console.log("raw video uploaded successfully")
        return "Video uploaded successfully"
    }catch(err){
        console.log(err);
        return "Something went wrong internally"
    }
}

/**
 * Downloads a video from a google cloud storage bucket
 * @param videoName
 */
export async function downloadRawVideoFromGCS(videoName: string) {

    const pathDestination = `${rawVideosDirectory}/${videoName}`;

    const options = {
      destination : `${rawVideosDirectory}/${videoName}` // this is where we will store the video locally
    }

    if (!fs.existsSync(pathDestination)) {
        return "Path does not exist"
    }

    console.log(pathDestination + " exists");

    if (!videoName){
      return "Video name is missing"
    }

    console.log(videoName + " exists")

    try{
        await storage.bucket(rawVideosBucketName).file(videoName).download(options)
        console.log("Video downloaded successfully")
        return "Video downloaded successfully"
    }catch (err){
        console.log(err);
         console.log("Something went wrong downloading raw video")
        return "Something went wrong internally"
    }


}

/**
 * processes a video using ffmpeg
 * @param filePath
 */
export function processVideo (filePath : string){
    if (!fs.existsSync(filePath)) {
        return "Path does not exist"
    }

    console.log(filePath + " exists");

    ffmpeg(filePath).outputOption("-vf", "scale=1080:-1") // convert into 1080p
        .on("end", () => {
            console.log("Video Processing Completed")
        })
        .on("error", (err) => {
            console.log(err);
            return "Something went wrong"
        }).save('${processedVideosDirectory}/${videoName}-processed');

    return "Video Processing Completed"
}

/**
 * Uploads a video to a google cloud storage bucket
 * @param videoName
 */
export async function uploadProcessedVideoToGCS(videoName : string){
    const videoPath = `${processedVideosDirectory}/${videoName}-processed`;

    if (!fs.existsSync(videoPath)) {
        return "Video does not exist"
    }

    console.log(videoPath + " exists for processed video upload");

    try{
        await storage.bucket(processedVideosBucketName).upload(videoPath)
        console.log("Processed video uploading successfully");
        return "Video uploaded successfully"
    }catch (err){
        console.log(err);
        console.log("Something went wrong while uploading processed video")
        return "Something went wrong internally"
    }

}

