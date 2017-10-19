var handWritting = function (params) {
    if (!(this instanceof handWritting)) {
        return new handWritting(params);
    }
    var defaultParams = {
        width: 800, //画布宽度
        height: 800, //画布高度
        color: '#000', //笔画颜色
        maxLineWidth: 30, //最大笔画宽度
        minLineWidth: 1, //最小笔画宽度
        maxStrokeV: 10, //最大笔画速度
        minStrokeV: 0.1 //最小笔画速度
    };
    params = Object.assign({}, defaultParams, params);

    this.canvas = params.canvas;
    this.canvasWidth = params.width; 
    this.canvasHeight = params.height;
    this.strokeColor = params.color;
    this.maxLineWidth = params.maxLineWidth;
    this.minLineWidth = params.minLineWidth;
    this.maxStrokeV = params.maxStrokeV;
    this.minStrokeV = params.minStrokeV;
    var context = canvas.getContext('2d');

    canvas.width = this.canvasWidth;
    canvas.height = this.canvasHeight;

    var that = this;

    //画虚线算法
    var drawDashLine = function (ctx, x1, y1, x2, y2, dashLength){
        var dashLen = dashLength === undefined ? 5 : dashLength,
        xpos = x2 - x1, //得到横向的宽度;
        ypos = y2 - y1, //得到纵向的高度;
        numDashes = Math.floor(Math.sqrt(xpos * xpos + ypos * ypos) / dashLen);
        //利用正切获取斜边的长度除以虚线长度，得到要分为多少段;
        for (var i = 0; i < numDashes; i++) {
            if (i % 2 === 0) {
                ctx.moveTo(x1 + (xpos/numDashes) * i, y1 + (ypos/numDashes) * i); 
             //有了横向宽度和多少段，得出每一段是多长，起点 + 每段长度 * i = 要绘制的起点；
            } else {
                ctx.lineTo(x1 + (xpos/numDashes) * i, y1 + (ypos/numDashes) * i);
            }
        }
        ctx.stroke();
    };

    //画米字格
    var drawGrid = function (ctx, width, height) {
        //save和restore是为了还原两者之间的代码对ctx做的状态设置，如strokeStyle。
        ctx.save();

        //画外框
        ctx.strokeStyle = 'rgb(230, 11, 9)';
        ctx.beginPath();
        ctx.moveTo(3, 3);
        ctx.lineTo(width - 3, 3);
        ctx.lineTo(width - 3, height - 3);
        ctx.lineTo(3, height - 3);
        ctx.closePath();
        ctx.lineWidth = 6;
        ctx.stroke();

        //画米字
        ctx.beginPath();
        ctx.lineWidth = 1;
        var dashLength = 10;
        drawDashLine(ctx, 0, 0, width, height, dashLength);
        drawDashLine(ctx, width, 0, 0, height, dashLength);
        drawDashLine(ctx, width/2, 0, width/2, height, dashLength);
        drawDashLine(ctx, 0, height/2, width, height/2, dashLength);

        ctx.restore();
    };


    var isMouseDown = false;
    //记录上一时刻鼠标移动到的位置
    var lastLoc = {
        x: 0,
        y: 0
    };
    //记录上一时刻触发动作的时间，用于计算运笔速度而设置笔画宽度
    var lastTimeStamp = 0;
    //记录上一时刻的笔画宽度，而让笔画值能平稳过渡
    var lastLineWidth = -1;

    //计算基于target的点击位置
    var parsePositionToWindow = function (target, x, y) {
        var bbox = target.getBoundingClientRect();
        return {
            x: Math.round(x - bbox.left),
            y: Math.round(y - bbox.top)
        };
    };
    //计算两点之间的距离
    var calDistance = function (loc1, loc2) {
        return Math.sqrt((loc1.x - loc2.x) * (loc1.x - loc2.x)  +
            (loc1.y - loc2.y) * (loc1.y - loc2.y));
    };
    var calcLineWidth = function (s, t, maxL, minL, maxV, minV) {
        var v = s / t;
        var resultLineWidth;
        if (v <= minV) {
            resultLineWidth = maxL
        } else if (v >= maxV) {
            resultLineWidth = minL;
        } else {
            resultLineWidth = maxL - (v - minV) /
                (maxV - minV) * (maxL - minL);
        }
        if (lastLineWidth === -1) {
            return resultLineWidth;
        }
        //平缓过渡笔画，需要上一次的笔画值做平均值
        return lastLineWidth * 2 / 3 + resultLineWidth / 3;
    };
    //开始绘制
    var beginStroke = function (target, x, y) {
        lastLoc = parsePositionToWindow(target, x, y);
        lastTimeStamp = new Date().getTime();
        isMouseDown = true;
    };
    //结束绘制
    var endStroke = function () {
        isMouseDown = false;
    };
    //移动过程中的绘制
    var moveStroke = function (target, x, y) {
        var curLoc = parsePositionToWindow(target, x, y);
        var distance = calDistance(curLoc, lastLoc);
        var currentTime = new Date().getTime();
        var takeTime = currentTime - lastTimeStamp;
        var lineWidth = calcLineWidth(distance, takeTime, that.maxLineWidth,
            that.minLineWidth, that.maxStrokeV, that.minStrokeV);

        context.strokeStyle = that.strokeColor;
        context.lineWidth = lineWidth;
        context.lineCap = 'round';
        context.lineJoin = 'round';
        
        //每一点画一段直线
        context.beginPath();
        context.moveTo(lastLoc.x, lastLoc.y);
        context.lineTo(curLoc.x, curLoc.y);
        context.stroke();

        lastLoc = curLoc;
        lastTimeStamp = currentTime;
        lastLineWidth = lineWidth;
    };
    canvas.addEventListener('mousedown', function(e) {
        e.preventDefault();
        beginStroke(e.target, e.clientX, e.clientY);
    });
    canvas.addEventListener('mouseup', function(e) {
        e.preventDefault();
        endStroke();
    });
    canvas.addEventListener('mouseout', function(e) {
        e.preventDefault();
        endStroke();
    });
    canvas.addEventListener('mousemove', function(e) {
        e.preventDefault();
        if (isMouseDown) {
            moveStroke(e.target, e.clientX, e.clientY);
        }
    });
    canvas.addEventListener('touchstart', function (e) {
        e.preventDefault();
        //多点触控时只取第一个点的坐标信息；
        var touch = e.touches[0];
        beginStroke(e.target, touch.pageX, touch.pageY);
    });
    canvas.addEventListener('touchmove', function (e) {
        e.preventDefault();
        if (isMouseDown) {
            var touch = e.touches[0];
            moveStroke(e.target, touch.pageX, touch.pageY);
        }
    });
    canvas.addEventListener('touchend', function (e) {
        e.preventDefault();
        endStroke();
    });

    drawGrid(context, this.canvasWidth, this.canvasHeight);

    this.clear = function () {
        context.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
        drawGrid(context, this.canvasWidth, this.canvasHeight);
    };
    
};

if (typeof exports !== 'undefined') {
    if (typeof module !== 'undefined' && module.exports) {
        exports = module.exports = handWritting;
    } else {
        exports.handWritting = handWritting;
    }
} else {
    this.handWritting = handWritting;
}
