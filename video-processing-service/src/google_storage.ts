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
        ffmpeg(filePath).outputOption("-vf", "scale=1080:-1") // convert into 1080p
            .on("end", () => {
                console.log("Video Processing Completed")
                resolve();
            })
            .on("error", (err) => {
                console.log(err);
                reject();
            }).save(outputFilePath);
    })
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
     if (fs.existsSync(`${rawVideosDirectory} + ${videoName}`)) {
         fs.unlinkSync(`${rawVideosDirectory} + ${videoName}`)
         console.log("Raw video deleted successfully")
     }

    if (fs.existsSync(`${processedVideosDirectory} + ${videoName}`)) {
        fs.unlinkSync(`${processedVideosDirectory} + ${videoName}`)
         console.log("Processed video deleted successfully")
    }
}

