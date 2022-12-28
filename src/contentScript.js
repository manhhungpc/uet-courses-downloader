"use strict";
import JSZip from "jszip";
import JSZipUtils from "jszip-utils";
import saveAs from "file-saver";

chrome.runtime.onMessage.addListener((message, sender, response) => {
    const { downloadList } = message;

    //if click button, then download. Else return only file's title
    if (downloadList) {
        saveAsZip(downloadList).then((res) => response(res));
    } else {
        getFileInfo().then(response);
    }

    return true;
});

const getFileInfo = async () => {
    let listUrls = [];
    let activity = document.querySelectorAll(".activityname");

    for (let i = 0; i < activity.length; i++) {
        let fileNameLength = document.querySelectorAll(".instancename")[i].innerText.length;
        let fileName = document.querySelectorAll(".instancename")[i].innerText.substr(0, fileNameLength - 4);
        let baseUrl = activity[i].childNodes[1].href;

        if (baseUrl.match(/https:\/\/courses.uet.vnu.edu.vn\/mod\/resource\//) != null) {
            listUrls.push({ baseUrl, fileName });
        }
    }
    return listUrls;
};

const saveAsZip = async (downloadList) => {
    const subjectTitle = document.head.getElementsByTagName("title")[0].innerHTML;
    let zipFilename = subjectTitle.split(" (")[0].substring(5) + ".zip";
    let zip = new JSZip();
    let count = 0;

    downloadList.forEach(({ url, fileName }) => {
        JSZipUtils.getBinaryContent(url, {
            progress: function (e) {
                chrome.runtime.sendMessage({
                    name: fileName,
                    percent: e.percent.toFixed(2),
                });
            },
            callback: function (err, data) {
                if (err) {
                    chrome.runtime.sendMessage({
                        failDownload: true,
                    });
                    console.log(fileName, err);
                    return "err";
                }

                let fileExtension = url.split(".").pop(); // .pdf, .docx, .pptx, ...
                if (fileExtension.includes("?")) fileExtension = fileExtension.substring(0, fileExtension.indexOf("?"));
                zip.file(`${fileName}.${fileExtension}`, data, { binary: true });
                count++;

                if (count == downloadList.length) {
                    zip.generateAsync({
                        type: "blob",
                        compression: "DEFLATE",
                        //streamFiles: true,
                        compressionOptions: {
                            /* compression level ranges from 1 (best speed) to 9 (best compression) */
                            level: 5,
                        },
                    }).then(function (content) {
                        saveAs(content, zipFilename);
                        chrome.runtime.sendMessage({
                            downloaded: true,
                        });
                    });
                }
            },
        });
    });
    return true;
};
