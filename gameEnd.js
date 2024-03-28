window.addEventListener('load', function () {
    const canvas = document.getElementById('canvas1');
    const ctx = canvas.getContext('2d');
    canvas.width = 1200;
    canvas.height = 720;
    let enemies = [];
    let score = 0;
    let gameOver = false;
    const fullScreenButton = document.getElementById('fullScreenButton');

    class InputHandler {
        constructor() {
            this.keys = [];
            this.touchY = '';
            this.touchTreshold = 30;
            const jumpButton = document.getElementById('Jump');
            jumpButton.addEventListener('click', () => {
                player.jump(); // Call the jump method of the player when the button is clicked
            });
            window.addEventListener('keydown', e => {
                if ((e.key === 'ArrowDown' ||
                    e.key === 'ArrowUp' ||
                    e.key === 'ArrowLeft' ||
                    e.key === 'ArrowRight')
                    && this.keys.indexOf(e.key) === -1) {
                    this.keys.push(e.key);
                } else if (e.key === 'Enter' && gameOver) restartGame();
            });
            window.addEventListener('keyup', e => {
                if (e.key === 'ArrowDown' ||
                    e.key === 'ArrowUp' ||
                    e.key === 'ArrowLeft' ||
                    e.key === 'ArrowRight') {
                    this.keys.splice(this.keys.indexOf(e.key), 1);
                }
            });
            window.addEventListener('touchstart', e => {
                if (gameOver) restartGame();
                this.touchY = e.changedTouches[0].pageY
            })
            window.addEventListener('touchmove', e => {
                const swipeDistance = e.changedTouches[0].pageY - this.touchY;
                if (swipeDistance < - this.touchTreshold && this.keys.indexOf('swipe up') === -1) this.keys.push('swipe up');
                else if (swipeDistance > this.touchTreshold && this.keys.indexOf('swipe down') === -1) this.keys.push('swipe down');
                {
                    this.keys.push('swipe down')
                    if (gameOver) restartGame();
                }
            });
            window.addEventListener('touchend', e => {
                this.keys.splice(this.keys.indexOf('swipe up'), 1);
                this.keys.splice(this.keys.indexOf('swipe down'), 1);
            });
        }
    }


    class Player {
        constructor(gameWidth, gameHeight) {
            this.gameWidth = gameWidth;
            this.gameHeight = gameHeight;
            this.width = 130;
            this.height = 130;
            this.x = 0;
            this.y = this.gameHeight - this.height;
            this.image = document.getElementById('playerImage');
            this.frameX = 0;
            this.maxFrame = 0;
            this.frameY = 0;
            this.fps = 5;
            this.frameTimer = 0;
            this.frameInterval = 1000 / this.fps;
            this.speed = 0;
            this.vy = 0;
            this.weight = 1;
            this.jumpVelocity = 800; // Adjust the jump velocity as needed
            this.isJumping = false;
        }

        jump() {
            if (this.onGround() && !this.isJumping) {
                this.vy -= 25;
            }
        }
        restart() {
            this.x = 100;
            this.y = this.gameHeight - this.height
            this.maxFrame = 8;
            this.frameY = 0;
        }
        draw(context) {
            // context.strokeStyle = 'white';
            // context.strokeRect(this.x, this.y, this.width, this.height);
            context.drawImage(this.image, this.frameX * this.width, this.frameY * this.height,
                this.width, this.height, this.x, this.y, this.width, this.height);
        }
        update(input, deltaTime, enemies) {
            //collision 
            enemies.forEach(enemy => {
                const dx = (enemy.x + enemy.width / 2) - (this.x + this.width / 2)
                const dy = (enemy.y + enemy.height / 2) - (this.y + this.height / 2)
                const distance = Math.sqrt(dx * dx + dy * dy);
                if (distance < enemy.width / 2 + this.width / 2) {
                    gameOver = true;
                }

            })
            //animation
            if (this.frameTimer > this.frameInterval) {
                if (this.frameX > 2 ) {
                    this.frameX = 0;
                    // console.log(this.frameX)
                } else{
                     this.frameX++;
                    //  console.log(this.frameX)
                }

                this.frameTimer = 0;
            } else {
                this.frameTimer += deltaTime
            }
            //Contrlo

            if (input.keys.indexOf('ArrowRight') > -1) {
                this.speed = 5;
            } else if (input.keys.indexOf('ArrowLeft') > -1) {
                this.speed = -5;
            } else if ((input.keys.indexOf('ArrowUp') > -1 || input.keys.indexOf('swipe up') > -1) && this.onGround()) {
                // this.
                this.vy -= 25;
            } else {
                this.speed = 0;
            }
            this.x += this.speed;
            if (this.x < 0) this.x = 0;
            else if (this.x > this.gameWidth - this.width) this.x = this.gameWidth - this.width

            this.y += this.vy;
            if (!this.onGround()) {

                this.vy += this.weight;
                this.maxFrame = 5;
                this.frameY = 0;
            } else {
                this.vy = 0;
                this.maxFrame = 8;
                this.frameY = 0;
            }
            if (this.y > this.gameHeight - this.height) this.y = this.gameHeight - this.height
        }
        onGround() {
            return this.y >= this.gameHeight - this.height
        }

    }

    class Background {
        constructor(gameWidth, gameHeight) {
            this.gameWidth = gameWidth;
            this.gameHeight = gameHeight;
            this.image = document.getElementById('backgroundImage');
            this.x = 0;
            this.y = 0;
            this.width = 2400;
            this.height = 720;
            this.speed = 7;
        }
        restart() {
            this.x = 0;
        }
        draw(context) {
            context.drawImage(this.image, this.x, this.y, this.width, this.height);
            context.drawImage(this.image, this.x + this.width - this.speed, this.y, this.width, this.height);
        }
        update() {
            this.x -= this.speed;
            if (this.x < 0 - this.width) this.x = 0;
        }
    }

    class Enemy {
        constructor(gameWidth, gameHeight) {
            this.gameWidth = gameWidth;
            this.gameHeight = gameHeight;
            this.width = 130;
            this.height = 119;
            this.image = document.getElementById('enemyImage');
            this.x = this.gameWidth - 300;
            this.y = this.gameHeight - this.height;
            this.y = Math.random() * (this.gameHeight - this.height);
            this.frameX = 0;
            this.maxFrame = 0;
            this.fps = 0;
            this.frameTimer = 0;
            this.frameInterval = 1000 / this.fps;
            this.speed = 8;
            this.markedForDeletion = false;
        }
        draw(context) {
            // context.strokeStyle = 'white';
            // context.strokeRect(this.x,this.y,this.width,this.height);
            context.drawImage(this.image, this.frameX * this.width, 0, this.width, this.height,
                this.x, this.y, this.width, this.height);
        }
        update(deltaTime) {
            if (this.frameTimer > this.frameInterval) {
                if (this.frameX >= this.maxFrame) this.frameX = 0;
                else this.frameX++;
                this.frameTimer = 0;
            } else {
                this.frameTimer += deltaTime;
            }
            this.x -= this.speed;
            if (this.x < 0 - this.width) {
                this.markedForDeletion = true;
                score++;
            }
        }


    }

    function handleEnemies(deltaTime) {
        if (enemyTimer > enemyInterval + randomEnemyInterval) {
            enemies.push(new Enemy(canvas.width, canvas.height));
            randomEnemyInterval = Math.random() * 1000 + 500;
            enemyTimer = 0;
        } else {
            enemyTimer += deltaTime;
        }
        enemies.forEach(enemy => {
            enemy.draw(ctx);
            enemy.update(deltaTime);
        })
        enemies = enemies.filter(enemy => !enemy.markedForDeletion);
    }
    
    class Boss {
        constructor(gameWidth, gameHeight) {
            this.gameWidth = gameWidth;
            this.gameHeight = gameHeight;
            this.width = 500;
            this.height = 700;
            this.image = document.getElementById('bossImage');
            this.x = this.gameWidth - this.width;
            this.y = this.gameHeight - this.height;
        }

        draw(context) {
            context.drawImage(this.image, this.x, this.y, this.width, this.height);
        }
    }

    function displayStatusText(context) {
        context.textAlingn = 'left';
        context.font = '40px Helvetica';
        context.fillStyle = 'black';
        context.fillText('Score: ' + score, 20, 50)
        context.fillStyle = 'white';
        context.fillText('Score: ' + score, 22, 52)
        if (gameOver) {
            context.textAlign = 'center';
            context.fillStyle = 'black';
            context.fillText('GAME OVER Press Enter to Restart!', canvas.width / 2, 200); // Center the text horizontally and vertically
            context.fillStyle = 'white';
            context.fillText('GAME OVER Press Enter to Restart!', canvas.width / 2 + 2, 202);
        }
    }


    function displayLevel(context) {
        context.textAlign = 'center'; // Set text alignment to center
        context.font = '30px Helvetica';
        context.fillStyle = 'black';
        context.fillText('ขอบคุณที่ร่วมสนุกกับเรา กด Enter เพื่อเล่นอีกครั้ง', canvas.width / 2, canvas.height / 2); // Center the text horizontally and vertically
        context.fillStyle = 'white';
        context.fillText('ขอบคุณที่ร่วมสนุกกับเรา กด Enter เพื่อเล่นอีกครั้ง', canvas.width / 2 + 2, canvas.height / 2 + 2);
    }

    function restartGame() {
        player.restart()
        background.restart()
        enemies = []
        score = 0;
        gameOver = false;
        animate(0)
    }

    function togleFullScreen() {
        if (!document.fullscreenElement) {
            canvas.requestFullscreen().catch(err => {
                alert("Error can't enable")
            });
        } else {
            document.exitFullscreen()
        }
    }
    fullScreenButton.addEventListener('click', togleFullScreen);
    
    function promptToStart() {
        ctx.fillStyle = 'black';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.font = '30px Arial';
        ctx.fillStyle = 'white';
        ctx.textAlign = 'center';
        ctx.fillText('Press Enter to Start', canvas.width / 2, canvas.height / 2);
    }

    function displayStartText() {
        // Draw semi-transparent background rectangle
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)'; // Adjust transparency by changing the last parameter (0 is fully transparent, 1 is fully opaque)
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Draw text
        ctx.font = '30px Arial';
        ctx.fillStyle = 'white';
        ctx.textAlign = 'center';
        ctx.fillText('Press Enter To Play the Game', canvas.width / 2, canvas.height / 2);
    }
    
    const input = new InputHandler();
    const player = new Player(canvas.width, canvas.height);
    const background = new Background(canvas.width, canvas.height);
    const boss = new Boss(canvas.width, canvas.height);

    let lastTime = 0;
    let enemyTimer = 0;
    let enemyInterval = 300;
    let randomEnemyInterval = Math.random() * 1000 + 500;

    document.addEventListener('keydown', function(event) {
        if (event.key === 'Enter') {
            redirectToIndex();
        }
    });

    document.addEventListener('touchstart', function(event) {
        redirectToIndex();
    });

    function redirectToIndex() {
        window.location.href = 'level1.html';
    }

    function animate(timeStamp) {
        const deltaTime = timeStamp - lastTime;
        lastTime = timeStamp;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        background.draw(ctx);
        background.update();
        player.draw(ctx);
        player.update(input, deltaTime, enemies);
        boss.draw(ctx)
        // handleEnemies(deltaTime);
        displayLevel(ctx);
        // displayStatusText(ctx);
            if (!gameOver) requestAnimationFrame(animate);


    }
    animate(0);
});