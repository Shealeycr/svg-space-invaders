
var slotPositions;
var shipPos = 2;

var shipSpeedStep;
var maxShipSpeedStep;

var shipTimeStep;
var minShipTimeStep;

var shipFireRate;
var minShipFireRate;

var spawnDifference;
var loopTime = 33; // time between frames (30 fps)

var svgArea;
var player;
var enemies = [];
var blueLasers = [];
var redLasers = [];

var gameScore = 0;
var highScore = 0;
var gameOver = false;

function init()
{
    shipPos = 2;

    shipSpeedStep = 1;
    maxShipSpeedStep = 5;
    
    shipTimeStep = 3000;
    minShipTimeStep = 1000;
    
    shipFireRate = 5;
    minShipFireRate = 1;
    
    spawnDifference = 0;
    gameScore = 0;
    
    window.onresize = resizeEvent;
    document.addEventListener('keydown', keyDownEvent);
    svgArea = document.getElementById("svgArea");
    player = document.getElementById("player");
    
    var screenCenter = window.innerWidth / 2;
    slotPositions = [ 
        screenCenter - 200, 
        screenCenter - 100, 
        screenCenter, 
        screenCenter + 100, 
        screenCenter + 200 
    ];
    	
    player.setAttribute("x", slotPositions[shipPos] - 26);
    player.setAttribute("y", window.innerHeight - 100);
    
    for (var i = 0; i < slotPositions.length; i++)
    {
        var pod = document.getElementById("pod" + (i + 1));
        pod.setAttribute("x", slotPositions[i] - 26);
        pod.setAttribute("y", window.innerHeight - 50);
    }
    
    gameLoop();
}

function resizeEvent(e)
{
    var screenCenter = window.innerWidth / 2;
    slotPositions = [ 
        screenCenter - 200, 
        screenCenter - 100, 
        screenCenter, 
        screenCenter + 100, 
        screenCenter + 200 
    ];
    
    player.setAttribute("x", slotPositions[shipPos] - 26);
    
    for (var i = 0; i < slotPositions.length; i++)
    {
        var pod = document.getElementById("pod" + (i + 1));
        pod.setAttribute("x", slotPositions[i] - 26);
        pod.setAttribute("y", window.innerHeight - 50);
    }
    
    for (var i = 0; i < enemies.length; i++)
    {
        var enemy = enemies[i];
        var xPos = parseFloat(enemy.getAttribute("x"));
        enemy.setAttribute("x", slotPositions[parseInt(enemy.id)] - 40);
    }
    
    for (var i = 0; i < blueLasers.length; i++)
    {
        var blueLaser = blueLasers[i];
        var xPos = parseFloat(blueLaser.getAttribute("x"));
        blueLaser.setAttribute("x", slotPositions[parseInt(blueLaser.id)]);
    }
    
    for (var i = 0; i < redLasers.length; i++)
    {
        var redLaser = redLasers[i];
        var xPos = parseFloat(redLaser.getAttribute("x"));
        redLaser.setAttribute("x", slotPositions[parseInt(redLaser.id)]);
    }
}

function keyDownEvent(e) 
{
    if (!gameOver)
    {
        if (e.keyCode == '38') // up arrow
        {
			 e.preventDefault();
            var xPos = parseFloat(player.getAttribute("x"));
            var width = parseFloat(player.getAttribute("width"));
            
            var yPos = window.innerHeight - 150;
            
            var blueLaser = createImage(xPos + 30, yPos, 10, 50, "images/laserBlue.png");
            blueLaser.id = shipPos;
            blueLasers.push(blueLaser);
        }
        else if (e.keyCode == '37')  // left arrow
        {
			 e.preventDefault();
            shipPos = Math.max(shipPos - 1, 0);
            player.setAttribute("x", slotPositions[shipPos] - 26);
        }
        else if (e.keyCode == '39') // right arrow
        {
			 e.preventDefault();
            shipPos = Math.min(shipPos + 1, slotPositions.length - 1);
            player.setAttribute("x", slotPositions[shipPos] - 26);
        }
    }
}

function createImage(x, y, width, height, url) 
{
    var style = {};
    style["x"] = x;
    style["y"] = y;
    style["width"] = width;
    style["height"] = height;
    style["visibility"] = "visible";
    var svgItem = makeSVG('image', style);
    svgItem.setAttributeNS('http://www.w3.org/1999/xlink', 'href', url);
    svgArea.appendChild(svgItem);
    return svgItem;
}

function makeSVG(tag, attributes)
{
    var el = document.createElementNS('http://www.w3.org/2000/svg', tag);
    for (var k in attributes)
    {
        el.setAttribute(k, attributes[k]);
    }
    return el;
}

function checkCollision(svgItem1, svgItem2)
{
    var r1 = svgItem1.getBoundingClientRect();
    var r2 = svgItem2.getBoundingClientRect();
 
    return !(r2.left > r1.right || 
             r2.right < r1.left || 
             r2.top > r1.bottom ||
             r2.bottom < r1.top);
}

function gameLoop()
{
    spawnDifference += loopTime;
    
    for (var i = 0; i < enemies.length; i++)
    {
        var enemy = enemies[i];
        
        var xPos = parseFloat(enemy.getAttribute("x"));
        var yPos = parseFloat(enemy.getAttribute("y"));
        
        if (yPos > parseFloat(player.getAttribute("x") - 80)) 
        {
            gameOver = true;
            break;
        } 
        else 
        {
            yPos += shipSpeedStep;
            enemy.setAttribute("y", yPos);
        }
        
        for (var j = 0; j < blueLasers.length; j++)
        {
            var blueLaser = blueLasers[j];
            if (checkCollision(enemy, blueLaser))
            {
                enemies.splice(i, 1);
                svgArea.removeChild(enemy);
                enemy = undefined;
                i--;
                
                blueLasers.splice(j, 1);
                svgArea.removeChild(blueLaser);
                
                gameScore += 10;
                
                break;
            }
        }
        
        if (enemy != undefined)
        {
            // Since 30 fps, means shoots every ~shipFireRate seconds
            if (Math.random() < 1 / (30.0 * shipFireRate)) 
            {
                var width = parseFloat(enemy.getAttribute("width"));
                var redLaser = createImage(xPos + width / 2.3, yPos + 80, 10, 50, "images/laserRed.png");
                redLaser.id = enemy.id;
                redLasers.push(redLaser);
            }
        }
    }
    
    for (var i = 0; i < blueLasers.length; i++)
    {
        var blueLaser = blueLasers[i];
        var yPos = parseFloat(blueLaser.getAttribute("y"));
        
        if (yPos < 0)
        {
            blueLasers.splice(i, 1);
            svgArea.removeChild(blueLaser);
            i--;
            continue;
        }
        
        yPos -= 20;
        blueLaser.setAttribute("y", yPos);
        
        for (var j = 0; j < redLasers.length; j++)
        {
            var redLaser = redLasers[j];
            if (checkCollision(blueLaser, redLaser))
            {
                redLasers.splice(j, 1);
                svgArea.removeChild(redLaser);
                break;
            }
        }
    }
    
    for (var i = 0; i < redLasers.length; i++)
    {
        var redLaser = redLasers[i];
        var yPos = parseFloat(redLaser.getAttribute("y"));
        
        if (yPos > window.innerHeight)
        {
            redLasers.splice(i, 1);
            svgArea.removeChild(redLaser);
            i--;
            continue;
        }
        
        yPos += 20;
        redLaser.setAttribute("y", yPos);
        
        if (checkCollision(player, redLaser))
        {
            gameOver = true;
            break;
        }
    }

    if (spawnDifference > shipTimeStep) 
    {
        //new Enemies
        console.log("new Enemies");
        spawnDifference = 0;
        spawnMoreEnemies();

        shipSpeedStep += 0.1;
        shipSpeedStep = Math.min(shipSpeedStep, maxShipSpeedStep);

        shipTimeStep -= 100;
        shipTimeStep = Math.max(shipTimeStep, minShipTimeStep);

        shipFireRate -= 0.5;
        shipFireRate = Math.max(shipFireRate, minShipFireRate);
    }
    
    if (!gameOver)
    {
        setTimeout(function()
        {
            gameLoop();
        }, loopTime);
    }
    else
    {
        endGame();
    }
}

function spawnMoreEnemies() 
{
    for (var i = 0; i < slotPositions.length; i++) 
    {
        var enemy = createImage(slotPositions[i] - 40, 100, 80, 80, "images/enemyShip.png");
        enemy.id = i;
        enemies.push(enemy);
    }
}

function endGame()
{
    for (var i = 0; i < enemies.length; i++)
    {
        var enemy = enemies[i];
        enemies.splice(i, 1);
        svgArea.removeChild(enemy);
        i--;
    }
    
    for (var i = 0; i < redLasers.length; i++)
    {
        var redLaser = redLasers[i];
        redLasers.splice(i, 1);
        svgArea.removeChild(redLaser);
        i--;
    }
    
    for (var i = 0; i < blueLasers.length; i++)
    {
        var blueLaser = blueLasers[i];
        blueLasers.splice(i, 1);
        svgArea.removeChild(blueLaser);
        i--;
    }
    
    highScore = Math.max(highScore, gameScore);
    document.getElementById("gameOverPopup").style.display = "block";
    document.getElementById("score").innerHTML = "Score: " + gameScore;
    document.getElementById("highScore").innerHTML = "High Score: " + highScore;
}

function playAgain()
{
    document.getElementById("gameOverPopup").style.display = "none";
    gameOver = false;
    init();
}

init();
