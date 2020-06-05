// ==UserScript==
// @name         unipus iTEST助手
// @namespace    http://blog.z31.xyz/
// @version      2.0
// @description  自动翻译文章题目材料, 解析听力材料无限听, 内置翻译助手英汉互译, 解除切屏限制, 解除右键菜单与划词限制
// @author       simonkimi
// @match        https://itestcloud.unipus.cn/itest-api/itest/s/answer/**
// @grant        none
// ==/UserScript==
(async () => {
    'use strict';
    document.write("<script type='text/javascript' src='http://www.veryhuo.com/uploads/Common/js/jQuery.md5.js'></script>");
    await delay(2000);
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
    }, 5 * 5000)

    /**
     * 是否为本地网页, 解除本地网页限制
     */
    function debug() {
        if (window.location.href.indexOf("itestcloud.unipus.cn") === -1) {
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
                            $this.parent().css('display', 'none')
                        }
                        return false;
                    }
                })
            })
        }
    }




    async function translateAjaxApi(obj) {
        return new Promise((resolve, reject) => {
            $.ajax({
                type: "post",
                async: false,
                url: "https://api.fanyi.baidu.com/api/trans/vip/translate",
                dataType: "jsonp",
                data: {...obj},
                success: function (data) {
                    resolve(data)
                },
                error: function () {
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
        const trans_sign = $.md5(trans_str);

        for (let i=0; i<5; i++) {
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
                }
            }
            return data.trans_result;
        }
        alert("请求过于频繁")
        throw new Error("请求过于频繁");
    }

    function getBaiduAPIKey() {
        return {appid: "20200603000484959", key: "Fz6UttgcMXATCddMMZW1"}
    }

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
                        selectOption[i].append(`<span style="color: #5093df"><br/>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;${value[i].dst}</span>`)
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
                        $passage.append(`<span style="color: #5093df"><br><br>${i.dst}</span>`)
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
                        wordList[i].append(`<span style="color: #5093df"><br/>${value[i].dst}</span>`)
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
                const $article = $(this).parent().find("div[style='text-align:justify']");
                $article.children('br:even').remove();
                $article.append('<br>')
                const $brs = [];
                $article.children('br').each(function () {
                    $brs.push($(this));
                })
                const text = $article.html()
                    .split('<br>')
                    .map(value => value.trim().replace(/\s+/g, ' ').replace('&nbsp;', ''))
                    .filter(value => value.length !== 0);
                (async () => {
                    for (let i=0; i<text.length; i++) {
                        const data = await translateAPI(text[i], 'en', 'zh')
                        $brs[i].before(`<span style="color: #5093df"><br/>${data[0].dst}</span>`)
                        await delay(1000);
                    }
                    $button.removeClass('sk-btn-p').addClass('sk-btn-g').html('清空');
                })()
            } else {
                $(this).removeClass('sk-btn-g').addClass('sk-btn-p').html('翻译');
                $(this).parent().find('span').each(function () {
                    $(this).remove();
                })
            }
        })
    }

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
                    for (let i=0; i<value.length; i++) {
                        $spanList[i].append(`<label style="color: #5093df"><br/>${value[i].dst}</label>`)
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

    function initCss() {
        const styleNode = document.createElement("style");
        styleNode.innerHTML = `
        .sk-float-btn {
            position: fixed;
            bottom: 5%;
            right: 2%;
            width: 40px;
            height: 40px;
            border-radius: 50%;
            background-color: #00a7c8;
            box-shadow: 0 2px 4px rgba(0, 0, 0, .12), 0 0 6px rgba(0, 0, 0, .04);
            cursor: pointer;
        }

        .sk-float-btn span {
            display: inline-block;
            width: 40px;
            line-height: 40px;
            color: #fff;
            text-align: center;
            font-size: 20px;
            user-select: none;
            cursor: pointer;
        }

        .sk-float-container {
            position: absolute;
            width: 500px;
            height: 610px;
            left: -500px;
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
        `;
        document.head.appendChild(styleNode);
    }
    $('body').append(`
    <div class="sk-float-btn">
        <span>译</span>
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
                    <textarea id="sk-tx-f" class="sk-form-or" placeholder="等待翻译中..."></textarea>
                </div>
                <div class="sk-form-item">
                    <textarea id="sk-tx-t" class="sk-form-tr" readonly></textarea>
                </div>
            </div>
        </div>
    </div>
    `)
    $('.btn-e-z').on('click', function () {
        translateAPI($('#sk-tx-f').val(), 'en', 'zh').then(value => {
            $('#sk-tx-t').val(value.map(value => value.dst).join(""))
        })
    })
    $('.btn-z-e').on('click', function () {
        translateAPI($('#sk-tx-f').val(), 'zh', 'en').then(value => {
            $('#sk-tx-t').val(value.map(value => value.dst).join(""))
        })
    })
    $('.sk-float-btn span').on('click', function () {
        const $float = $('.sk-float-container');
        $float.css('display', $float.css('display') === 'none'? 'block': 'none')
    })


})()