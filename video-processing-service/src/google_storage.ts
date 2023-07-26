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

}

export async function uploadRawVideoToGCS(videoName: string) {

}

/**
 * Downloads a video from a google cloud storage bucket
 * @param videoName
 */
export async function downloadRawVideoFromGCS(videoName: string) {

}

/**
 * processes a video using ffmpeg
 * @param processedVideoName
 */
export function processVideo (processedVideoName : string){

}

/**
 * Uploads a video to a google cloud storage bucket
 * @param videoName
 */
export function uploadProccessedVideoToGCS(videoName : string){

}

