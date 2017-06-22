//---------------------------------------------------------------------------------------------------
// @desc : export data into excel（.xls）
//---------------------------------------------------------------------------------------------------
var async = require('async')
var fs    = require('fs')
//---------------------------------------------------------------------------------------------------
// path : to save the excel
// options : 
//          w_flag : to sign the type of write action. (1 : write a new xls document, if has rewrite; -1 : write a new sheet; else r+)
//          head : titles like the thead of table (if w_flag is not 1, head can null). JSON or Array with JSON element
//          data : the data you want to save. Array with JSON element
//          new_sheet : the name of a new_sheet
//          styles : all styles will used in the writing xls 
//---------------------------------------------------------------------------------------------------
var ready_write_xls = exports.write_xls = function(path, options, callback) {
    console.info('exports_xls write file ready...', path, options)
    var write_flag  = options.w_flag || 1
    var xls_path    = path || (__dirname + '/' + (new Date().getTime()) + '.xls')
    var data_insert = get_xls_array(options)
    var fs_op       = { encode : 'utf8' }
    if (options.w_flag == 1) {
        fs_op.flag = 'w'
        fs_op.idx  = null
        start_write_xls(xls_path, data_insert, fs_op, function(err) {
            callback(err)
        })
    }
    else {
        fs.readFile(xls_path, 'binary', function(err, file_content) {
            if (err) {
                console.log('[error]', xls_path, 'read xls err :', err)
                callback(err); return
            }
            fs_op.flag = 'r+'
            var end_index = options.w_flag == -1 ? 11 : 31
            fs_op.idx     = file_content.toString().length - end_index
            start_write_xls(xls_path, data_insert, fs_op, function(err) {
                callback(err)
            })
        })
    }
}
//---------------------------------------------------------------------------------------------------
var start_write_xls = exports.start_write_xls = function(path, data, fs_op, callback) {
    console.info('exports_xls write file start...', path, fs_op)
    async.waterfall([
        function(cb) {
            fs.open(path, fs_op.flag, function(err, fd) {
                if(err) {
                    console.log('[error]exports_xls open file err',err)
                    cb(err); return
                }
                cb(null, fd)
            })
        },
        function(fd, cb) {
            fs.write(fd, data, fs_op.idx , fs_op.encode, function(err) {
                if(err) {
                    console.log('[error]exports_xls write err',err)
                    cb(err); return
                }
                cb(null, fd)
            })
        },
        function(fd, cb) {
            fs.close(fd, function(err) {
                if(err) {
                    console.log('[error]exports_xls close file err',err)
                    cb(err); return
                }
                cb(null)                
            })
        }],
        function(err){
            if(err) {
                console.log('[error]exports xls failed :', err)
            }
            callback(err)
        }
    )
}
// -----------------------------------------------------------------------------------------------------------------
var get_xls_array = exports.get_xls_array = function(options) {
    var sheet_head = options.head || {}
    var content = xls_get_content(sheet_head, options.data)

    if (options.w_flag == 0 || options.w_flag > 1) {// just add
        return content + '</Table></Worksheet></Workbook>'
    }
    
    var head_content = xls_get_head(sheet_head)

    var str = ''
    if (options.w_flag == -1) {// add a new sheet
        str = '<Worksheet ss:Name="' + options.new_sheet + '">'
            + '<Table x:FullColumns="1" x:FullRows="1" ss:DefaultColumnWidth="54" ss:DefaultRowHeight="14.25">'
    }
    else {// first write or rewrite
        str = '<?xml version="1.0"?>'
            + '<?mso-application progid="Excel.Sheet"?>'
            + '<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"'
            + ' xmlns:o="urn:schemas-microsoft-com:office:office"'
            + ' xmlns:x="urn:schemas-microsoft-com:office:excel"'
            + ' xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"'
            + ' xmlns:html="http://www.w3.org/TR/REC-html40">'
            + xls_get_style(options.styles)
            + '<Worksheet ss:Name="' + (options.new_sheet || 'sheet1') + '">'
            + '<Table x:FullColumns="1" x:FullRows="1" ss:DefaultColumnWidth="54" ss:DefaultRowHeight="14.25">'
    }

    return (str + head_content + content + '</Table></Worksheet></Workbook>')
}
// -----------------------------------------------------------------------------------------------------------------
function xls_get_style(styles) {
    var style_str = ''
    if (styles) {
        style_str = '<Styles>'
        for (var i in styles) {
            var style = styles[i]
            style_str += '<Style ss:ID="' + i + '">'
            for (var style_item in style) {
                var css = html_style[style_item]
                if (css) {
                    var s = css(style[style_item])
                    style_str += '<' + s.css_ele
                    for (var style_info in s.css_val) {
                        style_str += ' ss:' + style_info + '="' + s.css_val[style_info] + '"'
                    }
                }
                else {
                    style_str += '<' + style_item
                    for (var style_info in style[style_item]) {
                        style_str += ' ss:' + style_info + '="' + style[style_item][style_info] + '"'
                    }
                }
                style_str += '/>'
            }
            style_str += '</Style>'
        }
        style_str += '</Styles>'
    }
    return style_str
}
// -----------------------------------------------------------------------------------------------------------------
function xls_get_head(head) {
    var head_content = ''
    var head_rows = Array.isArray(head) ? head : [head]
    for (var index = 0; index < head_rows.length; index++) {
        var row = head_rows[index]
        var $HTML_OBJ = row.$HTML_OBJ || {}
        var ele_nulls = $HTML_OBJ.set_null || []
        head_content += '<Row>'
        for (var i in row) {
            if (i == '$HTML_OBJ') {
                continue;
            }
            if (ele_nulls.indexOf(i) > -1) { // set to null no need write into xls 
                continue;
            }
            if ($HTML_OBJ[i]) {
                head_content += '<Cell'
                for (var e in $HTML_OBJ[i]) {
                    var ele = html_options[e] || e

                    head_content += ' ss:' + ele + '="' + $HTML_OBJ[i][e] + '"'
                }
                head_content += '>'
            }
            else {
                head_content += '<Cell>'
            }
            head_content += '<Data ss:Type="String">' + row[i] + '</Data></Cell>'
        }
        head_content += '</Row>'
    }
    return head_content
}
// -----------------------------------------------------------------------------------------------------------------
function xls_get_content(head, data) {
    var head_obj = Array.isArray(head) ? head[0] : head
    var content  = ''
    for (var i = 0; i < data.length; i++) {
        var item = data[i]
        if (!item) {
           continue;
        }

        content += '<Row>'
        var $HTML_OBJ = item.$HTML_OBJ || {}
        var ele_nulls = $HTML_OBJ.set_null || []
        for (var j in head_obj) {
            if (j == '$HTML_OBJ') {
                continue;
            }
            if (ele_nulls.indexOf(j) > -1) { // set to null no need write into xls 
                continue;
            }
            if ($HTML_OBJ[j]) {
                content += '<Cell'
                for (var e in $HTML_OBJ[j]) {
                    var ele = html_options[e] || e
                    content += ' ss:' + ele + '="' + $HTML_OBJ[j][e] + '"'
                }
                content += '>'
            }
            else {
                content += '<Cell>'
            }
            var cdata = (item[j] || item[j] == 0) ? item[j] : ''
            content += '<Data ss:Type="String"><![CDATA[' + cdata + ']]></Data></Cell>'
        }
        content += "</Row>"
    }
    return content
}
// -----------------------------------------------------------------------------------------------------------------
// excel 常用格式与html对照表
var html_options = {
    'style'   : 'StyleID',
    'colspan' : 'MergeAcross',
    'rowspan' : 'MergeDown',
    'index'   : 'Index'
} 
// -----------------------------------------------------------------------------------------------------------------
// excel 常用样式
// 居中单元格自动换行： <Alignment ss:Horizontal="Center" ss:Vertical="Center" ss:WrapText="1"/>
// 背景色：<Interior ss:Color="#FFFF00" ss:Pattern="Solid"/>
// 字体：<Font ss:FontName="宋体" ss:Size="11" ss:Color="#000000"/>
// -----------------------------------------------------------------------------------------------------------------
var html_style = {
    'background-color' : function(b) {
        return { css_ele : 'Interior', css_val : { 'Color' : b, 'Pattern' : 'Solid'}}
    },
    'font' : function(f) {
        var fonts = f.split(' ')
        var font_family_support = ['宋体', '新宋体', '微软雅黑', '楷体', '黑体']
        var styl = { css_ele : 'Font', css_val : {}}
        for (var i = 0; i < fonts.length; i++) {
            var css = fonts[i]
            if (font_family_support.indexOf(css) > -1) {
                styl.css_val['FontName'] = css
            }
            else if (css.indexOf('px') > -1) {
                styl.css_val['Size'] = css.split('px')[0]
            }
            else if (css.indexOf('#') > -1) {
                styl.css_val['Color'] = css
            }
            else if (css.indexOf('bold') > -1) {
                styl.css_val['Bold'] = 1
            }
            else if (css.indexOf('italic') > -1) {
                styl.css_val['Italic'] = 1
            }
        }
        return styl
    },
    'align' : function(a) {
        a = a.toLowerCase()
        var styl = { css_ele : 'Alignment', css_val : {}}

        var align_all = {
            'top'    : 'Vertical:Top',
            'bottom' : 'Vertical:Bottom',
            'left'   : 'Horizontal:Left',
            'right'  : 'Horizontal:Right'
        }

        for (var i in align_all) {
            if (a.indexOf(i) > -1) {
                var ele = align_all[i].split(':')
                styl.css_val[ele[0]] = ele[1]
            }
        }

        if (a.indexOf('center') > -1) {
            if (styl.css_val['Vertical']) {
                styl.css_val['Horizontal'] = 'Center'
            }
            else if (styl.css_val['Horizontal']) {
                styl.css_val['Vertical'] = 'Center'
            }
            else {
                styl.css_val['Horizontal'] = 'Center'
                styl.css_val['Vertical'] = 'Center'
            }
        }

        return styl
    }
}
// -----------------------------------------------------------------------------------------------------------------
// eg :
function test() {
    var path    = __dirname + '/测试' + (new Date().getTime()) + '.xls'
    var options = {
        w_flag : 1,
        head   : [{
            '0' : '日期',
            '1' : '全服',
            '2' : '',
            '3' : '服务器1',
            '4' : '',
            '5' : '服务器2',
            '6' : '',
            $HTML_OBJ : {
                'set_null' : ['2', '4', '6'],
                '0' : { rowspan : 1, style : 's1'},
                '1' : { colspan : 1, style : 's2'},
                '3' : { colspan : 1, style : 's1'},
                '5' : { colspan : 1, style : 's1'}
            }
        }, 
        { 
            '0' : '',
            '1' : 'a1',
            '2' : 'a2',
            '3' : 'a1',
            '4' : 'a2',
            '5' : 'a1',
            '6' : 'a2',
            $HTML_OBJ : {
                'set_null' : ['0'],
                '1' : { index : 2}
            }
        }], 
        data   : [ ['2016-03-20', 1,1,2,2,3,3], ['2016-03-21', 1,1,2,2,3,3], ['2016-03-22', 1,1,2,2,3,3]],
        styles : {
            's1' : {
                'font'  : 'bold italic',
                'Alignment' : { 'Horizontal' : 'Center', 'Vertical' : 'Center', 'WrapText' : '1'}
            },
            's2' : {
                'align' : 'center',
                'font'  : '12px #999999 bold',
                'background-color' : '#dddddd'
            }
        }
    }

    ready_write_xls(path, options, function(){ 
        options.w_flag = -1
        options.new_sheet = '新分页卡'
        ready_write_xls(path, options, function(){ 
            console.log('finish')
        })
    })
}
test()