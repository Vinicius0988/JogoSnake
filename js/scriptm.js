const canvas = document.querySelector('canvas') //encontra o meu canvas do index
const ctx = canvas.getContext('2d') //define o contexto em 2D

const score = document.querySelector(".score-value")
const finalScore = document.querySelector(".final-score > span")
const menu = document.querySelector(".menu-screen")
const buttonPlay = document.querySelector(".btn-play")

const audio1 = new Audio('../assets/Get_food.wav')
const audio2 = new Audio('../assets/Level_up.wav')
const audio3 = new Audio('../assets/boom.mp3')
const audio4 = new Audio('../assets/die.mp3')

const size = 30
let tema = false

let snake = [  
     //define o corpo da cobra
    {x: 270, y: 270},
    {x: 300, y: 270},
    {x: 330, y: 270},
    {x: 360, y: 270} //varia o x de 30em30 pois o size é 30
]
const incrementScore = () => {
    score.innerText = +score.innerText +10 //converte o score para um numero (+) e depois faz a soma
}

function randomNumber(min, max) {
    return Math.round(Math.random() * (max - min) + min)

    //mth.randon faz de 0,1;0,9 > mth.round > 0;1 > *5 = 0;5 > min= (5+5) p/ n passar de 5 -> *((5-5)+5)
}

const randomPosition = () => {
    const number = randomNumber(0, canvas.width - size)//multiplos de 30 canvas.width=600 - size=30 == 570
    return Math.round(number/30) *30 //gera um numero inteiro e faz multiplo de 30 dele
}

const food = {
    x: randomPosition(),
    y: randomPosition(),
    color: 'yellow'
}

let direction = ''
let loopId = ''

const steveHeadImage = new Image ()
steveHeadImage.src = './assets/steveHead.jpg'
const diamondImage = new Image ()
diamondImage.src = './assets/diamond.jpg'

const drawFood = () => {

    const {x, y} = food //desestrutura tudo oq envolve food (food.color --> color)
    if (tema) {  // tema 2 - cobra marrom com cabeça de diamond
        ctx.drawImage(diamondImage, x, y, size, size);
    } else {    // tema 1 - cobra verde com cabeça de steve
        ctx.drawImage(steveHeadImage, x, y, size, size);
    }
}

const snakeHeadImage = new Image ()
snakeHeadImage.src = './assets/creeperHead.jpg'
const steveImage = new Image ()
steveImage.src = './assets/steveHead.jpg'

const drawSnake = () => {
    snake.forEach((position, index) => {

        if (!tema) {
            // Tema 1: cobra verde com cabeça Creeper
            if (index === snake.length - 1) {
                // Cabeça com imagem Creeper
                ctx.fillStyle = 'green'
                ctx.fillRect(position.x, position.y, size, size)
                ctx.drawImage(snakeHeadImage, position.x, position.y, size, size)
            } else {
                // Corpo verde (retângulo)
                ctx.fillStyle = 'green'
                ctx.fillRect(position.x, position.y, size, size)
            }
        } else {
            // Tema 2: cobra marrom com cabeça Steve
            if (index === snake.length - 1) {
                // Cabeça com imagem Steve
                ctx.fillStyle = 'wheat'
                ctx.fillRect(position.x, position.y, size, size)
                ctx.drawImage(steveImage, position.x, position.y, size, size)
            } else {
                // Corpo marrom (retângulo)
                ctx.fillStyle = 'wheat'
                ctx.fillRect(position.x, position.y, size, size)
            }
        }

    })
}

const moveSnake = () => {
    if (!direction) return //se não tiver direçaõ ele pula os movimentos (fica parada)

    const head = snake.at(-1) //pega o ultimo elemento de uma array (a cabeça)

    

    if (direction == 'right') {
        snake.push({x: head.x +size, y: head.y}) //adiciona um novo objeto no array

    }

    if (direction == 'left') {
        snake.push({x: head.x -size, y: head.y}) //adiciona um novo objeto no array

    }

    if (direction == 'down') {
        snake.push({x: head.x, y: head.y +size}) //adiciona um novo objeto no array

    }

    if (direction == 'up') {
        snake.push({x: head.x, y: head.y -size}) //adiciona um novo objeto no array

    }

    snake.shift() //remove o primeiro elemnto do array

}

const DrawGrid = () => { //Borda
    ctx.lineWidth = 1 //Define a largura da linha
    ctx.strokeStyle = 'grey' //Cor da linha

    for (let i=30; i<canvas.width; i+=30) {
        ctx.beginPath() //comando para sempre começar na mesma posição
        ctx.lineTo(i,0)
        ctx.lineTo(i, 600) // Cordenadas de inicio da linha (X;Y)
        ctx.stroke() //desenha o caminho

        ctx.beginPath()
        ctx.lineTo(0,i)
        ctx.lineTo(600, i) // Cordenadas de inicio da linha (X;Y)
        ctx.stroke() //desenha o caminho
    }
}

const checkEat = () => {
    const head = snake[snake.length -1]

    if (head.x == food.x && head.y == food.y ) { //verifica se a head Sanke chegou na posição da comida
        snake.push(head)
        audio1.play()
        incrementScore ()
       


        let x = randomPosition()
        let y = randomPosition()

        while (snake.find((position) => position.x == x && position.y == y)) { //verif a corn != BodySnake
            x = randomPosition()
            y = randomPosition()
        }
        food.x = x
        food.y = y
    }
}

const checkCollision = () => {
    const head = snake[snake.length -1] //usa o limite do canvas como referencia
    const neckIndex = snake.length -2

    const wallCollision = (
    head.x< 0 || head.x>= canvas.width || 
    head.y <0 || head.y>= canvas.height
    )
    
    const bodyColision = snake.find((position, index) => {
        return index < neckIndex && position.x == head.x && position.y == head.y
    })

    if (wallCollision || bodyColision) {
        gameOver()
    }

}

let hasGameEnded = false;

const gameOver = () => {
    if (hasGameEnded) return;  // Se já acabou, não faz nada
    hasGameEnded = true;

    direction = undefined 
    clearTimeout(loopId)
    audio3.loop = false;      // garante que não vai repetir
    audio3.currentTime = 0;   // volta pro começo
    if (!tema){            //muda o audio de acordo com o tema escolhido
        audio3.play(); 
    }
    else {
        audio4.play();
    }

    menu.style.display = "flex"
    finalScore.innerText = score.innerText
                        
}

let speedGame = () => {
    let baseSpeed = 150; // base mais rápido (antes era 300)
    let scoreValue = +score.innerText;
    let decrement = Math.floor(scoreValue / 30) * 20; // diminui 20ms a cada 30 pontos

    let newSpeed = baseSpeed - decrement;
    return newSpeed > 50 ? newSpeed : 50; // nunca menos que 50ms
}


const gameLoop = () => {
    clearInterval(loopId)
    ctx.clearRect(0, 0, 600, 600) //limpa o desenho corden inic(x=0,y=0) tamTotal(600,600)
    drawFood ()
    DrawGrid ()
    moveSnake()
    drawSnake()
    checkEat()
    checkCollision()

    loopId = setTimeout (() => {
        gameLoop()
    },speedGame()) //loop de tempo 300ms
}
gameLoop()

document.addEventListener('keydown', ({ key}) => { //comando para ler teclas pressionadas pelo usuario
    if (key == 'ArrowRight' && direction != 'left') {
        direction = 'right'
    }
    if (key == 'ArrowLeft' && direction != 'right') {
        direction = 'left'
    }
    if (key == 'ArrowDown' && direction != 'up') {
        direction = 'down'
    }
    if (key == 'ArrowUp' && direction != 'down') {
        direction = 'up'
    }
    if (key == 'l') {
        tema = !tema
    }

})

buttonPlay.addEventListener('click', () => {
    score.innerText = '00'
    menu.style.display = 'none'
    snake = [
        {x: 270, y: 270},
        {x: 300, y: 270},
        {x: 330, y: 270},
        {x: 360, y: 270}
        ]
    direction = '' //zera a direção
    hasGameEnded = false //permite jogo novo
    clearTimeout(loopId) //cancela qualquer loop
    gameLoop()
})







