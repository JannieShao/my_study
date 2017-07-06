//----------------------------------------------------------------------------------------------------------------------------------------
var _show_imgs = function(config) {
    var scroll = {
        'pst_config' : config,
        'time_need'  : {
            'sys'   : 2000,
            'user'  : 300
        },
        'len'        : $('.imgs .img').length,
        'freq'       : 3000,
        'freq_idx'   : 0,
        'stmo_idx'   : 0,
        'img_bgs'    : { 
            'bg'   : 'url(http://r.syyx.com/party/nycs/nuomiqing2016_new/m_page/img_bg.png)',
            'show' : 'url(http://r.syyx.com/party/nycs/nuomiqing2016_new/m_page/img_show.png)'
        },
        'scrolling'  : 0, 
        'turn_l' : function(type) {
            var $self = this
            type = type || 'sys'

            var idx_turn = $self.idx.p3 + 1
            if (idx_turn >= $self.len) {
                idx_turn = 0
            }

            var pst_turn = [
                { idx : $self.idx.p1, go_to : '0'},
                { idx : $self.idx.p2, go_to : '1'},
                { idx : $self.idx.p3, go_to : '2'},
                { idx : idx_turn,     go_to : '3'}
            ]

            $('.imgs .img').eq(pst_turn[0].idx).animate($self.pst_config[pst_turn[0].go_to], $self.time_need[type], function(e) {
                $(this).animate($self.pst_config['4'], 1)
            })

            $('.imgs .img').eq(pst_turn[1].idx).animate($self.pst_config[pst_turn[1].go_to], $self.time_need[type], 'ease-in-out', function(e) {
                $(this).find('.img_bg').css('opacity', '.6')
            })

            $('.imgs .img').eq(pst_turn[2].idx).animate($self.pst_config[pst_turn[2].go_to], $self.time_need[type], 'ease-in-out', function(e) {
                $(this).find('.img_bg').css('opacity', '1.0')
                $('.menu .icon').removeClass('selected')
                $('.menu .icon').eq(pst_turn[2].idx).addClass('selected')
                $self.idx.p1    = pst_turn[1].idx
                $self.idx.p2    = pst_turn[2].idx
                $self.idx.p3    = pst_turn[3].idx
                $self.scrolling = 0
            })

            $('.imgs .img').eq(pst_turn[3].idx).animate($self.pst_config[pst_turn[3].go_to], $self.time_need[type])

        },
        'turn_r' : function(type) {
            var $self = this
            type = type || 'sys'

            var idx_turn = $self.idx.p1 - 1
            if (idx_turn < 0) {
                idx_turn = $self.len - 1
            }

            var pst_turn = [
                { idx : idx_turn,     go_to : '1'},
                { idx : $self.idx.p1, go_to : '2'},
                { idx : $self.idx.p2, go_to : '3'},
                { idx : $self.idx.p3, go_to : '4'}
            ]

            $('.imgs .img').eq(pst_turn[0].idx).css('left', $self.pst_config['0'].left)
            $('.imgs .img').eq(pst_turn[0].idx).animate($self.pst_config[pst_turn[0].go_to], $self.time_need[type])

            $('.imgs .img').eq(pst_turn[1].idx).animate($self.pst_config[pst_turn[1].go_to], $self.time_need[type], 'ease-in-out', function(e) {
                $(this).find('.img_bg').css('opacity', '1.0')
                $('.menu .icon').removeClass('selected')
                $('.menu .icon').eq(pst_turn[1].idx).addClass('selected')
                $self.idx.p1    = pst_turn[0].idx
                $self.idx.p2    = pst_turn[1].idx
                $self.idx.p3    = pst_turn[2].idx
                $self.scrolling = 0
            })

            $('.imgs .img').eq(pst_turn[2].idx).animate($self.pst_config[pst_turn[2].go_to], $self.time_need[type], 'ease-in-out', function(e) {
                $(this).find('.img_bg').css('opacity', '.6')
            })

            $('.imgs .img').eq(pst_turn[3].idx).animate($self.pst_config[pst_turn[3].go_to], $self.time_need[type])
        },
        'do_turn' : function(pst, type) {
            var $self = this
            if ($self.scrolling) {
                return
            }
            $self.scrolling = 1
            pst = pst || 'l'
            $self['turn_' + pst] && $self['turn_' + pst](type)
        },
        'start' : function() {
            var $self = this
            if ($self.stmo_idx != 0) {
                return
            }
            $self.stmo_idx = setTimeout(function(e) {
                $self.stmo_idx = 0
                if ($self.freq_idx != 0) {
                    return
                }
                $self.do_turn()
                $self.freq_idx = setInterval(function(e) {
                    $self.do_turn()
                }, $self.freq)
            }, 2000)
        },
        'stop' : function() {
            var $self = this
            clearInterval($self.freq_idx)
            $self.freq_idx = 0
            clearTimeout($self.stmo_idx)
            $self.stmo_idx = 0
        },
        'init' : function() {
            var $self = this
            $self.freq_idx = setInterval(function(e) {
                $self.do_turn()
            }, $self.freq)
        }
    }
    scroll.init()
    scroll.idx = {p1 : scroll.len - 1, p2 : 0, p3 : 1}
    return scroll
};
var _scroll_img = function(config) {
    var scroll = {
        'p_ele'    : config.p_ele,
        'freq'     : config.freq || 500,
        'idx'      : 0,
        'len'      : 0,
        'status'   : 0,
        'init'     : function() {
            var $self = this
            $self.len = $self.p_ele.find('img').length
            $self.p_ele.find('img:eq(0)').css('left', '0px')
        },
        'turn_img' : function(flag) {
            var $self = this

            if ($self.status) {
                return
            }
            $self.status = 1

            var idx_now, position, cs_from

            if (flag) { 
                idx_now  = ($self.idx + 1) > ($self.len - 1)  ? 0 : ($self.idx + 1)
                position = {'left' : '-100%'}
                $self.p_ele.find('img:eq(' + idx_now + ')').css('left', '100%')
            }
            else {
                idx_now  = ($self.idx - 1) < 0 ? ($self.len - 1) : ($self.idx - 1)
                position = {'left' : '100%'}
                $self.p_ele.find('img:eq(' + idx_now + ')').css('left', '-100%')
            }

            $self.p_ele.find('img:eq(' + $self.idx + ')').animate(position, $self.freq)
            $self.p_ele.find('img:eq(' + idx_now + ')').animate({'left' : '0px'}, $self.freq, function() {
                $self.idx = idx_now
                $self.status = 0
            })
        },
        'turn_prev' : function() {
            var $self = this
            $self.turn_img(0)
        },
        'turn_next' : function() {
            var $self = this
            $self.turn_img(1)
        }
    }
    scroll.init()
    return scroll
}