const canvas = document.getElementById("pong");
const ctx = canvas.getContext("2d");

canvas.addEventListener('dblclick', function(event) { event.preventDefault(); });

let isPaused = true;
let powerUpTimer = null;

const balls = [{
    x: canvas.width / 2,
    y: canvas.height / 2,
    radius: 10,
    dx: 4,
    dy: 4,
    speed: 4
}];

const player = {
    x: 10,
    y: canvas.height / 2 - 40,
    width: 10,
    height: 80,
    dy: 4,
    score: 0
};

const computer = {
    x: canvas.width - 20,
    y: canvas.height / 2 - 40,
    width: 10,
    height: 80,
    dy: 4,
    score: 0
};

function drawBall(ball) {
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.closePath();
}

function drawPaddle(x, y, width, height) {
    ctx.fillRect(x, y, width, height);
}

function update() {
    // Ball movement
    balls.forEach(ball => {
        ball.x += ball.dx;
        ball.y += ball.dy;

        // Ball wall collision (top/bottom)
        if (ball.y - ball.radius <= 0 || ball.y + ball.radius >= canvas.height) {
            ball.dy = -ball.dy;
        }

        // Ball out of bounds
        if (ball.x - ball.radius <= 0) {
            computerScore();
            resetBall(ball);
        } else if (ball.x + ball.radius >= canvas.width) {
            playerScore();
            resetBall(ball);
        }

        // Ball paddle collision
        if (ball.dx > 0) {
            if (checkCollision(ball, computer)) {
                let relativeIntersectY = (computer.y + (computer.height / 2)) - ball.y;
                let normalizedRelativeIntersectionY = (relativeIntersectY / (computer.height / 2));
                let bounceAngle = normalizedRelativeIntersectionY * (Math.PI / 4);
                ball.dy = ball.speed * -Math.sin(bounceAngle);
                ball.dx = ball.speed * -Math.cos(bounceAngle);
        
                ball.speed *= 1.1;
            }
        } else if (ball.dx < 0) {
            if (checkCollision(ball, player)) {
                let relativeIntersectY = (player.y + (player.height / 2)) - ball.y;
                let normalizedRelativeIntersectionY = (relativeIntersectY / (player.height / 2));
                let bounceAngle = normalizedRelativeIntersectionY * (Math.PI / 4);
                ball.dy = ball.speed * -Math.sin(bounceAngle);
                ball.dx = ball.speed * Math.cos(bounceAngle);
        
                ball.speed *= 1.1;
            }
        }
    });

    // Computer AI movement
    let computerTargetY = balls[0].y - (computer.height / 2);  // Target the center of the paddle to the ball
    if (computer.y < computerTargetY) {
        computer.y += computer.dy;
    } else {
        computer.y -= computer.dy;
    }

    // Prevent computer paddle from moving out of bounds
    if (computer.y < 0) {
        computer.y = 0;
    } else if (computer.y + computer.height > canvas.height) {
        computer.y = canvas.height - computer.height;
    }
}

function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Adjust colors based on theme
    switch(document.body.className) {
        case "classic":
            ctx.fillStyle = "white";
            break;
        case "neon":
            ctx.fillStyle = "lime";
            break;
        default:
            ctx.fillStyle = "black";
    }

    balls.forEach(drawBall);
    drawPaddle(player.x, player.y, player.width, player.height);
    drawPaddle(computer.x, computer.y, computer.width, computer.height);

    // Adjust the score font size and display it
    ctx.font = "80px Arial";
    ctx.fillText(player.score, canvas.width / 4, 80);
    ctx.fillText(computer.score, 3 * canvas.width / 4, 80);
}

function gameLoop() {
    if (!isPaused) {
        update();
        render();
    }
    requestAnimationFrame(gameLoop);
}

function startGame() {
    if (isPaused) {
        isPaused = false;
    }
}

function pauseGame() {
    isPaused = true;
}

function restartGame() {
    player.score = 0;
    computer.score = 0;
    resetBall();
    startGame();
    checkCollision();
}

function resetBall() {
    balls.length = 0;
    balls.push({
        x: canvas.width / 2,
        y: canvas.height / 2,
        radius: 10,
        dx: 4,
        dy: 4,
        speed: 4
    });
}

function setDifficulty(difficulty) {
    switch (difficulty) {
        case 'easy':
            balls.forEach(ball => ball.speed = 4);
            computer.dy = 2.5;
            break;
        case 'medium':
            balls.forEach(ball => ball.speed = 6);
            computer.dy = 4;
            break;
        case 'hard':
            balls.forEach(ball => ball.speed = 8);
            computer.dy = 5.5;
            break;
    }
}


function checkCollision(ball, paddle) {
    if (ball.y + ball.radius > paddle.y && ball.y - ball.radius < paddle.y + paddle.height &&
        ball.x + ball.radius > paddle.x && ball.x - ball.radius < paddle.x + paddle.width) {
        
        let collidePoint = (ball.y - (paddle.y + paddle.height / 2)) / (paddle.height / 2); // Normalize between -1 and 1
        ball.dy = ball.speed * collidePoint;

        return true;
    }
    return false;
}


function activatePowerUp() {
    balls.forEach(b => b.speed += 2);
    if (powerUpTimer) clearTimeout(powerUpTimer);
    powerUpTimer = setTimeout(() => {
        balls.forEach(b => b.speed -= 2);
    }, 5000);
}

function startMultiBall() {
    balls.push({
        x: canvas.width / 2,
        y: canvas.height / 2,
        radius: 10,
        dx: -4,
        dy: 4,
        speed: 4
    });
}

function setTheme(theme) {
    document.body.className = theme;
}

function computerScore() {
    computer.score += 1;
    if (computer.score >= 5) {

        isPaused = true;
        alert("Computer Wins!");
        player.score = 0;
        computer.score = 0;
        resetBall();
    } else {
        resetBall();
    }
}

function playerScore() {
    player.score += 1;
    if (player.score >= 5) {

        isPaused = true;
        alert("You Win!");
        player.score = 0;
        computer.score = 0;
        resetBall();
    } else {
        resetBall();
    }
}

canvas.addEventListener("mousemove", (event) => {
    let rect = canvas.getBoundingClientRect();
    let newPlayerY = event.clientY - rect.top - player.height / 2;
    if (newPlayerY < 0) newPlayerY = 0;
    if (newPlayerY > canvas.height - player.height) newPlayerY = canvas.height - player.height;

    player.y = newPlayerY;
});


canvas.addEventListener("click", (event) => {
    event.preventDefault(); // Prevent any default behavior

    let randomChance = Math.random();
    if (randomChance > 0.7) activatePowerUp();
    else if (randomChance > 0.4) startMultiBall();
});

gameLoop();
