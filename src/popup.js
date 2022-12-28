"use strict";

document.addEventListener("DOMContentLoaded", main);

async function main() {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    let checkedAll = true;

    chrome.tabs.sendMessage(tab.id, {}, (responseFiles) => {
        const list = document.getElementById("list-files");
        let listLength = responseFiles.length;

        if (listLength == 0) document.getElementById("title").textContent = "Không có file nào để tải!";
        else document.getElementById("num-files").textContent = listLength;

        responseFiles.forEach((fileData) => {
            const fileCheckbox = document.createElement("input");
            const fileLabel = document.createElement("label");
            const loadedPercent = document.createElement("div");
            const div = document.createElement("div");

            div.className = "wrap-list-file";
            loadedPercent.className = "show-percent";
            loadedPercent.setAttribute("data-loaded", fileData.fileName);
            fileCheckbox.className = "file-checkbox";
            fileCheckbox.setAttribute("type", "checkbox");
            fileCheckbox.setAttribute("value", fileData.baseUrl);
            fileCheckbox.checked = true;
            fileLabel.className = "file-label";

            fileLabel.appendChild(fileCheckbox);
            div.appendChild(fileLabel);
            div.appendChild(loadedPercent);
            list.appendChild(div);
            fileLabel.appendChild(document.createTextNode(fileData.fileName));
        });

        setChangeDownloadList(listLength);
    });

    startDownload(tab);

    document.getElementById("set-checked").addEventListener("click", () => {
        document.getElementById("loading-label").textContent = null;
        checkedAll = toggleCheckAll(checkedAll);
        document.getElementById("set-checked").textContent = checkedAll ? "Bỏ chọn toàn bộ" : "Chọn toàn bộ";
    });
}

const startDownload = (tab) => {
    const errorDisplay = document.getElementById("error");
    const loadingLabel = document.getElementById("loading-label");
    const loading = document.getElementById("loading");
    document.getElementById("download").addEventListener("click", async (e) => {
        e.preventDefault();
        errorDisplay.textContent = "";
        loadingLabel.textContent = "";
        loading.style.display = "block";

        const downloadList = await getDownloadList();
        if (downloadList.length == 0) {
            loading.style.display = "none";
            errorDisplay.innerHTML = "Chọn ít nhất 1 file để tải &#9888;";
            return;
        }

        chrome.tabs.sendMessage(tab.id, {
            downloadList: downloadList,
        });

        loadingLabel.textContent = "Đang làm việc với máy của bạn...";
        setTimeout(() => {
            if (loading.style.display == "block") loadingLabel.textContent += " Đang tải, bạn chờ tí nhé!";
        }, 10000);

        console.log(downloadList);
        chrome.runtime.onMessage.addListener(function (response, sender) {
            let fail = 0;
            if (response.percent) {
                document.querySelector(`[data-loaded="${response.name}"]`).textContent =
                    response.percent != "100.00" ? `${response.percent}%` : "100%";
                document.querySelector(
                    `[data-loaded="${response.name}"]`
                ).style.cssText = `font-weight: 600; color: #4bb543;`;
            }
            if (response.downloaded) {
                document.querySelectorAll(".file-label").forEach((label) => {
                    if (!downloadList.find((download) => download.fileName === label.childNodes[1].textContent)) {
                        label.parentElement.childNodes[1].textContent = "100%";
                        label.parentElement.childNodes[1].style.display = "none";
                    }
                });
                const listPercent = document.querySelectorAll(".show-percent");
                listPercent.forEach((data) => {
                    if (data.textContent != "100%") {
                        data.textContent = "Lỗi";
                        data.style.color = "#ff3333";
                        data.style.fontWeight = "600";
                        fail++;
                    }
                });
                loadingLabel.textContent = "Đã tải xong :>";
                document.getElementById("success").textContent = `Tải ${downloadList.length - fail} file thành công`;
                errorDisplay.textContent = fail != 0 ? `Có ${fail} file lỗi` : "";

                loading.style.display = "none";
            }
            if (response.failDownload) {
                loadingLabel.style.display = "none";
                loading.style.display = "none";
                errorDisplay.textContent = "Đã có lỗi :< Kiểm tra internet hoặc tải lại trang";
            }
        });
    });
};

const toggleCheckAll = (checkedAll) => {
    const filesCount = document.querySelectorAll(".file-label").length;
    document.querySelectorAll(".file-label").forEach(function (file) {
        file.childNodes[0].checked = !checkedAll;
    });

    document.getElementById("num-files").textContent = checkedAll ? 0 : filesCount;
    setChangeDownloadList(checkedAll ? 0 : filesCount);

    return !checkedAll;
};

const setChangeDownloadList = (listLength) => {
    document.querySelectorAll(".file-checkbox").forEach(function (file) {
        file.addEventListener("change", function () {
            if (file.checked == false) listLength--;
            else listLength++;
            document.getElementById("num-files").textContent = listLength;
        });
    });
};

const getDownloadList = async () => {
    const listFile = document.querySelectorAll(".file-label");
    const downloadList = [];
    let countFile = 0;
    for (let i = 0; i < listFile.length; i++) {
        let file = listFile[i];

        if (file.childNodes[0].checked) {
            const url = await redirectedUrl(file.childNodes[0].value);
            const fileName = file.childNodes[1].nodeValue;
            downloadList.push({ url, fileName });
            document.getElementById("loading-label").textContent = `Đang lấy data ${countFile++}/${
                document.getElementById("num-files").textContent
            } file`;
        }
    }
    return downloadList;
};

const redirectedUrl = async (baseUrl) => {
    const response = await fetch(baseUrl, {
        method: "GET",
    });
    return response.url;
};
