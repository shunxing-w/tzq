/**
 * Created by Administrator on 2016/10/19.
 */
/**
 * Created by Administrator on 2016/10/18.
 */
void function () {
    var configs = {
        mapSize: 512,
        pageButtonWidth: 200,//页按键宽
        pageButtonHeight: 80,//页按键高
        shuffleCount: 1000
    };
    function addLoadEvent(func) {
        window.onload = function () {
            func();
        };
    }
    //点击按钮
    function star() {
        var game = document.getElementById("game");
        game.onmousedown = function () {
            if (off) {
                init();
                off = false;
            }
            shuffle();
            //打乱
            document.querySelector("#game-container").style.backgroundImage = "url()";
            Original.style.backgroundImage = imageSrc;
            DurationTime();
            pickMap.style.visibility = "hidden";
            mode.style.visibility = "hidden";
        };
    }
    var container = document.querySelector("#game-container");
    var model = {};//模型
    var animating = false;
    var space = [ -1, 0 ];
    var timer = null;
    var bushu = null;

    container.style.cssText = "width: " + configs.mapSize + "px; height: " + configs.mapSize + "px;";

    var refresh = document.getElementById("refresh");
    refresh.addEventListener("click", function (event) {
        location.reload();
    }, false);
    //时间
    function DurationTime() {
        var lastTime = Date.now();
        clearInterval(timer);
        timer = setInterval(function () {
            var nowTime = Date.now();
            document.querySelector("#showtime").value = parseInt((nowTime - lastTime) / 1000) + "s";
        }, 1000);
    };
    //换图
    var pickMap = document.getElementById("pickMap");
    var Original = document.getElementById("Original");
    var arr = [
        "url(images/ls.jpg)",
        "url(images/sws.png)",
        "url(images/wfw.png)",
        "url(images/zyf.png)",
        "url(images/wsx.png)"
    ];
    var i = 0;
    var imageSrc = "url(images/wsx.png)";
    pickMap.addEventListener("click", function (event) {
        Original.style.backgroundImage = arr[i % 5];
        imageSrc = arr[i % 5];
        i++;
    }, false);
    //难度
    var level = 3;
    var mode = document.getElementById("mode");
    var options = document.getElementsByTagName("option");
    mode.addEventListener("change", function () {
        level = Number(this.value);
    }, false);
    //图片地址
    var sign = function (x, y) {
        return y + "," + x;
    };
    var position = function (el, left, top) {
        el.style.left = left + "px";
        el.style.top = top + "px";
    };
    // render=提供 提供一堆格子并且加图片
    var render = function (now) {
        var el = "";
        var item;
        for (var i in model) {
            item = model[i];
            if (!(el = item.el)) {
                el = item.el = document.createElement("div");
                el.style.cssText = "width:" + gridItemSize + "px; height:" + gridItemSize + "px";
                el.className = "cell";
                el.style.backgroundImage = imageSrc;
                //把图片写在js里
                el.style.backgroundPosition = item.ix + "px " + item.iy + "px";
                el.setAttribute("data-sign", i);
                container.appendChild(el);
            }
            position(el, item.x * gridItemSize, item.y * gridItemSize);
        }
    };
    //getAroundCells= 得到周围的细胞
    var getAroundCells = function (sx, sy) {
        var result = [];
        //结果
        for (var y = sy - 1; y <= sy + 1; y++) {
            for (var x = sx - 1; x <= sx + 1; x++) {
                if (y < 0 || x < 0 || y > level - 1 || x > level - 1)
                    continue;
                if (y != sy && x != sx)
                    continue;
                if (sx == x && sy == y)
                    continue;
                result.push([ x, y ]);
            }
        }
        return result;
    };
    //swp= 互换
    var swap = function (cellPos, space) {
        var cellSign = sign.apply(null, cellPos);
        var cell = model[cellSign];
        var signLabel;
        cell.x = space[0];
        cell.y = space[1];
        delete model[cellSign];
        signLabel = sign.apply(null, space);
        model[signLabel] = cell;
        space[0] = cellPos[0];
        space[1] = cellPos[1];
        cell.el.dataset.sign = signLabel;
    };
    //打乱换牌
    var shuffle = function () {
        var aroundCells, cellPos, cellSign, cell, spaceSign;
        render();
        for (var i = 0; i < configs.shuffleCount; i++) {
            aroundCells = getAroundCells.apply(null, space);
            cellPos = aroundCells[Math.floor(Math.random() * aroundCells.length)];
            swap(cellPos, space);
        }
        render();
    };
    var endAlert = function () {
        var en = true, cell;
        for (var i in model) {
            cell = model[i];
            if (cell.x != cell.ox || cell.y != cell.oy) {
                en = false;
                break;
            }
        }
        if (en) {
            alert("小伙子我很看好你");
            clearInterval(timer);
        }
    };
    var gridItemSize;
    var off = true;
    var init = function () {
        gridItemSize = configs.mapSize / level;//算出格子大小
        //得到level的里面的小格子的大小位置
        for (var y = 0; y < level; y++) {
            for (var x = 0; x < level; x++) {
                //sign= 符号
                model[sign(x, y)] = {
                    x: x,
                    y: y,
                    ox: x,
                    oy: y,
                    ix: -gridItemSize * x,
                    iy: -gridItemSize * y
                };
            }
        }
    };
    //点击事件
    document.addEventListener("mousedown", function (event) {
        var x, y, target, dataSign, found, aroundCells, cell, el;
        target = event.target;
        dataSign = target.dataset.sign;
        if (!dataSign) {
            return;
        }
        dataSign = dataSign.split(",");
        x = Number(dataSign[1]);
        y = Number(dataSign[0]);
        if (x == -1 && space[0] == 0 && space[1] == 0) {
            found = true;
            cell = [
                -1,
                0
            ];
        } else {
            aroundCells = getAroundCells.apply(null, space);
            for (var i = 0, l = aroundCells.length; i < l; i++) {
                cell = aroundCells[i];
                if (cell[0] == x && cell[1] == y) {
                    found = true;
                    break;
                }
            }
        }
        if (found) {
            animating = true;
            el = model[sign.apply(null, cell)].el;
            swap(cell, space);
            render();
            //转换后render显示出来
            endAlert();
        }
    }, false);
    addLoadEvent(star);
}();