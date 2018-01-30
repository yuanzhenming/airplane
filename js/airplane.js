//获取canvas画布对象
var canvas = document.getElementById("mapCanvas");
var context = canvas.getContext("2d");
//获取加载对象
var loading = document.getElementById("loading");
//游戏所得分数对象
var scoreSpan = document.querySelector("#currentScore > span");
//结束菜单
var menu = document.getElementById("menu");
//游戏结束时显示的总分
var scoresEnd = document.getElementById("endScore");
//重新开始
var restart = document.getElementById("restart");
//设置canvas画布的宽高大小和当前浏览器的宽高一致;
//第一种方式:
//canvas.width = window.innerWidth;
//canvas.height = window.innerHeight;
//第二种方式:
canvas.width = document.documentElement.clientWidth;
canvas.height = document.documentElement.clientHeight;
//第一步:图片预加载:当前浏览器中只会加载一次图片;
//创建一个数组,用来存储所有需要预加载的图片路径
var namesImg = ["background.png", "bullet1.png", "bullet2.png", "enemy1.png", "enemy2.png", "enemy3.png", "herofly.png", "loading.gif", "prop.png"];
var imgs = []; //存储图片对象
var count = 0; //记录图片加载成功的张数
for(var i = 0; i < namesImg.length; i++) {
//创建图片对象
    var img = new Image();
    img.src = "../img/" + namesImg[i];
    imgs.push(img); //将对象存储到数组中
//图片加载成功时
    img.onload = function() {
        count++;
//判断所有图片是否全部加载成功
        if(count == namesImg.length) {
//处理音频预加载
            loadMusic();
        }
    }
}
//第二步:音频预加载
//创建一个数组,存储音频路径
var musicNames = ["bullet", "enemy1_down", "enemy2_down", "enemy3_down", "game_music", "game_over"];
//创建数组,存储音频对象
var musics = [];
var musicCount = 0; //存储加载成功音频对象的个数
//处理音频预加载操作
function loadMusic() {
    for(var i = 0; i < musicNames.length; i++) {
//创建音频对象
        var music = new Audio();
        music.src = "../audio/" + musicNames[i] + ".mp3";
        musics.push(music); //将音频对象添加到数组中
//音频加载成功之后,调用的方法
        music.onloadedmetadata = function() {
            musicCount++;
//所有音频加载成功之后
            if(musicCount == musicNames.length) {
//首先,隐藏加载效果图片
                loading.style.display = "none";
//开始游戏,调用函数
                beginGame();
//播放游戏背景音乐
// 音量 0 - 1之间
                musics[4].volume = 0.6;
//设置循环播放
                musics[4].loop = true;
//播放
                musics[4].play(); //播放
            }
        }
    }
}
//第三步:绘制游戏的背景图片
var backgroundImg = imgs[0];
//使用面向对象的思想,来处理JS逻辑
//创建一个普通对象(只有一个)
var background = {
//属性
    x: 0,
    y: 0,
    w: canvas.width,
    h: canvas.height,
//方法
    draw: function() {
//如何在不改变背景图片像素的情况下,铺满整个屏幕绘制?
//获取最大列数和最大行数,方便绘制全屏幕
        var row = Math.ceil(canvas.height / 568);
        var col = Math.ceil(canvas.width / 320);
//使用双层for循环绘制背景图
        for(var i = -row; i < row; i++) {
            for(var j = 0; j < col; j++) {
//绘制图片
                context.drawImage(backgroundImg, j * 320, i * 568 + this.y, 320, 568);
            }
        }
    },
    move: function() {
        this.y++;
//判断如果移动完整个屏幕高度之后,需要重置this.y的位置
        var row = Math.ceil(canvas.height / 568);
        if(this.y == 568 * row) {
            this.y = 0;
        }
    }
};
//第五步:绘制我方英雄战机以及绘制子弹(单排子弹和双排子弹)
//创建需要我方英雄的战机对象
var heroImg = imgs[6];
//单排子弹对象
var bulletImg1 = imgs[1];
var bulletImg2 = imgs[2];
//创建一个飞机类hero(只有一个飞机)
var hero = {
//属性
    x: canvas.width / 2 - 33,
    y: canvas.height - 82 - 80,
    w: 66,
    h: 82,
    i: 0, //记录当前是第几张图片(下标从0开始)
    flagI: 0, //记录切换图片的频率
    bullets: [], //记录发出过的子弹
    flagShot: 0, //记录发射子弹的频率
    weaponType: 0, //记录武器类型(0:单排子弹,1:双排子弹)
    boom: false, //是否爆炸
//方法
// 1.绘制战机
    draw: function() {
//控制切换图片的频率
        this.flagI++;
        if(this.flagI == 10) {
//如果爆炸
            if(this.boom) {
                this.i++;
                if(this.i == 5) {
//英雄死亡
                    gameOver();
                }
            } else {
//没有爆炸的情况
                this.i = (++this.i) % 2;
            }
            this.flagI = 0; //重置
        }
//绘制飞机,把图片的某一部分绘制到canvas的某一部分中
        context.drawImage(heroImg, this.i * this.w, 0, this.w, this.h, this.x, this.y, this.w, this.h);
    },
//方法 发射子弹
    shotBiu: function() {
//爆炸后,不需要发射子弹
//第一种方式
// if (this.boom) {
// return;
// }
//第二种方式
        if(!this.boom) {
            this.flagShot++;
        }
        if(this.flagShot == 5) {
//播放发射子弹的音乐
            musics[0].play();
//发射子弹之前,需要创建子弹对象
            if(this.weaponType == 1) {
//创建双排子弹对象
                var bullet = new Bullet(this.x + this.w / 2 - 24, this.y + 15, 48, 14, bulletImg2, 2);
            } else {
//创建单排子弹对象
                var bullet = new Bullet(this.x + this.w / 2 - 3, this.y - 14, 6, 14, bulletImg1, 1);
            }
//记录子弹
            this.bullets.push(bullet);
//重置
            this.flagShot = 0;
        }
//移动每一颗子弹
        for(var i = 0; i < this.bullets.length; i++) {
//判断当前子弹是否超出屏幕
            if(this.bullets[i].y <= -this.bullets[i].h) {
//删除子弹对象 --- i对应的子弹对象
                this.bullets.splice(i, 1);
                i--;
            } else {
//移动子弹
                this.bullets[i].move();
//绘制子弹
                this.bullets[i].draw();
            }

        }
    }
};

//第六步:创建子弹类(多个子弹) -- 构造函数
function Bullet(x, y, w, h, imgType, hurt) {
//属性
    this.x = x;
    this.y = y; //绘制子弹的位置
    this.w = w; //子弹宽度
    this.h = h; //子弹高度
    this.img = imgType; //子弹对象
    this.hurt = hurt; //子弹伤害值
}
//方法 绘制子弹 写在原型中
Bullet.prototype.draw = function() {
//绘制子弹
    context.drawImage(this.img, this.x, this.y, this.w, this.h);
}
//方法 子弹移动(发射)
Bullet.prototype.move = function() {
    this.y -= 5;
}

//第八步:鼠标控制英雄战机
canvas.onmousedown = function(e) {
    var event1 = e || event;
//1.得到鼠标点位置
    var x = event1.offsetX;
    var y = event1.offsetY;
//2.判断鼠标是否选中我方英雄战机
    if(x >= hero.x && x <= hero.x + hero.w && y >= hero.y && y <= hero.y + hero.h) {
//选中飞机,才能让飞机跟着移动
        canvas.onmousemove = function(e2) {
            var event2 = e2 || event;
//设置飞机的中心点在鼠标点的位置
            hero.x = event2.offsetX - hero.w / 2;
            hero.y = event2.offsetY - hero.h / 2;
        }

    }

}

//添加鼠标松开事件
canvas.onmouseup = function() {
    canvas.onmousemove = null;
}

//第九步:触摸屏的移动 --- 移动端触摸事件
canvas.ontouchstart = function(event) {
//获取手指触摸点的位置
    var x = event.touches[0].clientX;
    var y = event.touches[0].clientY;
//2.判断手指触摸点是否选中我方英雄战机
    if(x >= hero.x && x <= hero.x + hero.w && y >= hero.y && y <= hero.y + hero.h) {
//选中飞机,才能移动
        canvas.ontouchmove = function(event) {
//飞机的中心点设置在手指的位置
            hero.x = event.touches[0].clientX - hero.w / 2;
            hero.y = event.touches[0].clientY - hero.h / 2;
//禁止系统事件
            event.preventDefault();
        }
    }
}
canvas.ontouchend = function() {
    canvas.ontouchmove = null;
}

//第十步:绘制敌机 --- 敌人类
function Enemy(x, y, w, h, img, speed, hp, score, maxI) {
//属性
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.img = img; //敌机对象类型
    this.speed = speed; //速度
    this.hp = hp; //血量
    this.score = score; //击毁敌机所得分数
    this.maxI = maxI; //播放图片的最大张数
    this.boom = false; //是否销毁
    this.i = 0; //播放第几张图片
    this.flagI = 0; //图片切换到的频率
    this.isDie = false; //是否死亡
}
//方法 --- 绘制敌机
Enemy.prototype.draw = function (){
//敌机爆炸,切换图片
    if (this.boom == true) {//this.boom
        this.flagI++;
        if (this.flagI == 5) {
            this.i++;
            if (this.i == this.maxI) {
//当前图片切换结束,飞机死亡
                this.isDie = true;
            }
            this.flagI = 0;//重置
        }
    }
//绘制敌机
    context.drawImage(this.img,this.i * this.w,0,this.w,this.h,this.x,this.y,this.w,this.h);
}
//敌机移动
Enemy.prototype.move = function (){
    this.y += this.speed;
}
//随机函数
function random(x,y){
    return Math.floor(Math.random() * (y - x + 1) + x);
}
//获取敌机类型
var enemyImg1 = imgs[3];//小型机对象
var enemyImg2 = imgs[4];//中型机对象
var enemyImg3 = imgs[5];//大型机对象
var enemies = [];//记录随机的敌机对象
//第十一步:随机产生敌机对象
function randomEnemy(){
//控制飞机产生的概率
    var num = random(1,800);
    if (num <= 50) {
        if (num <= 40) {//创建小型飞机
//随机位置
            var randomX = random(0,canvas.width - 38);
//随机速度
            var randomSpeed = random(3,8);
//创建小型飞机
            var enemy = new Enemy(randomX,-36,38,34,enemyImg1,randomSpeed,1,100,5);
//添加飞机到数组中
            enemies.push(enemy);
        }else if(num <= 48){//中型飞机
//随机位置
            var randomX = random(0,canvas.width - 46);
            var randomSpeed = random(2,5);
//创建中型机
            var enemy = new Enemy(randomX,-64,46,64,enemyImg2,randomSpeed,5,500,6);
//添加到数组中
            enemies.push(enemy);
        }else{//大型飞机
//随机位置
            var randomX = random(0,canvas.width - 110);
//随机速度
            var randomSpeed = random(2,4);
//创建大飞机
            var enemy = new Enemy(randomX,-164,110,164,enemyImg3,randomSpeed,10,1000,10);
//添加飞机到数组中
            enemies.push(enemy);
        }
    }
//绘制和移动飞机
    for (var i = 0;i < enemies.length;i++) {
//判断飞机是否超出屏幕
        if (enemies[i].y >= canvas.height || enemies[i].isDie) {
//删除该飞机对象
            enemies.splice(i,1);
            i--;//为了避免下一个数组元素
        }else{
//绘制和移动飞机
            enemies[i].move();
            enemies[i].draw();
        }
    }
}


//第十二步:绘制道具 ----- 炸弹还是双排子弹
function Prop(x,y,w,h,type,speed){
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.type = type;//道具类型(0:炸弹 1:双排子弹)
    this.speed = speed;
    this.isUsed = false;//道具有没有被使用
}
var propImg = imgs[8];//道具对象
//方法 -- 绘制
Prop.prototype.draw = function (){
    context.drawImage(propImg,this.w * this.type,0,this.w,this.h,this.x,this.y,this.w,this.h);
}
//方法 -- 移动
Prop.prototype.move = function (){
    this.y += this.speed;
}
//创建一个数组,存储所有的道具
var props = [];
//随机产生道具
function randomProp(){
//控制道具产生的概率
    if (random(1,1000) <= 20) {
        var randomX = random(0,canvas.width - 38);
//随机类型,要么是炸弹,要么是双排子弹
        var randomType = random(0,1);
        var randomSpeed = random(5,10);
        var prop = new Prop(randomX,-68,38,68,randomType,randomSpeed);
//存储到数组中
        props.push(prop);
    }
//移动道具
    for (var i = 0;i < props.length;i++) {
//当道具超出屏幕,或者道具被使用
        if (props[i].y >= canvas.height || props[i].isUsed) {
//删除该道具
            props.splice(i,1);
            i--;
        }else{
            props[i].draw();
            props[i].move();
        }
    }
}

//第十三步:碰撞检测(两个矩形碰撞检测)
function isCrash(obj1,obj2){
//得到两个对象上下左右的位置
    var left1 = obj1.x;
    var right1 = obj1.x + obj1.w;
    var top1 = obj1.y;
    var bottom1 = obj1.y + obj1.h;
    var left2 = obj2.x;
    var right2 = obj2.x + obj2.w;
    var top2 = obj2.y;
    var bottom2 = obj2.y + obj2.h;
//判断是否发生碰撞
    if (right1 < left2 || bottom1 < top2 || left1 > right2 || top1 > bottom2) {
        return false;
    }else{
        return true;
    }
}

var timeOut = null;//存储双排子弹发射的时间延迟器
//处理碰撞检测
function collision(){
// 1.道具和英雄战机的碰撞处理
    for (var i = 0;i < props.length;i++) {
//如果英雄死亡
        if (hero.boom) {
            continue;
        }
//英雄和道具没有碰撞
        if (!isCrash(props[i],hero)) {
            continue;
        }
//发生碰撞
        if (props[i].type == 1) {//双排子弹
//改变英雄的武器
            hero.weaponType = 1;
            clearTimeout(timeOut);//清除之前的延迟器
//双排子弹持续时间5秒
            timeOut = setTimeout(function (){
                hero.weaponType = 0;
            },5000);
        }else{//炸弹
//所有敌机爆炸
            for (var j = 0;j < enemies.length;j++) {
                enemies[j].boom = true;
//计分
                scoreSpan.innerHTML = parseInt(scoreSpan.innerText) + enemies[j].score;
            }
        }
//修改道具的使用状态
        props[i].isUsed = true;
    }
//2.子弹(hero.bullets)和敌机(enemies)的碰撞
    for (var i = 0;i < enemies.length;i++) {
        for (var j = 0;j < hero.bullets.length;j++) {
            if (enemies[i].boom) {//敌机如果已经销毁,则不处理
                break;
            }
//检测是否发生碰撞,如果碰撞
            if (isCrash(enemies[i],hero.bullets[j])) {
//1.敌机失血
                enemies[i].hp -= hero.bullets[j].hurt;
//2.判断敌机是否死亡
                if (enemies[i].hp <= 0) {
                    enemies[i].boom = true;//敌机死亡
//计分
                    scoreSpan.innerHTML = parseInt(scoreSpan.innerText) + enemies[i].score;
//判断飞机类型,处理声音
                    switch (enemies[i].score){
                        case 100:{//小型机销毁
                            musics[1].play();
                            break;
                        }
                        case 500:{//中型机销毁
                            musics[2].play();
                            break;
                        }
                        case 1000:{//大型机销毁
                            musics[3].play();
                            break;
                        }
                        default:
                            break;
                    }
                }
//子弹消失,消除子弹
                hero.bullets.splice(j,1);
                j--;
            }
        }
    }
//3.敌机和英雄战机的处理
    for (var i = 0;i < enemies.length;i++) {
//如果敌机已经爆炸,不做碰撞检测
        if (enemies[i].boom) {
            continue;
        }
        if (isCrash(enemies[i],hero)) {
//英雄战机爆炸
            hero.boom = true;
        }
    }
}

//窗口尺寸发生改变时,触发的方法
window.onresize = function (){
    canvas.width = document.documentElement.clientWidth;
    canvas.height = document.documentElement.clientHeight;
    background.draw();
}
//英雄死亡的方法
function gameOver() {
//暂停背景音乐
    musics[4].pause();
//播放游戏结束音乐
    musics[5].play();
//修改分数 --- 结束菜单上的分数
    scoresEnd.innerText = scoreSpan.innerText;
//显示结束菜单
    menu.style.display = "block";
}

//开始游戏
function beginGame() {
//第四步:调用绘制背景图和移动背景图的方法
    background.draw();
    background.move();
//第七步:调用绘制英雄
    hero.draw();
    hero.shotBiu();
//随机创建敌机对象
    randomEnemy();
//随机创建道具对象
    randomProp();
//判断碰撞检测
    if (!hero.boom) {
        collision();//碰撞检测
    }
//调用刷新频率改变时,自动调用的方法
    window.requestAnimationFrame(beginGame);
}


//重新按钮
restart.onclick = function (){
// location.reload();//重新加载网页---刷新
//或者
//通过产生不同的随机数,来刷新网页,保证每次刷新的url网址都不同
    location.href = location.href + "?id=" + 10000 * Math.random();
}
