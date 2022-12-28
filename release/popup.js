(()=>{"use strict";(()=>{document.addEventListener("DOMContentLoaded",(async function(){const[l]=await chrome.tabs.query({active:!0,currentWindow:!0});let o=!0;chrome.tabs.sendMessage(l.id,{},(e=>{const t=document.getElementById("list-files");let l=e.length;0==l?document.getElementById("title").textContent="Không có file nào để tải!":document.getElementById("num-files").textContent=l,e.forEach((e=>{const n=document.createElement("input"),l=document.createElement("label"),o=document.createElement("div"),c=document.createElement("div");c.className="wrap-list-file",o.className="show-percent",o.setAttribute("data-loaded",e.fileName),n.className="file-checkbox",n.setAttribute("type","checkbox"),n.setAttribute("value",e.baseUrl),n.checked=!0,l.className="file-label",l.appendChild(n),c.appendChild(l),c.appendChild(o),t.appendChild(c),l.appendChild(document.createTextNode(e.fileName))})),n(l)})),e(l),document.getElementById("set-checked").addEventListener("click",(()=>{document.getElementById("loading-label").textContent=null,o=t(o),document.getElementById("set-checked").textContent=o?"Bỏ chọn toàn bộ":"Chọn toàn bộ"}))}));const e=e=>{const t=document.getElementById("error"),n=document.getElementById("loading-label"),o=document.getElementById("loading");document.getElementById("download").addEventListener("click",(async c=>{c.preventDefault(),t.textContent="",n.textContent="",o.style.display="block";const d=await l();if(0==d.length)return o.style.display="none",void(t.innerHTML="Chọn ít nhất 1 file để tải &#9888;");chrome.tabs.sendMessage(e.id,{downloadList:d}),n.textContent="Đang làm việc với máy của bạn...",setTimeout((()=>{"block"==o.style.display&&(n.textContent+=" Đang tải, bạn chờ tí nhé!")}),1e4),chrome.runtime.onMessage.addListener((function(e,l){let c=0;if(e.percent&&(document.querySelector(`[data-loaded="${e.name}"]`).textContent="100.00"!=e.percent?`${e.percent}%`:"100%",document.querySelector(`[data-loaded="${e.name}"]`).style.cssText="font-weight: 600; color: #4bb543;"),e.downloaded){const e=document.querySelectorAll(".show-percent");e.forEach((e=>{"100%"!=e.textContent&&(e.textContent="Lỗi",e.style.color="#ff3333",e.style.fontWeight="600",c++)})),n.textContent="Đã tải xong :>",document.getElementById("success").textContent=`Tải ${e.length-c} file thành công`,t.textContent=0!=c?`Có ${c} file lỗi`:"",o.style.display="none"}e.failDownload&&(n.style.display="none",o.style.display="none",t.textContent="Đã có lỗi :< Kiểm tra internet hoặc tải lại trang")}))}))},t=e=>{const t=document.querySelectorAll(".file-label").length;return document.querySelectorAll(".file-label").forEach((function(t){t.childNodes[0].checked=!e})),document.getElementById("num-files").textContent=e?0:t,n(e?0:t),!e},n=e=>{document.querySelectorAll(".file-checkbox").forEach((function(t){t.addEventListener("change",(function(){0==t.checked?e--:e++,document.getElementById("num-files").textContent=e}))}))},l=async()=>{const e=document.querySelectorAll(".file-label"),t=[];let n=0;for(let l=0;l<e.length;l++){let c=e[l];if(c.childNodes[0].checked){const e=await o(c.childNodes[0].value),l=c.childNodes[1].nodeValue;t.push({url:e,fileName:l}),document.getElementById("loading-label").textContent=`Đang lấy data ${n++}/${document.getElementById("num-files").textContent} file`}}return t},o=async e=>(await fetch(e,{method:"GET"})).url})()})();