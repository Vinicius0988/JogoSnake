const canvas = document.querySelector('canvas') // seleciona o elemento <canvas> do HTML
const ctx = canvas.getContext('2d') // pega o contexto 2D para desenhar no canvas

const score = document.querySelector(".score-value") // elemento onde mostra a pontuação
const finalScore = document.querySelector(".final-score > span") // elemento do placar final no menu
const menu = document.querySelector(".menu-screen") // menu de início/fim do jogo
const buttonPlay = document.querySelector(".btn-play") // botão para iniciar o jogo

// Carrega os áudios para diferentes eventos do jogo
const audio1 = new Audio('../assets/Get_food.wav') // som ao pegar comida
const audio2 = new Audio('../assets/Level_up.wav') // som para subir de nível (não usado no código atual)
const audio3 = new Audio('../assets/boom.mp3') // som de colisão (tema 1)
const audio4 = new Audio('../assets/die.mp3') // som de colisão (tema 2)

const size = 30 // tamanho dos blocos do jogo (cobra, comida, grid)
let tema = false // variável para controlar o tema visual do jogo

// Define a posição inicial da cobra como um array de blocos
let snake = [  
    {x: 270, y: 270},
    {x: 300, y: 270},
    {x: 330, y: 270},
    {x: 360, y: 270} // cada bloco separado por 30 px, pois size = 30
]

// Função para incrementar a pontuação em 10
const incrementScore = () => {
    score.innerText = +score.innerText + 10 // converte texto para número e soma 10
}

// Função para gerar número aleatório entre min e max (inteiro arredondado)
function randomNumber(min, max) {
    return Math.round(Math.random() * (max - min) + min)
}

// Função para gerar uma posição aleatória múltipla de 30 dentro do canvas
const randomPosition = () => {
    const number = randomNumber(0, canvas.width - size) // gera número entre 0 e 570 (600-30)
    return Math.round(number / 30) * 30 // arredonda para múltiplo de 30
}

// Objeto comida com posição aleatória e cor (não usada diretamente a cor)
const food = {
    x: randomPosition(),
    y: randomPosition(),
    color: 'yellow'
}

let direction = '' // direção inicial vazia (sem movimento)
let loopId = '' // ID do loop do jogo para controlar intervalos

// Imagens para os temas
const steveHeadImage = new Image()
steveHeadImage.src = './assets/steveHead.jpg'
const diamondImage = new Image()
diamondImage.src = './assets/diamondBlock.png'

// Desenha a comida no canvas, muda a imagem de acordo com o tema
const drawFood = () => {
    const {x, y} = food
    if (tema) {
        ctx.drawImage(diamondImage, x, y, size, size) // tema 2 - comida diamante
    } else {
        ctx.drawImage(steveHeadImage, x, y, size, size) // tema 1 - comida cabeça do Steve
    }
}

const snakeHeadImage = new Image()
snakeHeadImage.src = './assets/creeperHead.jpg'
const steveImage = new Image()
steveImage.src = './assets/steveHead.jpg'

// Desenha a cobra no canvas, com cores e cabeças diferentes por tema
const drawSnake = () => {
    snake.forEach((position, index) => {
        if (!tema) {
            // Tema 1: corpo verde com cabeça Creeper
            if (index === snake.length - 1) {
                ctx.fillStyle = 'green'
                ctx.fillRect(position.x, position.y, size, size) // corpo verde
                ctx.drawImage(snakeHeadImage, position.x, position.y, size, size) // cabeça Creeper
            } else {
                ctx.fillStyle = 'green'
                ctx.fillRect(position.x, position.y, size, size) // corpo verde
            }
        } else {
            // Tema 2: corpo marrom com cabeça Steve
            if (index === snake.length - 1) {
                ctx.fillStyle = 'wheat'
                ctx.fillRect(position.x, position.y, size, size) // corpo marrom claro
                ctx.drawImage(steveImage, position.x, position.y, size, size) // cabeça Steve
            } else {
                ctx.fillStyle = 'wheat'
                ctx.fillRect(position.x, position.y, size, size) // corpo marrom claro
            }
        }
    })
}

// Atualiza a posição da cobra de acordo com a direção
const moveSnake = () => {
    if (!direction) return // se não houver direção, não mexe

    const head = snake.at(-1) // pega a cabeça (último bloco do array)

    if (direction == 'right') {
        snake.push({x: head.x + size, y: head.y}) // adiciona novo bloco à direita
    }
    if (direction == 'left') {
        snake.push({x: head.x - size, y: head.y}) // adiciona novo bloco à esquerda
    }
    if (direction == 'down') {
        snake.push({x: head.x, y: head.y + size}) // adiciona novo bloco abaixo
    }
    if (direction == 'up') {
        snake.push({x: head.x, y: head.y - size}) // adiciona novo bloco acima
    }

    snake.shift() // remove o último bloco para simular movimento
}

// Desenha a grade no fundo do canvas
const DrawGrid = () => {
    ctx.lineWidth = 1 // largura da linha da grade
    ctx.strokeStyle = '#333333' // cor cinza escuro da linha

    for (let i = 30; i < canvas.width; i += 30) {
        ctx.beginPath()
        ctx.lineTo(i, 0)
        ctx.lineTo(i, 600) // linhas verticais
        ctx.stroke()

        ctx.beginPath()
        ctx.lineTo(0, i)
        ctx.lineTo(600, i) // linhas horizontais
        ctx.stroke()
    }
}

// Verifica se a cobra comeu a comida
const checkEat = () => {
    const head = snake[snake.length - 1]

    if (head.x == food.x && head.y == food.y) {
        snake.push(head) // cresce a cobra
        audio1.play() // toca som de comida
        incrementScore() // incrementa pontuação

        // Gera nova posição para comida
        let x = randomPosition()
        let y = randomPosition()

        // Garante que a comida não apareça em cima da cobra
        while (snake.find((position) => position.x == x && position.y == y)) {
            x = randomPosition()
            y = randomPosition()
        }
        food.x = x
        food.y = y
    }
}

// Verifica colisão com parede ou com o próprio corpo da cobra
const checkCollision = () => {
    const head = snake[snake.length - 1]
    const neckIndex = snake.length - 2

    // Checa colisão com as paredes
    const wallCollision = (
        head.x < 0 || head.x >= canvas.width ||
        head.y < 0 || head.y >= canvas.height
    )

    // Checa colisão com o corpo (exclui a cabeça)
    const bodyCollision = snake.find((position, index) => {
        return index < neckIndex && position.x == head.x && position.y == head.y
    })

    if (wallCollision || bodyCollision) {
        gameOver()
    }
}

let hasGameEnded = false; // flag para evitar que gameOver seja chamado várias vezes

// Função para finalizar o jogo
const gameOver = () => {
    if (hasGameEnded) return; // se já acabou, não faz nada
    hasGameEnded = true;

    direction = undefined // para movimento
    clearTimeout(loopId) // para o loop do jogo
    audio3.loop = false // não repete o som de colisão
    audio3.currentTime = 0 // reinicia som

    if (!tema) {
        audio3.play() // toca som de explosão tema 1
    } else {
        audio4.play() // toca som tema 2
    }

    menu.style.display = "flex" // mostra o menu de fim de jogo
    finalScore.innerText = score.innerText // atualiza placar final
}

// Função para ajustar velocidade do jogo com base na pontuação
let speedGame = () => {
    let baseSpeed = 150; // velocidade base (mais rápido que antes)
    let scoreValue = +score.innerText;
    let decrement = Math.floor(scoreValue / 30) * 20; // diminui 20ms a cada 30 pontos

    let newSpeed = baseSpeed - decrement;
    return newSpeed > 50 ? newSpeed : 50; // velocidade mínima 50ms
}

// Loop principal do jogo
const gameLoop = () => {
    clearInterval(loopId) // limpa loop anterior
    ctx.clearRect(0, 0, 600, 600) // limpa o canvas para redesenhar

    drawFood() // desenha comida
    // DrawGrid() // grade desativada (se quiser ativar, remova comentário)
    moveSnake() // move cobra
    drawSnake() // desenha cobra
    checkEat() // verifica se comeu
    checkCollision() // verifica colisão

    // chama gameLoop de novo após o tempo calculado
    loopId = setTimeout(() => {
        gameLoop()
    }, speedGame())
}
gameLoop() // inicia o jogo

// Evento para capturar teclas pressionadas
document.addEventListener('keydown', ({ key }) => {
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
    if (key == 'l') { // tecla 'l' troca o tema
        tema = !tema
    }
})

// Botão para iniciar o jogo novamente
buttonPlay.addEventListener('click', () => {
    score.innerText = '00' // reseta a pontuação
    menu.style.display = 'none' // esconde menu

    // reseta cobra para posição inicial
    snake = [
        {x: 270, y: 270},
        {x: 300, y: 270},
        {x: 330, y: 270},
        {x: 360, y: 270}
    ]
    direction = '' // sem direção inicial
    hasGameEnded = false // permite jogar de novo
    clearTimeout(loopId) // cancela qualquer loop ativo
    gameLoop() // inicia o loop do jogo
})
