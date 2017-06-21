var fs = require('fs')
var gd
var async = require('async')
var node_cmd = process.env['NODE_CMD'] || ''
if (node_cmd.indexOf('node4') < 0) {
    gd   = require('node-gd')
} else {
    gd   = require('node-gd2')
}

var ms = {
    log : require('log')
}
// --------------------------------------------------------------------------------------------
var _r_path = './'
var _canvas_config = {
    'font_path' : _r_path + 'font/msyh.ttf',
    'img_path'  : _r_path + 'img/',
    'bg_path'   : _r_path + 'img/card_bg.jpg',
    'des_img'   : {
        'width'      : 358,
        'height'     : 398,
        'x'          : 28,
        'y'          : 26,
    },
    'des_content' : {
        'm_char_len' : 42,
        'x'          : 470,
        'y'          : 72,
        'pre_h'      : 36,
        'max_line'   : 3,
        'font_color' : gd.trueColorAlpha(107, 57, 48, 1),
        'font_size'  : 12,
    },
    'des_info' : {
        'x'          : 564,
        'y'          : 205,
        'font_color' : gd.trueColorAlpha(107, 57, 48, 1),
        'font_size'  : 12,
    },
    'des_date' : {
        'x'          : 730,
        'y'          : 230,
        'font_color' : gd.trueColorAlpha(107, 57, 48, 1),
        'font_size'  : 12,
    }
}
var _gd_open = {
    'png'  : gd['openPng'],
    'jpg'  : gd['openJpeg'],
    'jpeg' : gd['openJpeg']
}
// --------------------------------------------------------------------------------------------
// ret : 
//     '2' : '原始图片路径有误',
//     '3' : '裁剪图片失败',
//     '4' : '合成图片背景路径有误',
//     '5' : '生成图片失败',
//     '6' : '保存图片失败'
// --------------------------------------------------------------------------------------------
function canvas_img(src, callback) {
    var result = {}
    var canvas_config = _canvas_config
    async.waterfall([
        function(cb) {
            // 读取目标图片
            var type_idx = (src.img_src.lastIndexOf('/') || 0) + 1
            var img      = src.img_src.substring(type_idx).split('.')
            var img_name = img[0]
            var img_type = img[1]
            
            var img_src  = canvas_config.img_path + img_name + '.' + img_type
            _gd_open[img_type](img_src, function(err, img) {
                if (err) {
                    ms.log.error('打开图片失败', err, img_src)
                    cb(2); return
                }
                result.img_temp = img
                cb()
            })
        },
        function(cb) {
            // 缩放图片
            var w1 = parseInt(src.width)
            var h1 = parseInt(w1 * result.img_temp.height / result.img_temp.width)
            gd.createTrueColor(w1, h1, function(err, img) {
                if (err) {
                    ms.log.error('缩放图片失败', err, src.img_src)
                    cb(3); return
                }
                result.img_temp.copyResampled(img, 0, 0, src.des_x, src.des_y, w1, h1, result.img_temp.width, result.img_temp.height)
                result.img_src = img
                result.img_src.saveJpeg('./sx1.jpg', 90)
                result.img_temp.destroy()
                cb()
            })
        },
        function(cb) {
            // 裁剪图片
            if (!src.ret_w || !src.ret_h) {
                cb(); return
            }

            gd.createTrueColor(src.ret_w, src.ret_h, function(err, img) {
                if (err) {
                    ms.log.error('裁剪图片失败', err, src.img_src)
                    cb(3); return
                }
                result.img_src.copyResampled(img, 0, 0, src.des_x, src.des_y, src.ret_w, src.ret_h, src.ret_w, src.ret_h)
                result.img_src.destroy()
                img.saveJpeg('./sx2.jpg', 90)
                result.img_src = img
                cb()
            })
        },
        function(cb) {
            // 放大图片
            if (!src.ret_w || !src.ret_h) {
                cb(); return
            }

            var d_i_c = canvas_config.des_img
            gd.createTrueColor(d_i_c.width, d_i_c.height, function(err, img) {
                if (err) {
                    ms.log.error('裁剪图片失败', err, src.img_src)
                    cb(3); return
                }
                result.img_src.copyResampled(img, 0, 0, 0, 0, d_i_c.width, d_i_c.height, result.img_src.width,result.img_src.height)
                result.img_src.destroy()
                img.saveJpeg('./sx3.jpg', 90)
                result.img_src = img
                cb()
            })
        },
        function(cb) {
            // 读取背景图
            _gd_open['jpg'](canvas_config.bg_path, function(err, img) {
                if (err) {
                    ms.log.error('合成图片背景路径有误', err, src.type, canvas_config.bg_path)
                    cb(4); return
                }
                result.img_bg = img
                cb()
            })
        },
        function(cb) {
            // 合成图片
            var width  = result.img_bg.width
            var height = result.img_bg.height
            gd.createTrueColor(width, height, function(err, img) {
                if (err) {
                    ms.log.error('生成新图片失败', err)
                    cb(5); return
                }
                var d_i_c = canvas_config.des_img
                result.img_bg.copyResampled(img, 0, 0, 0, 0, width, height, width, height)
                result.img_src.copyResampled(img, d_i_c.x, d_i_c.y, 0, 0, d_i_c.width, d_i_c.height, d_i_c.width, d_i_c.height)
                result.img_des = img 
                result.img_bg.destroy()
                result.img_src.destroy()
                cb()
            })
        },
        function(cb) {
            // 写内容
            var d_c_c = canvas_config.des_content
            split_str(src.content, d_c_c.m_char_len, function(content_arr) {
                var init_y = content_arr.length >= d_c_c.max_line ? d_c_c.y : (d_c_c.y + parseInt((3-content_arr.length) * d_c_c.pre_h /2))
                for (var i = 0; i < content_arr.length; i++) {
                    var y = init_y + i * d_c_c.pre_h
                    result.img_des.stringFT(d_c_c.font_color, _canvas_config.font_path, d_c_c.font_size, 0, d_c_c.x, y, content_arr[i])
                }
                cb()
            })
        },
        function(cb) {
            // 写服务器、角色名
            var d_i_c = canvas_config.des_info
            var str   = src.name
            var c_len = get_charlen(str)
            console.log(c_len)
            var x     = d_i_c.x + (29 - c_len) * 8
            result.img_des.stringFT(d_i_c.font_color, _canvas_config.font_path, d_i_c.font_size, 0, x, d_i_c.y, str)
            cb()
        },
        function(cb) {
            // 写日期
            var d_d_c = canvas_config.des_date
            result.img_des.stringFT(d_d_c.font_color, _canvas_config.font_path, d_d_c.font_size, 0, d_d_c.x, d_d_c.y, src.card_date.replace(/-/g, '.'))
            cb()
        },
        function(cb) {
            // 保存图片
            var card_name = 'abcd.jpg'
            var path      = canvas_config.img_path + card_name
            result.img_des.saveJpeg(path, 90, function(err) {
                if (err) {
                    ms.log.error('保存图片失败', err)
                    cb(6); return
                }
                result.img_des.destroy()

                ms.log.info('canvas_img success.', card_name)
                var card_src = _r_path + '_att/' + card_name
                callback(null, card_src)
            })
        }
    ], function(err) {
        err && callback(err)
    })
}
// --------------------------------------------------------------------------------------------
function split_str(str, max, callback) {
    var result = []
    function get_length(str, s_idx, max, callback){
        var char_length = 0;
        if (s_idx >= str.length) {
            callback && callback(result) 
            return
        }
        for (var i = s_idx; ; i++){
            var son_char = str.charAt(i);
            if (encodeURIComponent(son_char).length > 2) {
                char_length += 2
            } else {
                char_length += 1
            }


            if (char_length >= max || i == str.length) {
                var next_s_idx = char_length > max ? i-1 : i
                var temp = str.substring(s_idx, next_s_idx)
                result.push(temp)
                get_length(str, next_s_idx, max, callback)
                break
            }
        }
    }
    get_length(str, 0, max, callback)
}
// --------------------------------------------------------------------------------------------
function get_charlen(str) {
    var char_length = 0;
    for (var i = 0; i < str.length; i++){
        var son_char = str.charAt(i);
        if (encodeURIComponent(son_char).length > 2) {
            char_length += 2
        } else {
            char_length += 1
        }
    }
    return char_length
}
// --------------------------------------------------------------------------------------------
function getUUID() {
    var d = new Date().getTime()
    var uuid = 'xxyxxxx4xxxxyxxxx5xxxxxx'.replace(/[xy]/g, function(c) {
        var r = (d + Math.random()*16)%16 | 0
        d = Math.floor(d/16)
        return (c=='x' ? r : (r&0x3|0x8)).toString(16)
    })
    return uuid
}
// --------------------------------------------------------------------------------------------
// eg :
// --------------------------------------------------------------------------------------------
var test_data = {
    'name'          : '我就是我',
    'content'       : '每个人都有自己的梦想，我也一样。但是我的梦想不是律师，不是医生，不是演员，甚至不是一种行业！',
    'card_date'     : '2009-02-02',
    'img_src'       : './img/src.jpg',
    'width'         : 500,
    'ret_w'         : 252,
    'ret_h'         : 278,
    'des_x'         : 30,
    'des_y'         : 0
}
canvas_img(test_data, function(){})