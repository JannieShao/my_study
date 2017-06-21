// @des : check if point in a hexagon. config with the six point of hexagon
// --------------------------------------------------------------------
var config = {
    '1' : {
        '1' : {x : 121, y : 103},
        '2' : {x : 458, y : 70 },
        '3' : {x : 458, y : 210},
        '4' : {x : 121, y : 382},
        '5' : {x : 215, y : 210},
        '6' : {x : 215, y : 70 }
    }
}
function _check_in(com_id, point_idx, point) {
    var targ1 = config[com_id][point_idx]
    var targ2 = config[com_id][point_idx + 1]
    var x1    = config[com_id][point_idx].x
    var x2    = config[com_id][point_idx + 1].x
    var y1    = config[com_id][point_idx].y
    var y2    = config[com_id][point_idx + 1].y

    if (x1 == x2) {
        if (point_idx > 3) {
            if (point.x > x1) {
                return true
            }
            return false
        } else {
            if (point.x < x1) {
                return true
            }
            return false
        }
    }

    var a = (y1 - y2) / (x1 - x2)
    var b = (x2*y1 - x2*y1) / (x1 - x2)

    var flag_y = a*point.x + b

    if (point_idx > 3) {
        if (flag_y < point.y) {
            return true
        }
        return false
    }

    if (point.y > flag_y) {
        return true
    }
    return false
}

function check(com, point) {
    for (var i = 1; i < 6; i++) {
        var ret = _check_in(com, i, point)
        if(!ret) {
            return false
        }
    }
    return true
}

// eg
console.log(check(1, {x : 10, y : 200}))