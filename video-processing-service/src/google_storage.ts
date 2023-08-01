// Hold all of our Google Cloud Storage related functions
// Download videos from google cloud storage and upload videos to google cloud storage

import { Storage } from '@google-cloud/storage';
import fs from "fs";
import ffmpeg from "fluent-ffmpeg";
import {rejects} from "assert";

const storage = new Storage();

const rawVideosBucketName = "video-service-raw12345-videos2002";
const processedVideosBucketName = "video-service-processed12345-videos2002";


export const rawVideosDirectory = "./raw-videos";
export const processedVideosDirectory = "./processed-videos";

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
      destination : pathDestination// this is where we will store the video locally
    }

    if (!fs.existsSync(rawVideosDirectory)) {
        return "Path does not exist"
    }

    console.log(rawVideosDirectory + " exists");

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
 * @param videoName
 * @param filePath
 */

export async function processVideo (videoName : string, filePath : string){
    const outputFilePath = `${processedVideosDirectory}/${videoName}` as string;
    return new Promise<void>((resolve, reject) => {
        ffmpeg(filePath)
          .outputOptions(["-vf", "scale=720:-1", "-r", "30", "-c:v libx264", "-preset ultrafast"]) // 720p
          .on("end", function () {
            console.log("Processing finished successfully");
            resolve();
          })
          .on("error", function (err: any) {
            console.log("An error occurred: " + err.message);
            reject(err);
          })
          .save(`${processedVideosDirectory}/${videoName}`);
    });
    // return new Promise<void>((resolve, reject) => {
    //     ffmpeg(filePath)
    //         .outputOptions(["-vf", "scale=-1:720", "-r", "30", "-c:v libx264", "-preset ultrafast"]) // Scale video to 720p height (maintaining aspect ratio), set frame rate to 30 fps, set video codec to libx264 (H.264), set ultrafast preset for faster encoding
    //         .output(outputFilePath) // Set the output file path
    //     .on("end", () => {
    //         console.log("Video processing completed");
    //     })
    //     .on("error", (err) => {
    //         console.error("Error during video processing:", err);
    //     })
    //     .run();
    // });
}

/**
 * Uploads a video to a google cloud storage bucket
 * @param videoName
 */
export async function uploadProcessedVideoToGCS(videoName : string){
    const videoPath = `${processedVideosDirectory}/${videoName}`;

    if (!fs.existsSync(videoPath)) {
        return "Video does not exist"
    }

    console.log(videoPath + " exists for processed video upload");

    try{
        await storage.bucket(processedVideosBucketName).upload(videoPath, {
      destination: videoName,
    })
        await storage.bucket(processedVideosBucketName).file(videoName).makePublic() // make the video public
        console.log("Processed video uploading successfully");
        return "Video uploaded successfully"
    }catch (err){
        console.log(err);
        console.log("Something went wrong while uploading processed video")
        return "Something went wrong internally"
    }
}

export function deleteRawVideoFromGCS(videoName : string){
    if (!videoName){
        return "Video name is missing"
    }

    try{
        storage.bucket(rawVideosBucketName).file(videoName).delete().then(r => console.log(r))
        console.log("Raw video deleted successfully")
        return "Video deleted successfully"
    }catch (err){
        console.log(err);
        console.log("Something went wrong while deleting raw video")
        return "Something went wrong internally"
    }
}

export function deleteRawAndProcessedFromDirectory (videoName : string){
     if (fs.existsSync(`${rawVideosDirectory}/${videoName}`)) {
         fs.unlinkSync(`${rawVideosDirectory}/${videoName}`)
         console.log("Raw video deleted successfully")
     }

    if (fs.existsSync(`${processedVideosDirectory}/${videoName}`)) {
        fs.unlinkSync(`${processedVideosDirectory}/${videoName}`)
         console.log("Processed video deleted successfully")
    }
}

