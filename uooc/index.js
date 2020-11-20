// ==UserScript==
// @name         UOOC优课在线助手
// @namespace    http://blog.z31.xyz/
// @version      0.0.1
// @description  自动看视频, 解除鼠标移出就暂停限制
// @author       simonkimi
// @match        http://www.uooconline.com/home/learn/**
// @grant        none
// ==/UserScript==
'use strict';

const DEBUG = false;

(async () => {
    console.log("[UOOC助手] 开始运行")
    if (!DEBUG) await sleep(2000)
    findRank2Class(findNowChapter())

    function findNowChapter() {
        const upArrow = $(".icon-xiangshang").not(".icon-xiangxia")
        for (const e of upArrow) {
            if ($(e).parent().has('.chapter')) {
                return upArrow.parent().parent()
            }
        }
        throw new Error("[UOOC助手] 未找到当前章节")
    }

    function findRank2Class(rank1Node) {
        const rank2 = $(rank1Node).find(".rank-2>li>div").not(".complete").not(".resourcelist")[0]
        if (rank2) {
            return $(rank2).parent()
        }
        return null
    }

    function findRank3Class(rank2Node) {
        let children = $(rank2Node).children("div")
        if (children.length === 1) {
            children[0].click()
            sleep(2000)
            children = $(rank2Node).children("div")
        }
        return children[1]
    }

    async function sleep(time) {
        return new Promise(resolve => {
            setTimeout(resolve, time)
        })
    }
})()