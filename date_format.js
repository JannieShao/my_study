// @des : date format as you want. like 
//        "yyyy-MM-dd hh:mm:ss" as 2017-06-21 12:08:03
// -----------------------------------------------------------
var date_format = function(date, fmt) {
    if(typeof date != 'Date') {
        date = new Date(date);
    }

    if (date == 'Invalid Date') {
        console.log('Invalid Date')
        return false
    }

    var o = {
        "M+": date.getMonth() + 1, //月份 
        "d+": date.getDate(), //日 
        "h+": date.getHours(), //小时 
        "m+": date.getMinutes(), //分 
        "s+": date.getSeconds(), //秒 
        "q+": Math.floor((date.getMonth() + 3) / 3), //季度 
        "S": date.getMilliseconds() //毫秒 
    };
    if(/(y+)/.test(fmt)) {
        fmt = fmt.replace(RegExp.$1, (date.getFullYear() + "").substr(4 - RegExp.$1.length));
    }
    for (var k in o) {
        if (new RegExp("(" + k + ")").test(fmt)) {
            fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
        }
    }
    return fmt;
}
// eg : 
var str = date_format(new Date(), "yyyy-MM-dd hh:mm:ss")
console.log(str)