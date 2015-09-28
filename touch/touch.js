var touchsingle = function(o) {
    var _touch = function(o) {	
        this.index = 1;//当前li的索引
        this.isdrag = null;//手指start开关
        this.isend = true;//手指抬起开关
        this.zuoyou = this.youzuo = this.shangxia = this.xiashang = null;//初始手指方向

        //初始化坐标
        this.sx = null;//start x
        this.sy = null;//start y
        this.mx = null;//move x
        this.my = null;//move y
        this.ex = null;//end x
        this.ey = null;//end y

        //手指在屏幕移动的距离
        this.julix = null;
        this.juliy = null;

        //绑定事件的元素
        this.ele = o.ele; 

        //事件
        this.oninit = o.oninit || null;
        this.onstart = o.onstart || null;
        this.onmove = o.onmove || null;
        this.onend = o.onend || null;
        this.onshangxia = o.onshangxia || null;
        this.onxiashang = o.onxiashang || null;
        this.onzuoyou = o.onzuoyou || null;
        this.onyouzuo = o.onyouzuo || null;
        this.init = o.init || null;

        this.run(this.init);

        this.addEv();
    };
    _touch.prototype = {
        s: function(e) {
            if (!this.isend) {
                return false;
            }
            this.fangxiang();
            var t = e.targetTouches[0];
            this.isdrag = true;
            this.sx = t.pageX;
            this.sy = t.pageY;
            this.run(this.onstart);
        },
        m: function(e) {
            if (!this.isend) {
                return false;
            }
            if (!this.isdrag) return;
            var t = e.targetTouches[0];
            this.mx = t.pageX;
            this.my = t.pageY;
            this.julix = this.sx - this.mx;
            this.juliy = this.sy - this.my;
            if (this.sx - this.mx > 0 && Math.abs(this.my - this.sy) < Math.abs(this.sx - this.mx)) {
                //console.log("从右住左")

                this.fangxiang("youzuo");
                this.run(this.onyouzuo);

            } else if (this.mx - this.sx > 0 && Math.abs(this.my - this.sy) < Math.abs(this.sx - this.mx)) {
                //console.log("从左住右")

                this.fangxiang("zuoyou");
                this.run(this.onzuoyou);

            } else if (this.sy - this.my > 0 && Math.abs(this.mx - this.sx) < Math.abs(this.sy - this.my)) {
                //console.log("从下住上")

                this.fangxiang("youzuo");
                this.run(this.onxiashang);

            } else if (this.my - this.sy > 0 && Math.abs(this.mx - this.sx) < Math.abs(this.sy - this.my)) {
                //console.log("从上住下")

                this.fangxiang("zuoyou");
                this.run(this.onshangxia);

            } else {

                console.log("无法判断方向")
                
            }
            this.run(this.onmove);

        },
        e: function(e) {
            var self = this;
            if (!this.isdrag) return;
            this.isdrag = false;
            this.ex = this.mx;
            this.ey = this.my;
            //防止连续操作，当手指抬起时移除事件，500ms后再绑定事件
            this.removeEv();
            this.isend = false;
            window.setTimeout(
                function() {
                    self.addEv()
                    self.isend = true;;
            }, 500);
            this.run(this.onend);
        },
        run:function(fn,obj){
            obj=obj||this;
            if (typeof fn == "function")fn(obj);
        },
        addEv: function() {
            //如果不绑定，这里的this会指向window
            this._s = this.ebind(this.s, this);
            this._m = this.ebind(this.m, this);
            this._e = this.ebind(this.e, this);

            this.ele.addEventListener("touchstart", this._s, false);
            this.ele.addEventListener("touchmove", this._m, false);
            this.ele.addEventListener("touchend", this._e, false);
        },
        removeEv: function() {
            this.ele.removeEventListener("touchstart", this._s, false);
            this.ele.removeEventListener("touchmove", this._m, false);
            this.ele.removeEventListener("touchend", this._e, false);
        },
        fangxiang: function(direction) {
            this.zuoyou = this.youzuo = this.shangxia = this.xiashang = false;
            this[direction] = true;
            this.fx = direction;
        },
        getstyle: function(obj, attr) {
            return obj.currentStyle ? obj.currentStyle[attr] : getComputedStyle(obj, false)[attr];
        },
        ebind: function(fn, obj) {
            return function(e) {
                fn.call(obj, e);
            }
        },
        animate: function(ele, obj, duration) {
            var oChange = {};
            var oBegin = {};
            for (var attr in obj) {
                var target = obj[attr];
                if (attr != 'opacity') {
                    var offsetAttr = 'offset' + attr.substr(0, 1).toUpperCase() + attr.substring(1);
                    var begin = ele[offsetAttr];
                } else {
                    initOpacity(ele);
                    var begin = +ele.style[attr]; //ele.style.opacity
                }
                if (window.navigator.userAgent.indexOf('MSIE') > -1) {
                    //15 ,chrom 13
                    var interval = 15;
                } else {
                    var interval = 13;
                }

                var change = target - begin; //753  变化的位移
                oChange[attr] = change;
                oBegin[attr] = begin;
            }
            var t = 0; //当前已经走了多长时间了
            var beginT = new Date();

            function step(c, t, d, b) {
                return c * (t / d) + b;
            }
            if (typeof settime == "undefined") {
                var settime = null
            } else {
                window.clearTimeout(settime);
            }
            move();
            function move() {
                if (t / duration < 1) {
                    t = t + interval;
                    //过界判断
                    if (t >= duration) {
                        ele.style[attr] = change + begin + 'px';
                    } else {
                        ele.style[attr] = step(change, t, duration, begin) + 'px';
                    }
                    settime = window.setTimeout(move, interval);
                }
            }
        }
    }
    return new _touch(o);
}
