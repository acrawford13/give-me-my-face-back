
        window.requestAnimFrame = (function(callback) {
            return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame || function(callback) {
                window.setTimeout(callback, 1000 / 60);
            };
        })();
        var width = window.innerWidth;
        var height = window.innerHeight;
        var t;
        var diffLevel = 0;
        var currentBackgroundColor = "hsl(" + (Math.random() * 360) + ",50%,50%)";
        var totalPoints = 0;
        var points = 0;
        var possiblePoints = 0;
        var level = 0;
        var totalHealth = 100;
        var healthLost = 0;
        var glitchGaps = [];
        var clickNum = 0;
        var scaleBy = 4;
        var scale = function(x) {
            return x * scaleBy;
        }
        var scaledown = function(x) {
            return x / scaleBy;
        }
        var soundJumpArray = jsfxr([0, , 0.1034, , 0.2751, 0.3792, , 0.1206, , , , , , 0.3647, , , , , 0.8406, , , , , 0.5]);
        var soundPointArray = jsfxr([0, , 0.0161, 0.3298, 0.2513, 0.7434, , , , , , , , , , , , , 1, , , , , 0.5]);
        var soundJump = new Audio();
        var soundPoint = new Audio();
        soundJump.src = soundJumpArray;
        soundPoint.src = soundPointArray;
        
        var pointsElement = document.getElementById("points");
        var instructionsElement = document.getElementById("instructions");
        var canvasGuyElement = document.getElementById("canvasGuy");
        var canvasGlitchElement = document.getElementById("canvasGlitch");
        var canvasPointerElement = document.getElementById("canvasPointer");
        var canvasBackgroundElement = document.getElementById("canvasBackground");
        
        var canvasGuy = canvasGuyElement.getContext('2d');
        var canvasGlitch = canvasGlitchElement.getContext('2d');
        var canvasPointer = canvasPointerElement.getContext('2d');
        var canvasBackground = canvasBackgroundElement.getContext('2d');
        
        document.getElementsByTagName("html")[0].style.backgroundColor = currentBackgroundColor;
        
        // resize all canvases
        var initCanvasElements = function(canvasElementsArray) {
            for (var i = 0; i < canvasElementsArray.length; i++) {
                canvasElementsArray[i].width = width;
                canvasElementsArray[i].height = height;
            }
        }
        initCanvasElements([canvasGuyElement, canvasGlitchElement, canvasPointerElement, canvasBackgroundElement]);
        // disable smoothing on all canvases
        var initCanvases = function(canvasArray) {
            for (var i = 0; i < canvasArray.length; i++) {
                canvasArray[i].mozImageSmoothingEnabled = false;
                canvasArray[i].webkitImageSmoothingEnabled = false;
                canvasArray[i].msImageSmoothingEnabled = false;
                canvasArray[i].imageSmoothingEnabled = false;
            }
        }
        initCanvases([canvasGuy, canvasGlitch]);
        var pointer = {
            x: 0,
            y: 0,
            height: 20,
            width: 12,
            sprite: new Image()
        }
        pointer.sprite.src = "mouse.png";
        var guy = {
            x: 0,
            y: Math.round(scaledown(canvasGuyElement.height / 3)),
            vx: 0,
            vy: 0,
            height: 32,
            width: 24,
            realSpeed: 15,
            run: function() {
                this.vx = this.realSpeed / 3600 * this.height / 1.7
            },
            ay: 0.00000098 * this.height / 1.7,
            sprite: new Image(),
            pose: 0,
            glitch: {
                x: 14,
                y: 0,
                width: 1,
                height: 12
            },
            update: function(t) {
                this.x = this.x + this.vx * t;
                this.y = this.y + this.vy * t;
                this.vy = this.vy + this.ay * t;
                if (this.vx) {
                    this.pose += 0.2;
                    if (this.pose >= 7) {
                        this.pose = 0;
                    }
                }
                if (this.y > scaledown(canvasGuyElement.height)) {
                    this.y = Math.round(scaledown(canvasGuyElement.height / 3));
                    totalHealth -= 10;
                    refreshScreen();
                }
            },
            drawSprite: function() {
                canvasGuy.drawImage(this.sprite, Math.floor(this.pose) * this.width, 0, this.glitch.x, this.height, scale(Math.floor(this.x)), scale(Math.floor(this.y)), scale(this.glitch.x), scale(this.height));
                canvasGuy.drawImage(this.sprite, Math.floor(this.pose) * this.width, this.glitch.height + this.glitch.y, this.width, this.height - this.glitch.height, scale(Math.floor(this.x)), scale(Math.floor(this.y + this.glitch.height)), scale(this.width), scale(this.height - this.glitch.height));
                canvasGuy.drawImage(this.sprite, (Math.floor(this.pose) * this.width) + this.width - 6, 0, 6, this.height, scale(Math.floor(this.x + this.width - 6)), scale(Math.floor(this.y)), scale(6), scale(this.height));
            },
            drawGlitch: function() {
                possiblePoints = 0;
                var randomness = 1.06;
                var randDir = function() {
                    var d = (Math.random() * randomness * 2) - randomness;
                    if (d < 1 && d > -1) {
                        return 0;
                    } else {
                        return Math.round(d);
                    }
                }
                var totalWidthGlitch = scaledown(canvasGlitchElement.width) - this.x - this.glitch.x;
                var glitchLocations = [0];
                for (var i = 1; i < diffLevel; i++) {
                    glitchLocations.push(Math.round(Math.random() * totalWidthGlitch));
                }
                glitchLocations.push(Math.round(totalWidthGlitch));

                function compareNumbers(a, b) {
                    return a - b;
                }
                glitchLocations.sort(compareNumbers);
                var glitchY = this.y;
                for (var j = 0; j < glitchLocations.length - 1; j++) {
                    for (var i = glitchLocations[j]; i < glitchLocations[j + 1]; i += 4) {
                        canvasGlitch.drawImage(this.sprite, this.glitch.x, this.glitch.y, this.glitch.width, this.glitch.height, scale(this.x + this.glitch.x + i), scale(glitchY), scale(4), scale(this.glitch.height));
                        fillArrayColor(this.x + this.glitch.x + i, glitchY + (this.glitch.height / 2), 4, 1, colorsCanvasGlitch);
                        if (diffLevel > 0) {
                            glitchY += randDir();
                        }
                        possiblePoints++;
                    }
                    glitchY = scaledown(Math.random() * (canvasGlitchElement.height - 2 * scale(this.height))) + this.height / 2;
                }
            }
        }
        guy.sprite.src = "spriteSheet.png";

        canvasBackground.fillStyle = currentBackgroundColor;
        canvasBackground.fillRect(0, 0, canvasBackgroundElement.width, canvasBackgroundElement.height);
        //make the refresh icon
        var drawRefreshIcon = function() {
            canvasBackground.strokeStyle = "rgba(0,0,0,0.4)";
            canvasBackground.lineWidth = "2";
            canvasBackground.beginPath();
            canvasBackground.arc(canvasPointerElement.width - 50, canvasPointerElement.height - 50, 28, 0, 2 * Math.PI);
            canvasBackground.stroke();
            canvasBackground.lineWidth = "1";
            canvasBackground.beginPath();
            canvasBackground.arc(canvasPointerElement.width - 50, canvasPointerElement.height - 50, 15, -0.25 * Math.PI, 1.5 * Math.PI);
            canvasBackground.lineTo(canvasPointerElement.width - 60, canvasPointerElement.height - 67);
            canvasBackground.moveTo(canvasPointerElement.width - 55, canvasPointerElement.height - 57);
            canvasBackground.lineTo(canvasPointerElement.width - 50, canvasPointerElement.height - 65);
            canvasBackground.stroke();
        }
        
        var drawHealthBar = function() {
                var barWidth = Math.round((canvasBackgroundElement.width * 0.5) / 10) * 10;
                var level = Math.round(barWidth * (totalHealth - healthLost) / 1000) * 10;
                canvasBackground.clearRect(canvasBackgroundElement.width * 0.5 - 20, 20, barWidth, 20);
                canvasBackground.fillStyle = "rgba(0,0,0,0.4)";
                canvasBackground.fillRect(canvasBackgroundElement.width * 0.5 - 20, 20, level, 20);
                canvasBackground.fillStyle = "rgba(255,255,255,0.1)";
                canvasBackground.fillRect(level + canvasBackgroundElement.width * 0.5 - 20, 20, barWidth - level, 20);
                canvasBackground.fillStyle = currentBackgroundColor;
                canvasBackground.strokeStyle = "rgba(0,0,0,0.4)";
                canvasBackground.font = "14px Arial";
                canvasBackground.fillText("SANITY", canvasBackgroundElement.width * 0.5 - 10, 38);
            }

        var colorsCanvasPointer = new Array(Math.round(scaledown(width) * scaledown(height))).fill(false);
        var colorsCanvasGlitch = new Array(Math.round(scaledown(width) * scaledown(height))).fill(false);
        colorsCanvasPointer.width = Math.round(scaledown(width));
        colorsCanvasGlitch.width = Math.round(scaledown(width));
        var fillArrayColor = function(x1, y1, xLength, yLength, colorsCanvas) {
            for (var j = 0; j < yLength; j++) {
                for (var i = 0; i < xLength; i++) {
                    colorsCanvas[((Math.round(y1) + j) * colorsCanvas.width + Math.round(x1) + i)] = true;
                }
            }
        }
        var getArrayColor = function(x1, y1, xLength, yLength, colorsCanvas) {
            var arrayColor = [];
            for (var j = 0; j < Math.round(yLength); j++) {
                for (var i = 0; i < Math.round(xLength); i++) {
                    arrayColor[Math.round(xLength) * j + i] = colorsCanvas[((Math.round(y1) + j) * colorsCanvas.width + Math.round(x1) + i)];
                }
            }
            return arrayColor;
        }
        var collisionTest = function(x1, y1, xLength, yLength, colorsCanvas) {
            var arrayColor = getArrayColor(x1, y1, xLength, yLength, colorsCanvas);
            var collision = false;
            var i = 0;
            while (!collision && i < arrayColor.length) {
                collision = arrayColor[i];
                i += 1;
            }
            return collision;
        }
        document.addEventListener("mousemove", function(event) {
            mouse(event)
        });
        var mouse = function(e) {
            pointer.x = e.clientX;
            pointer.y = e.clientY;
        }
        var firstFrame = function() {
            guy.drawSprite();
            guy.drawGlitch();
            drawHealthBar();
            drawRefreshIcon();
            canvasBackground.fillStyle = "rgba(0,0,0,0.4)";
            canvasBackground.fillRect(0, scale(guy.y + guy.height), scale(25), scale(5));
            fillArrayColor(0, guy.y + guy.height, 25, 5, colorsCanvasPointer);
            if (level == 1) {
                instructionsElement.innerHTML = "Click to enable cursor-glitching.";
            } else if (level == 2) {
                instructionsElement.innerHTML = "Be careful! Your sanity level goes down each time you miss a piece of your face.";
            } else if (level == 3) {
                instructionsElement.innerHTML = "If you get stuck, use the cursor to push yourself along,<br>or fill in the refresh button to restart the level";
            }
        }
        var music = document.createElement("audio");
        var loadingScreen = function() {
            var loadingText = "loading...";
            canvasBackground.fillStyle = 'white';
            canvasBackground.strokeStyle = 'white';
            canvasBackground.font = '30px Arial';
            canvasBackground.fillText(loadingText, (canvasBackgroundElement.width - canvasBackground.measureText(loadingText).width) / 2, canvasBackgroundElement.height / 2);

            var player = new CPlayer();
            player.init(song);
            var musicLoaded = false;
            var musicLoadingLoop = setInterval(function() {
                musicLoaded = player.generate() >= 1;
                if (musicLoaded) {
                    var wave = player.createWave();
                    music.src = URL.createObjectURL(new Blob([wave], {
                        type: "audio/wav"
                    }));
                    music.play();
                    music.loop = true;
                    clearInterval(musicLoadingLoop);
                    startScreen();
                }
            }, 0);
        }
        
        var startScreen = function() {
            var title = "Give me my face back!";
            var startText1 = "fill the box";
            var startText2 = "to start";
            var muteText = "press M to mute the music";
            var xBox = canvasBackgroundElement.width * 0.5 - 50;
            var yBox = canvasBackgroundElement.height * 0.5;
            var boxWidth = 100;
            var boxHeight = 50;
            canvasBackground.lineWidth = "2";
            canvasBackground.clearRect(0, 0, canvasBackgroundElement.width, canvasBackgroundElement.height);
            canvasBackground.strokeRect(xBox, yBox, boxWidth, boxHeight);
            canvasBackground.font = '48px Arial';
            canvasBackground.fillText(title, (canvasBackgroundElement.width - canvasBackground.measureText(title).width) / 2, canvasBackgroundElement.height / 2 - 50);
            canvasBackground.font = "18px Arial";
            canvasBackground.fillText(startText1, (canvasBackgroundElement.width - canvasBackground.measureText(startText1).width) / 2, yBox + 20);
            canvasBackground.fillText(startText2, (canvasBackgroundElement.width - canvasBackground.measureText(startText2).width) / 2, yBox + 40);
            canvasBackground.fillText(muteText, (canvasBackgroundElement.width - canvasBackground.measureText(muteText).width) / 2, canvasBackgroundElement.height * 0.5 + 90);
            diffLevel = 0;
            var startScreenLoop = function() {
                canvasPointer.drawImage(pointer.sprite, pointer.x, pointer.y);
                fillArrayColor(scaledown(pointer.x), scaledown(pointer.y), scaledown(pointer.width), scaledown(pointer.height), colorsCanvasPointer);
                var startFilled = 0;
                if (pointer.x + pointer.width / 2 > xBox && pointer.x - pointer.width / 2 < xBox + boxWidth && pointer.y + pointer.height / 2 > yBox && pointer.y - pointer.height / 2 < yBox + boxHeight) {
                    var startBox = getArrayColor(scaledown(xBox), scaledown(yBox), scaledown(boxWidth), scaledown(boxHeight), colorsCanvasPointer);
                    for (var i = 0; i < startBox.length; i++) {
                        startFilled += startBox[i] > 0;
                    }
                }
                if (startFilled > 90 / 100 * scaledown(boxWidth) * scaledown(boxHeight)) {
                    document.addEventListener("click", start);
                    pointsElement.style.display = "block";
                    level++;
                    refreshScreen();
                } else {
                    requestAnimFrame(startScreenLoop);
                }
            }
            startScreenLoop();
        }
        loadingScreen();
        var endScreen = function() {
            canvasBackground.clearRect(0, 0, canvasBackgroundElement.width, canvasBackgroundElement.height);
            canvasGlitch.clearRect(0, 0, canvasGlitchElement.width, canvasGlitchElement.height);
            canvasPointer.clearRect(0, 0, canvasPointerElement.width, canvasPointerElement.height);
            canvasGuy.clearRect(0, 0, canvasGuyElement.width, canvasGuyElement.height);
            canvasBackground.fillStyle = 'white';
            var gameOverText = "game over";
            canvasBackground.font = '48px Arial';
            canvasBackground.fillText(gameOverText, (canvasBackgroundElement.width - canvasBackground.measureText(gameOverText).width) / 2, canvasBackgroundElement.height / 2 - 50);
            console.log("dead");
            instructionsElement.innerHTML = "You retrieved " + (totalPoints + points) + " bits of your face before losing your mind.<br>Click to try again.";
            addEventListener("click", restart);
        }
        var restart = function() {
            currentBackgroundColor = "hsl(" + (Math.random() * 360) + ",50%,50%)";
            totalPoints = 0;
            points = 0;
            possiblePoints = 0;
            totalHealth = 100;
            healthLost = 0;
            glitchGaps = [];
            clickNum = 0;
            canvasGlitch.clearRect(0, 0, canvasGlitchElement.width, canvasGlitchElement.height);
            canvasGuy.clearRect(0, 0, canvasGuyElement.width, canvasGuyElement.height);
            canvasBackground.clearRect(0, 0, canvasBackground.width, canvasBackground.height);
            canvasPointer.clearRect(0, 0, canvasBackground.width, canvasBackground.height);
            canvasBackground.fillStyle = "white";
            pointsElement.innerHTML = "0";
            instructionsElement.innerHTML = "";
            startScreen();
            removeEventListener("click", restart);
        }
        var draw = function() {
            canvasPointer.drawImage(pointer.sprite, pointer.x, pointer.y);
            fillArrayColor(scaledown(pointer.x), scaledown(pointer.y), scaledown(pointer.width), scaledown(pointer.height), colorsCanvasPointer);
            canvasGuy.clearRect(0, 0, canvasGuyElement.width, canvasGuyElement.height);
            for (var i = 0; i < glitchGaps.length; i++) {
                if (glitchGaps[i]) {
                    canvasGlitch.clearRect(scale(i), 0, scale(-4), canvasGlitchElement.height);
                }
            }
            guy.drawSprite();
        }
        var start = function(event) {
            clickNum++;
            t = Date.now();
            if (clickNum == 1) {
                requestAnimFrame(trackLoop);
            } else if (clickNum == 2) {
                instructionsElement.innerHTML = "";
                requestAnimFrame(mainLoop);
            }
        }
        var muteMusic = function(event) {
            if (event.keyCode == 77 || event.keyCode == 186) {
                music.muted = !music.muted;
            }
        }
        document.addEventListener("keydown", muteMusic);
        var mainLoop = function() {
            var durationToHandle = Math.min(Date.now() - t);
            t = Date.now();
            guy.update(durationToHandle);
            var pointerCollision = pointer.x > scale(guy.x) && pointer.x < scale(guy.x + guy.width) && pointer.y > scale(guy.y + (guy.height * 0.75)) && pointer.y < scale(guy.y + guy.height);
            if (collisionTest(guy.x + guy.width * .2, guy.y + guy.height - 1, guy.width * .6, 1, colorsCanvasPointer)) {
                guy.y = Math.floor(guy.y);
                guy.vy = Math.min(0, guy.vy);
            }
            if (collisionTest(Math.floor(guy.x + guy.glitch.x), guy.y + 4, 1, 8, colorsCanvasGlitch) && guy.x < scaledown(canvasGuyElement.width)) {
                if (!glitchGaps[Math.floor(guy.x + guy.glitch.x)] && Math.floor(guy.x + guy.glitch.x) % 4 == 0) {
                    soundPoint.play();
                    glitchGaps[Math.floor(guy.x + guy.glitch.x)] = true;
                }
            }
            if (collisionTest(guy.x + guy.width - 1, guy.y, 1, guy.height * 0.75, colorsCanvasPointer)) {
                guy.vx = 0;
            } else {
                while (collisionTest(guy.x, guy.y + guy.height - 1, guy.width, 1, colorsCanvasPointer) && !pointerCollision) {
                    guy.y -= 1;
                }
                guy.run();
            }
            if (pointer.x + pointer.width / 2 > canvasPointerElement.width - 70 && pointer.x - pointer.width / 2 < canvasPointerElement.width - 30 && pointer.y + pointer.height / 2 > canvasPointerElement.height - 70 && pointer.y - pointer.height / 2 < canvasPointerElement.height - 30) {
                var refreshBox = getArrayColor(scaledown(canvasPointerElement.width - 70), scaledown(canvasPointerElement.height - 70), scaledown(40), scaledown(40), colorsCanvasPointer);
                var refresh = 0;
                for (var i = 0; i < refreshBox.length; i++) {
                    refresh += refreshBox[i] > 0;
                }
                if (refresh > 95 / 100 * 40 * 40 / 4 / 4) {
                    refreshScreen();
                }
            }
            if (pointerCollision) {
                guy.vy = -0.07;
                soundJump.play();
            }
            if (scale(guy.x) >= canvasGuyElement.width - scale(guy.width)) {
                transition();
            }
            points = 0;
            for (var i = 0; i < glitchGaps.length; i++) {
                if (glitchGaps[i]) {
                    points += 1;
                }
            }
            healthLost = Math.round((possiblePoints * (scale(guy.x) / (canvasGuyElement.width + scale(guy.glitch.x - guy.width))) - points)) / 3;
            drawHealthBar();
            pointsElement.innerHTML = Math.round(totalPoints + points);
            if (clickNum > 1 && totalHealth - healthLost > 0) {
                draw();
                requestAnimFrame(mainLoop);
            } else if (clickNum > 1 && totalHealth - healthLost <= 0) {
                endScreen();
            }
        }
        var refreshScreen = function() {
            clickNum = 0;
            guy.x = 0;
            if (guy.y < 0) {
                guy.y = 0;
            } else if (scale(guy.y + guy.height + 5) > canvasGuyElement.height) {
                guy.y = scaledown(canvasGuyElement.height) - guy.height - 5;
            } else {
                guy.y = Math.round(guy.y);
            }
            guy.vx = 0;
            guy.vy = 0;
            points = 0;
            healthLost = 0;
            document.getElementsByTagName("html")[0].style.backgroundColor = currentBackgroundColor;
            canvasBackground.fillStyle = currentBackgroundColor;
            canvasBackground.fillRect(0, 0, canvasPointerElement.width, canvasPointerElement.height);
            canvasPointer.clearRect(0, 0, canvasPointerElement.width, canvasPointerElement.height);
            canvasGlitch.clearRect(0, 0, canvasGlitchElement.width, canvasGlitchElement.height);
            glitchGaps = [];
            colorsCanvasPointer.fill(0);
            colorsCanvasGlitch.fill(0);
            canvasGuy.clearRect(0, 0, canvasGuyElement.width, canvasGuyElement.height);
            firstFrame();
        }
        var trackLoop = function(event) {
            if (clickNum == 1) {
                draw();
                requestAnimFrame(trackLoop);
            }
            if (pointer.x + pointer.width / 2 > canvasPointerElement.width - 64 && pointer.x - pointer.width / 2 < canvasPointerElement.width - 36 && pointer.y + pointer.height / 2 > canvasPointerElement.height - 64 && pointer.y - pointer.height / 2 < canvasPointerElement.height) {
                var refreshBox = getArrayColor(scaledown(canvasPointerElement.width - 64), scaledown(canvasPointerElement.height - 64), scaledown(28), scaledown(28), colorsCanvasPointer);
                var refresh = 0;
                for (var i = 0; i < refreshBox.length; i++) {
                    refresh += refreshBox[i] > 0;
                }
                if (refresh > 95 / 100 * 28 * 28 / 4 / 4) {
                    refreshScreen();
                }
            }
            if (level == 1) {
                canvasBackground.fillStyle = currentBackgroundColor;
                canvasBackground.fillRect(0, 0, canvasBackgroundElement.width, canvasBackgroundElement.height);
                canvasBackground.beginPath();
                canvasBackground.moveTo(0, scale(guy.y + guy.height));
                canvasBackground.lineTo(canvasBackgroundElement.width, scale(guy.y + guy.height));
                canvasBackground.stroke();
                canvasBackground.beginPath();
                canvasBackground.moveTo(0, scale(guy.y + guy.height) + 20);
                canvasBackground.lineTo(canvasBackgroundElement.width, scale(guy.y + guy.height) + 20);
                canvasBackground.strokeStyle = "rgba(0,0,0,0.4)";
                canvasBackground.stroke();
                instructionsElement.innerHTML = "Draw a path between the lines. Click when you're happy with your path";
            }
        }
        var transition = function() {
            var endLevelImage = canvasPointer.getImageData(0, 0, canvasPointerElement.width, canvasPointerElement.height);
            var endLevelX = 0;
            guy.vx = 0;
            clickNum = 0;
            var newBackgroundColor = "hsl(" + (Math.random() * 360) + ",50%,50%)";
            var transitionLoop = function() {
                endLevelX -= 10;
                guy.x -= scaledown(10);
                canvasPointer.clearRect(0, 0, canvasPointerElement.width, canvasPointerElement.height);
                canvasPointer.putImageData(endLevelImage, endLevelX, 0);
                canvasBackground.fillStyle = newBackgroundColor;
                canvasBackground.fillRect(canvasBackgroundElement.width + endLevelX + endLevelX + scale(5), 0, 0 - endLevelX + scale(guy.width), canvasBackgroundElement.height);
                canvasBackground.fillStyle = currentBackgroundColor;
                draw();
                if (endLevelX > -canvasPointerElement.width + scale(guy.width)) {
                    requestAnimFrame(transitionLoop);
                } else {
                    totalHealth -= healthLost;
                    totalPoints += points;
                    level++;
                    currentBackgroundColor = newBackgroundColor;
                    refreshScreen();
                }
            }
            diffLevel += 1;
            transitionLoop();
        }