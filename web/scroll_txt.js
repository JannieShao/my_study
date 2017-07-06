var scroll_txt = function(conf) {
    var txt = {
        'ele'         : conf.ele || $('.list_all'),
        'time_need'   : conf.time_need || 1000,
        'freq'        : conf.freq || 1000, 
        'say_idx'     : -1,
        'list_show'   : conf.list_show || 6,
        'list_height' : conf.list_height || 160,
        'idx'         : 0,
        'auto'        : conf.auto || true,
        'get_txt' : function(cb) {
            var $self = this
            $.get('/test_get_txt', function(data){
                var rows = data.list
                var html = ''
                for (var i = 0; i < rows.length; i++) {
                    html += '<div data-idx="' + i + '" class="list"><span class="server">服务器：'
                         + rows[i].server +'</span><span class="role">角色名：'
                         + rows[i].role +'</span><p>'
                         + rows[i].comment + '</p></div>'
                }
                $self.ele.html(html)
                if ($self.auto_start) {
                    $self.start()
                }
            })
        },
        'do_turn'     : function() {
            var $self = this
            var len   = $self.ele.find('.list').length

            var idx_now = $self.say_idx
            if (idx_now != -1) {
                var ele_to_top = $self.ele.find('.list').eq(idx_now)
                ele_to_top.animate({'top': -$self.list_height}, $self.time_need, 'ease-in-out')
            }

            idx_now ++
            idx_now = idx_now >= len ? 0 : idx_now

            for (var i = 0; i < $self.list_show; i++) {
                var idx = idx_now + i
                if (idx >= len) {
                    idx -= len
                }
                var ele_to_top = $self.ele.find('.list').eq(idx)
                ele_to_top.animate({'top': ($self.list_height * i)}, $self.time_need, 'ease-in-out')
            }

            var ele_now = $self.ele.find('.list').eq(idx_now)
            ele_now.animate({'top': '0px'}, $self.time_need, 'ease-in-out', function(e) {
                $self.ele.find('.list').each(function(index) {
                    var top = $(this).css('top')
                    if(top == -$self.list_height) {
                        $(this).css('top', ($self.list_show-1)*list_height)
                    }
                })
                $self.say_idx = idx_now
            })
        },
        'start' : function() {
            var $self = this
            $self.idx = setInterval(function(e) {
                $self.do_turn()
            }, $self.freq)
        },
        'stop' : function() {
            var $self = this
            clearInterval($self.idx)
        }
    }
    return txt
};
var s_t = new scroll_txt()
s_t.get_txt()
