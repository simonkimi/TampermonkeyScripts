// ==UserScript==
// @name         unipus iTEST助手
// @namespace    http://blog.z31.xyz/
// @version      3.0.0
// @description  自动翻译文章题目材料, 解析听力材料无限听, 内置翻译助手英汉互译, 解除切屏限制, 解除右键菜单与划词限制
// @author       simonkimi
// @match        *://*/*
// @grant        none
// @require      https://cdn.staticfile.org/blueimp-md5/2.16.0/js/md5.min.js
// ==/UserScript==
(async () => {
    'use strict';
    await delay(2000);

    /**
     * 强烈建议自己申请百度翻译api, 免费的
     * 地址: https://api.fanyi.baidu.com/product/11
     * 否则过多人同时使用导致接口反应缓慢, 甚至错误代码
     * @type {{appid: string, key: string}}
     */
    const SETTING = {
        appid: "20200604000485252",  // 自己申请的APPID
        key: "pNz3PfHcz_65fwPV_SYh" // 自己申请的key
    } // 不改也行, 就是会卡点

    if (isItest()) {
        initCss();
        debug();
        disableSelect();
        singleSelect();
        select10from15();
        article();
        articleChoice();
        listenTest();
        setInterval(function () {
            if (window.onblur !== null) {
                window.onblur = null;
            }
        }, 5 * 1000)
    }


    /**
     * 判断是否为Itest平台, 为了防止部分学校定制
     * @returns {boolean}
     */
    function isItest() {
        return document.getElementById('all-content') !== null;
    }


    /**
     * 是否为本地网页, 解除本地网页限制
     */
    function debug() {
        if (window.location.href.indexOf("localhost") !== -1) {
            $("head").append(`<script> src="https://cdn.staticfile.org/blueimp-md5/2.16.0/js/md5.min.js"</script>`)
            $('.goup').removeClass('dis').on('click', function () {
                $('.itest-ques-set').each(function () {
                    const $this = $(this);
                    if ($this.css('display') === 'block' && $this.parent().css('display') === 'block') {
                        if ($this.prev().is('.itest-ques-set')) {
                            $this.prev().css('display', 'block')
                            $this.css('display', 'none')
                        } else if ($this.parent().prev().is('.itest-section')) {
                            $this.parent().prev().css('display', 'block')
                            $this.parent().css('display', 'none')
                        }
                        return false;
                    }

                })
            })
            $('.goto').removeClass('dis').on('click', function () {
                $('.itest-ques-set').each(function () {
                    const $this = $(this);
                    if ($this.css('display') === 'block' && $this.parent().css('display') === 'block') {
                        if ($this.next().is('.itest-ques-set')) {
                            $this.next().css('display', 'block')
                            $this.css('display', 'none')
                        } else if ($this.parent().next().is('.itest-section')) {
                            $this.parent().next().css('display', 'block')
                            $($this.parent().next().find(".itest-ques-set")[0]).css('display', 'block')
                            $this.parent().css('display', 'none')
                        }
                        return false;
                    }
                })
            })
        }
    }


    /**
     * 封装的翻译api
     * @param obj
     * @returns {Promise<unknown>}
     */
    async function translateAjaxApi(obj) {
        return new Promise((resolve, reject) => {
            $.ajax({
                type: "post",
                async: false,
                url: "https://api.fanyi.baidu.com/api/trans/vip/translate",
                dataType: "jsonp",
                data: obj,
                success(data) {
                    resolve(data)
                },
                error() {
                    reject();
                }
            });
        })
    }


    /**
     * 调用翻译api
     * @param context_list
     * @param from
     * @param to
     * @returns {Promise<unknown>}
     */
    async function translateAPI(context_list, from, to) {
        const trans_salt = (new Date).getTime();
        const {appid, key} = getBaiduAPIKey()
        const trans_str = appid + context_list + trans_salt + key;
        const trans_sign = md5(trans_str);

        for (let i = 0; i < 5; i++) {
            const data = await translateAjaxApi({
                q: context_list,
                from,
                to,
                appid: appid,
                salt: trans_salt,
                sign: trans_sign
            })
            if (data.error_code) {
                const errmsg = {
                    "52001": "请求超时",
                    "52002": "系统错误",
                    "52003": "未授权用户",
                    "54003": "访问频率受限",
                    "54004": "账户余额不足",
                    "58002": "服务当前已关闭",
                    "90107": "认证未通过或未生效"
                }
                if (parseInt(data.error_code) !== 54003) {
                    alert(`错误代码${data.error_code} 信息:${errmsg[data.error_code.toString()]}`)
                    throw new Error(`错误代码${data.error_code} 信息:${errmsg[data.error_code.toString()]}`)
                } else {
                    await delay(1000);
                    continue
                }
            }
            return data.trans_result;
        }
        alert("请求过于频繁")
        throw new Error("请求过于频繁");
    }

    /**
     * 返回百度翻译的appid的, 本来打算用户自定义, 最后懒得搞了
     * @returns {{appid: string, key: string}}
     */
    function getBaiduAPIKey() {
        return {appid: SETTING.appid, key: SETTING.key}
    }

    /**
     * 解除选择复制粘贴限制
     */
    function disableSelect() {
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

        hackClass('itest-ques');
        hackClass('itest-direction');
        hackItem(document.body);
        hackItem(document);
    }

    /**
     * async风格的延迟
     * @param time
     * @returns {Promise<unknown>}
     */
    async function delay(time) {
        return new Promise(resolve => {
            setTimeout(resolve, time)
        })
    }

    /**
     * 单选题注入
     */
    function singleSelect() {
        $('.row').each(function () {
            if ($(this).find('.option').length !== 0) {
                $(this).prepend(`<button class="sk-tr-s sk-translate-btn sk-btn-primary sk-btn-p">翻译</button>`)
            }
        })
        $('.sk-tr-s').on('click', function () {
            if ($(this).is('.sk-btn-p')) {
                $(this).parent().find('span').each(function () {
                    $(this).remove();
                })
                const $this = $(this).parent();
                const selectOption = [];
                $this.children('.option').each(function () {
                    selectOption.push($(this).find('label'))
                })
                const p = selectOption.map(value => value.text().replace('\n', '')).join('\n');
                translateAPI(p, 'en', 'zh').then(value => {
                    for (let i = 0; i < value.length; i++) {
                        selectOption[i].append(`<span class="sk-tr-text"><br/>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;${value[i].dst}</span>`)
                    }
                    $(this).removeClass('sk-btn-p').addClass('sk-btn-g').html('清空');
                })
            } else {
                $(this).removeClass('sk-btn-g').addClass('sk-btn-p').html('翻译');
                $(this).parent().find('span').each(function () {
                    $(this).remove();
                })
            }
        })
    }

    /**
     * 15选10注入
     */
    function select10from15() {
        $('.itest-15xuan10>.xxcontent').each(function () {
            $(this).prepend(`<button class="sk-tr-15p sk-translate-btn sk-btn-p" >翻译</button>`)
        })
        $('.sk-tr-15p').on('click', function () {
            // 文章翻译
            $(this).parent().find('span').each(function () {
                $(this).remove();
            })
            const $button = $(this);
            if ($(this).is('.sk-btn-p')) {
                const $passage = $(this).next();
                const passage = $passage.text().replace(/\s+/g, ' ');
                translateAPI(passage, 'en', 'zh').then(value => {
                    value.forEach(i => {
                        $passage.append(`<span class="sk-tr-text"><br><br>${i.dst}</span>`)
                    })
                    $button.removeClass('sk-btn-p').addClass('sk-btn-g').html('清空');
                })
            } else {
                $(this).removeClass('sk-btn-g').addClass('sk-btn-p').html('翻译');
                $(this).parent().find('span').each(function () {
                    $(this).remove();
                })
            }

        })

        $('.itest-15xuan10>.xx').each(function () {
            $(this).prepend(`<button class="sk-tr-15w sk-translate-btn sk-btn-p" style="float: left">翻译</button>`)
        })

        $('.sk-tr-15w').on('click', function () {
            // 单词翻译
            $(this).parent().find('span').each(function () {
                $(this).remove();
            })
            const $button = $(this);
            if ($(this).is('.sk-btn-p')) {
                const $words = $(this).parent().find('a')
                const wordList = [];
                $words.each(function () {
                    wordList.push($(this));
                })
                const data = wordList.map(value => value.text().replace(/\s+/g, ' ')).join('\n');
                translateAPI(data, 'en', 'zh').then(value => {
                    for (let i = 0; i < value.length; i++) {
                        wordList[i].append(`<span class="sk-tr-text"><br/>${value[i].dst}</span>`)
                    }
                    $button.removeClass('sk-btn-p').addClass('sk-btn-g').html('清空');
                })
            } else {
                $(this).removeClass('sk-btn-g').addClass('sk-btn-p').html('翻译');
                $(this).parent().find('span').each(function () {
                    $(this).remove();
                })
            }


        })
    }

    /**
     * 文章注入
     */
    function article() {
        $('.con-left>.article').each(function () {
            $(this).prepend(`<button class="sk-tr-art sk-translate-btn sk-btn-p" >翻译</button>`)
        })
        $('.sk-tr-art').on('click', function () {
            const $button = $(this);
            if ($(this).is('.sk-btn-p')) {
                $(this).parent().find('span').each(function () {
                    $(this).remove();
                })
                const $article = $(this).parent().find("p, div");
                $article.each(function () {
                    $(this).children('br:even').remove();
                    $(this).append('<br>')
                    const $brs = [];
                    $(this).children('br').each(function () {
                        $brs.push($(this));
                    })
                    const text = $(this).html()
                        .split('<br>')
                        .map(value => value.trim().replace(/\s+/g, ' ').replace('&nbsp;', ''))
                        .filter(value => value.length !== 0);
                    (async () => {
                        for (let i = 0; i < text.length; i++) {
                            const data = await translateAPI(text[i], 'en', 'zh')
                            $brs[i].before(`<span class="sk-tr-text"><br/>${data[0].dst}</span>`)
                            await delay(1000);
                        }
                        $button.removeClass('sk-btn-p').addClass('sk-btn-g').html('清空');
                    })()
                })
            } else {
                $(this).removeClass('sk-btn-g').addClass('sk-btn-p').html('翻译');
                $(this).parent().find('span').each(function () {
                    $(this).remove();
                })
            }
        })
    }

    /**
     * 文章单选题注入
     */
    function articleChoice() {
        $('.itest-need-layout').each(function () {
            if ($(this).find('span').length !== 0) {
                $(this).prepend(`<button class="sk-tr-art-r sk-translate-btn sk-btn-p" >翻译</button>`)
            }
        })

        $('.sk-tr-art-r').on('click', function () {
            if ($(this).is('.sk-btn-p')) {
                const $button = $(this);
                const $spanList = []
                $button.parent().find('span').each(function () {
                    $spanList.push($(this))
                })
                const text = $spanList.map(value => value.text())
                    .map(value => value.trim().replace(/\s+/g, ' ').replace('&nbsp;', ''))
                    .join('\n');
                translateAPI(text, 'en', 'zh').then(value => {
                    for (let i = 0; i < value.length; i++) {
                        $spanList[i].append(`<label class="sk-tr-text"><br/>${value[i].dst}</label>`)
                    }
                    $button.removeClass('sk-btn-p').addClass('sk-btn-g').html('清空');
                })
            } else {
                $(this).removeClass('sk-btn-g').addClass('sk-btn-p').html('翻译');
                $(this).parent().find('label').each(function () {
                    $(this).remove();
                })
            }


        })
    }

    /**
     * 解析听力题
     */
    function listenTest() {
        $('.itest-hear-reslist-duration+.itest-ques').each(function () {
            const $this = $(this);
            const $urlNode = $this.parent().find('.itest-hear-reslist');
            if ($urlNode.length !== 0) {
                const mp3List = JSON.parse($urlNode.html());
                mp3List.reverse();
                for (const url of mp3List) {
                    if (url.indexOf('http') !== -1) {
                        $this.children('.itest-danxuan').prepend(`<audio controls="controls" src=${url}>`)
                    }
                }
            }
        })
    }

    /**
     * 初始化CSS
     */
    function initCss() {
        $("head").append(`
        <style>
            .sk-float-btn {
                border-right:2px #dcdcdc solid;
                
            }
            
            .sk-float-btn a {
                user-select: none;
                cursor: pointer;
            }
    
            .sk-float-container {
                z-index: 9999;
                position: absolute;
                width: 500px;
                height: 610px;
                left: 500px;
                top: -610px;
                background: #FAFAFA;
                display: none;
                box-shadow: 0 2px 4px rgba(0, 0, 0, .12), 0 0 6px rgba(0, 0, 0, .04)
            }
    
            .sk-form-item {
                margin: 5px 20px;
            }
    
            .sk-form-item p {
                width: 100%;
                text-align: center;
                padding: 0;
                margin: 5px 0;
            }
    
            .sk-form-item label {
                display: inline-block;
                width: 50px;
            }
    
            .sk-form-item .sk-form-or {
                width: 97%;
                height: 250px;
                resize: none;
                border: none;
                box-shadow: 0 2px 4px rgba(0, 0, 0, .12), 0 0 6px rgba(0, 0, 0, 0.04)
            }
    
            .sk-form-item .sk-form-tr {
                width: 97%;
                height: 250px;
                resize: none;
                border: none;
                background-color: #EEEEEE;
            }
    
            .sk-form-item p {
                font-size: 18px;
                text-align: center;
                width: 100%;
            }
    
            .sk-form-item textarea {
                padding: 5px 10px;
            }
    
            .sk-translate-btn {
                color: #fff;
                padding: 5px 10px;
                border-radius: 20px;
                cursor: pointer;
                opacity: 0.1;
            }
    
            .sk-btn-p {
                background-color: #409eff;
                border: 1px solid #409eff;
            }
    
            .sk-btn-p:hover {
                background-color: rgb(102, 177, 255);
                border: 1px solid rgb(102, 177, 255);
            }
    
            .sk-btn-g {
                background-color: #909399;
                border: 1px solid #909399;
            }
    
            .sk-btn-g:hover {
                background-color: rgb(166, 169, 173);
                border: 1px solid rgb(166, 169, 173);
            }
            
            .sk-tr-text {
                color: #000000;
            }
            </style>
        `)
        $('#footer .right').append(`
            <li class="sk-float-btn">
                <a>翻译</a>
                <div class="sk-float-container">
                    <div class="sk-form">
                        <div class="sk-form-item">
                            <p>翻译助手</p>
                        </div>
                        <div class="sk-form-item">
                            <button class="sk-btn-p sk-translate-btn btn-e-z">英 → 汉</button>
                            <button class="sk-btn-p sk-translate-btn btn-z-e">汉 → 英</button>
                        </div>
                        <div class="sk-form-item">
                            <textarea class="sk-form-or sk-tx-f" placeholder="等待翻译中..."></textarea>
                        </div>
                        <div class="sk-form-item">
                            <textarea class="sk-form-tr sk-tx-t" readonly></textarea>
                        </div>
                    </div>
                </div>
            </li>
        `)
        $('.btn-e-z').on('click', function () {
            translateAPI($('.sk-tx-f').val(), 'en', 'zh').then(value => {
                $('.sk-tx-t').val(value.map(value => value.dst).join(""))
            })
        })
        $('.btn-z-e').on('click', function () {
            translateAPI($('.sk-tx-f').val(), 'zh', 'en').then(value => {
                $('.sk-tx-t').val(value.map(value => value.dst).join(""))
            })
        })
        $('.sk-float-btn a').on('click', function () {
            const $float = $('.sk-float-container');
            $float.css('display', $float.css('display') === 'none' ? 'block' : 'none')
        })
    }


})()