/**
  * scratchcard.js
  */
Element.prototype.ScratchCard = function(t){
    var s = this;
    if(!s.nodeType || s.nodeType !== 1 || !t || Object.prototype.toString.call(t) !== '[object String]') return;
    w = s.clientWidth;
    h = s.clientHeight;
    var bg = document.createElement('div'),
        canvas = document.createElement('canvas'),
        context = canvas.getContext("2d"),
        touched = false,
        page_x = 0,
        page_y = 0,
        begin = function(e){
            touched = true;
            page_x = e.pageX-s.offsetLeft;
            page_y = e.pageY-s.offsetTop;
        },
        move = function(e){
        e.preventDefault();
        if(touched){
                context.globalCompositeOperation="destination-out"
                context.beginPath();
                context.moveTo( page_x,page_y );
                var epx = e.pageX || e.touches[0].pageX,
                    epy = e.pageY || e.touches[0].pageY;
                page_x = epx-s.offsetLeft;
                page_y = epy-s.offsetTop;
                context.lineTo( page_x,page_y );
                context.stroke();
                context.lineWidth = Math.floor(h / 4);
            }
        },
        end = function(e){
            touched = false;
        };
    s.style.position = 'relative';
    bg.innerText = t;
    bg.style.fontSize = Math.floor(w / (t.length + 4)) + 'px';
    bg.style.textAlign = 'center';
    bg.style.width = w + 'px';
    bg.style.height = h + 'px';
    bg.style.lineHeight = h + 'px';
    bg.style.background = "#00bcd457";;
    s.appendChild(bg);
    canvas.width = w;
    canvas.height = h;
    canvas.style.position = 'absolute';
    canvas.style.top = '0';
    s.appendChild(canvas);
    context.lineCap = "round";
    context.fillStyle="#ccc";
    context.fillRect(0,0,w,h);
    //手指放到屏幕上
    canvas.addEventListener('touchstart', begin);
    canvas.addEventListener('mousedown', begin);
    //手指开始移动
    canvas.addEventListener('touchmove', move);
    canvas.addEventListener('mousemove', move);
    //手指离开
    canvas.addEventListener('touchend', end);
    canvas.addEventListener('mouseup', end);
}