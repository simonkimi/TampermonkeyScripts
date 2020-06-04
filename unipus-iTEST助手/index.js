// ==UserScript==
// @name         unipus iTEST助手
// @namespace    http://blog.z31.xyz/
// @version      1.2
// @description  解除考试复制粘贴划词限制, 内置听力播放器无限听材料
// @author       simonkimi
// @match        https://itestcloud.unipus.cn/itest-api/itest/s/answer/**
// @grant        none
// ==/UserScript==


(async () => {
    'use strict';
    while (true) {
        await delay(500);
        if (document.getElementsByClassName('itest-ques').length !== 0) {
            break;
        }
    }
    hackClass('itest-ques');
    hackClass('itest-direction');
    hackItem(document.body);
    initFloatTable();

    function hackClass(className) {
        for (const i of document.getElementsByClassName(className)) {
            hackItem(i);
        }
    }


    function hackItem(item) {
        item.onpaste = () => true;
        item.oncontextmenu = () => true;
        item.onselectstart = () => true;
        item.ondragstart = () => true;
        item.oncopy = () => true;
        item.onbeforecopy = () => true;
        item.style = '';
    }

    async function delay(time) {
        return new Promise(resolve => {
            setTimeout(resolve, time)
        })
    }


    function findListenUrl() {
        console.log("点击下一页");
        const $quesSet = $('.itest-ques-set');
        let hasFind = false;
        $quesSet.each(function () {
            const $this = $(this);
            if ($this.css('display') === 'block' && $this.parent().css('display') === 'block') {

                const $urlNode = $this.find('.itest-hear-reslist');
                if ($urlNode.length !== 0) {
                    const mp3List = JSON.parse($urlNode.html());
                    if (mp3List.length !== 0) {
                        hasFind = true;
                        const $skFloat = $('#sk-container');
                        $skFloat.empty();
                        let index = 1;
                        for (const url of mp3List) {
                            console.log(url);
                            if (url.indexOf('http') !== -1) {
                                $skFloat.append(`<a class="sk-audio-href" href="javascript:;" data-href="${url}">第${index}段</a><br>`);
                                index += 1;
                            }
                        }

                        $('.sk-audio-href').each(function () {
                            const $href = $(this);
                            $href.on('click', function () {
                                const audio = document.getElementById('sk-audio');
                                audio.src = $href.attr('data-href');
                                audio.currentTime = 0;
                                audio.play();
                            })
                        });
                        return false;
                    }
                }

            }
        });
        $('.sk-float').css('display', hasFind ? 'block' : 'none')
    }

    function initFloatTable() {
        const styleNode = document.createElement("style");
        styleNode.innerHTML = `
            .sk-float {
                left: 10px;
                bottom: 10px;
                background: #1a59b7;
                color: #ffffff;
                overflow: hidden;
                z-index: 9999;
                position: fixed;
                padding: 5px;
                text-align: center;
                width: 175px;
                border-radius: 4px;
                display: none;
            }
            
            .sk-play {
                margin: 5px 0;
            }
    
            .sk-play a {
                color: white;
                font-size: 12px;
                text-decoration: none;
            }
    
            #sk-container a {
                color: white;
                text-decoration: none;
            }
    
            .sk-float p {
                margin: 5px 0;
            }
        `;
        document.head.appendChild(styleNode);
        $('body').append(`
            <div class="sk-float">
                <audio id="sk-audio"></audio>
                <p>听力材料</p>
                <div id="sk-container">
                </div>
                <div class="sk-play">
                    <a href="javascript:void(0)" onclick="document.getElementById('sk-audio').play()">播放</a>
                    <a href="javascript:void(0)" onclick="document.getElementById('sk-audio').pause()">暂停</a>
                    <a href="javascript:void(0)" onclick="document.getElementById('sk-audio').currentTime = 0; document.getElementById('sk-audio').pause()">停止</a>
                </div>
            </div>
        `);
        $('.goup').on('click', function () {
            setTimeout(findListenUrl, 500);
        });
        $('.goto').on('click', function () {
            setTimeout(findListenUrl, 500);
        });
    }
})();

