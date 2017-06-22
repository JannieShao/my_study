//---------------------------------------------------------------------------------------------
// @desc : 返回数组所有排列组合情况
//         eg：arr [1,2,3] ,返回结果 [[1], [2], [3], [1,2], [1,3], [2,3], [1,2,3]]
//---------------------------------------------------------------------------------------------
exports.combin_all = function(arr) {
    var new_arr = []
    function get_arr_by_num(num, temp, arr) {
        var arr_temp = []
        if (temp.length == 0) {
            arr_temp = get_arr_1(arr)
        }
        temp.forEach(function(item) {
            if (item.indexOf(arr[arr.length-1]) > -1) {
                return
            }
            var ele = item[item.length-1]
            var idx = arr.indexOf(ele)
            var t_temp = get_arr_1(arr.slice(idx + 1))
            t_temp.forEach(function(item2) {
                arr_temp.push(item.concat(item2))
            })
        })
        new_arr = new_arr.concat(arr_temp)
        if (num > arr.length) {
            return new_arr
        }
        return get_arr_by_num(num+1, arr_temp, arr)
    }

    function get_arr_1(arr) {
        var arr_ret = []
        arr.forEach(function(item) {
            arr_ret.push([item])
        })
        return arr_ret
    }
    new_arr = get_arr_by_num(1, [], arr)
    return new_arr
}