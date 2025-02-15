import Player from "../configs/player.js"; //Importa Player
import NPC from "../configs/NPC.js";
import pedacosU from "../configs/pedacosU.js";
import celular from "../configs/celular/celular.js";



export default class cenaLavanderia extends Phaser.Scene { //Cria cena e define como Cena pelo Phaser
    constructor() {
        super('cenaLavanderia'); //Da nome a cena
        this.dialogoAtivo = false;
    }

    init(data) {
        this.nomeJogador = data.nomeJogador; //recebe o nome do jogador
    }

    create() {

        const mapaLavanderia = this.make.tilemap({ key: 'mapaLavanderia' }); //Cria e da nome ao mapa do jogo

        //Cria tilesets usados no Tiled dentro do jogo
        const tilesetLavanderia = mapaLavanderia.addTilesetImage('lavanderia', 'lavanderia');
        const tilesetRooms = mapaLavanderia.addTilesetImage('rooms', 'rooms');

        //Cria camadas do Tiled no jogo
        const chao = mapaLavanderia.createLayer('chao', [tilesetRooms, tilesetLavanderia], 0, 0); //Define nome, tilesets usados, e posicao para cada uma das camadas
        const paredes = mapaLavanderia.createLayer('paredes', [tilesetRooms, tilesetLavanderia] , 0, 0);
        const tapetes = mapaLavanderia.createLayer('tapetes', [tilesetRooms, tilesetLavanderia], 0, 0);
        const decoracao = mapaLavanderia.createLayer('decoracao', [tilesetRooms, tilesetLavanderia], 0, 0);
        const decoracao2 = mapaLavanderia.createLayer('decoracao2', [tilesetRooms, tilesetLavanderia], 0, 0);
        const maquinaAlta = mapaLavanderia.createLayer('maquina_alta', [tilesetRooms, tilesetLavanderia], 0, 0);

        this.cameras.main.fadeIn(1000); //Animacao de fade ao trocar de cena

        this.npcs = []; //Cria array de NPCs
        //criação de NPC utilizando a função criada
        const npcOmo = new NPC(this, 200, 128, 'NPC9', null, {
            dialog: [
                { text: `Bem-vindo à Lavanderia Omo,\naqui cada ciclo de lavagem\né uma experiência de\nrenovação para suas roupas.`, imageKey: "NPC9dialogo" },
                { text: `Omo é uma marca líder em\nprodutos de limpeza,\nfamosa por seu slogan\n'A sujeira é boa'`, imageKey: "NPC9dialogo" },
                { text: `Introduzida no mercado\nem 1957, a marca se\ndestaca por sua\neficácia na remoção de`, imageKey: "NPC9dialogo" },
                { text: `…manchas e na lavagem\neficiente das roupas.`, imageKey: "NPC9dialogo" },
            ],
            interactTexture: 'NPC9close' // Adicione a textura de interação aqui
        });

        this.npcs.push(npcOmo); //Coloca o NPC no array
        this.add.existing(npcOmo);

        this.player = new Player(this, 150, 200); //Cria o player
        this.player.sprite.anims.play('idleback', true);//Define animacao inicial do player
        this.cameras.main.startFollow(this.player.sprite);//Camera ira seguir o player
        this.cameras.main.setZoom(2.5);//Zoom da camera
        this.cameras.main.setBounds(0, 0, mapaLavanderia.widthInPixels, mapaLavanderia.heightInPixels);//Define limites da camera

        this.cursors = this.input.keyboard.createCursorKeys();//Adiciona setas para controle no jogo
        this.teclaE = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);//Adiciona tecla E para controle no jogo
        this.teclaC = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.C); // Adiciona a tecla 'C' como uma variável

        const colisao = mapaLavanderia.getObjectLayer('colisao'); //Puxa camada de objetos "colisao" do mapa
        const colliders = this.physics.add.staticGroup();//Cria grupo estatico para colisoes

        colisao.objects.forEach(obj => { //Cria a camada
            const collider = colliders.create(obj.x + obj.width / 2, obj.y + obj.height / 2, null);
            collider.body.setSize(obj.width, obj.height);
            collider.setOrigin(0.5, 0.5);
            collider.setVisible(false);
            //Essas configuracoes existem pois a origem de objetos no Phaser e no Tiled sao diferentes, o Tiled usa como origem do objeto o canto superior esquerdo dele, enquanto o Phaser usa o centro do objeto
        });

        this.physics.add.collider(this.player.sprite, colliders)//Adiciona colisao entre o player e a camada de colisoes

        const portaCidade = mapaLavanderia.getObjectLayer('portaCidade'); //Puxa camada de objetos "portaCidade" do mapa
        const portais = this.physics.add.staticGroup();//Cria grupo estatico para a porta

        portaCidade.objects.forEach(obj =>{//Cria a camada
            const tp = portais.create(obj.x + obj.width / 2, obj.y + obj.height / 2, null);
            tp.body.setSize(obj.width, obj.height);
            tp.setOrigin(0.5, 0.5);
            tp.setVisible(false);
            //Essas configuracoes existem pois a origem de objetos no Phaser e no Tiled sao diferentes, o Tiled usa como origem do objeto o canto superior esquerdo dele, enquanto o Phaser usa o centro do objeto
        })

        this.physics.add.overlap(this.player.sprite, portais, function() { //Volta para a cenaCidade caso o player sobreponha a camada portaCidade
            this.scene.start('cenaCidade', { x: 1000, y: 290, escritorio: true, nomeJogador: this.nomeJogador});
            }, null, this);

            pedacosU.init(this);
        //Cena Celular é inciada e já pausada para que ela seja despausada por meio de uma tecla
        this.scene.launch('celular');
        this.scene.pause('celular');
    }
    update(time, delta) {
        this.npcs.forEach(npc => {
            const distancia = Phaser.Math.Distance.Between(this.player.sprite.x, this.player.sprite.y, npc.x, npc.y);
            npc.texturaInteracao(); //Identifica o NPC no qual o player está interagindo 
            if (distancia < 50 && Phaser.Input.Keyboard.JustDown(this.teclaE) && !this.isMoving && !this.quizAtivo) {
                npc.startDialogue();
                if (!this.dialogoAtivo && !this.quizOmoTerminado) {
                    this.comecarQuiz()
                }
            }
        });

        //Quando o jogador coletar todos os pedaços, os npcs são destruídos
        this.pedacosColetados = pedacosU.getValor()
        if (this.pedacosColetados === 7) {
        this.npcs.forEach(npc => npc.destroy());
        this.npcs.length = 0;
        }

        //Lógica para abrir celular pela cena que está pausada
        if (Phaser.Input.Keyboard.JustDown(this.teclaC) && !this.dialogoAtivo && !this.isMoving) {
            if (!this.celularAtivo) {
            if (!this.scene.get('celular')) {
                this.scene.add('celular', celular, true)
            } else {
                this.scene.resume('celular')
            }
            this.celularAtivo = true
            } else {
            this.scene.remove('celular')
            this.celularAtivo = false
            }

        }
        if (!this.dialogoAtivo && !this.quizAtivo) {
            this.player.update(this.cursors);
        }
    }

    // Inicializa e configura elementos visuais e lógicos do quiz, como perguntas e opções de resposta.
    // Gerencia as interações do jogador com as opções de resposta e o feedback visual para respostas corretas ou incorretas.
    comecarQuiz(){
        if (!this.dialogoAtivo) {
            this.quizAtivo = true;
            const visibleWidth = this.cameras.main.width / this.cameras.main.zoom;
            const visibleHeight = this.cameras.main.height / this.cameras.main.zoom;
            const centerX = this.cameras.main.scrollX + visibleWidth / 2;
            const centerY = this.cameras.main.scrollY + visibleHeight / 2;

        let celularQuiz = this.add.sprite(centerX + 240, centerY + 180, 'celularQuiz').setScale(0.38).setInteractive();
        let caixaPergunta = this.add.image(centerX + 240, centerY +135, 'caixaPergunta').setScale(0.4).setInteractive();
        let resposta1 = this.add.image(centerX + 184, centerY +170, 'caixaResposta').setScale(0.4).setInteractive();
        let resposta2 = this.add.image(centerX + 294, centerY +170, 'caixaResposta').setScale(0.4).setInteractive();
        let resposta3 = this.add.image(centerX + 184, centerY + 215, 'caixaResposta').setScale(0.4).setInteractive();
        let resposta4 = this.add.image(centerX + 294, centerY + 215, 'caixaResposta').setScale(0.4).setInteractive();
        let caixaVerde = this.add.image(centerX + 184, centerY + 215, 'caixaVerde').setScale(0.4).setInteractive().setVisible(false);
        let caixaVermelha = this.add.image(centerX + 184, centerY + 170, 'caixaVermelha').setScale(0.4).setInteractive().setVisible(false);
        let restartButton = this.add.image(centerX + 240, centerY + 215, 'botaoRestart').setScale(0.2).setInteractive().setVisible(false);
        let pergunta1 = this.add.text(centerX + 150, centerY + 122 ,'Qual é o slogan famoso\n da marca Omo?',  { fontSize: '12px', fill: '#4169E1', fontFamily: 'SaboFilled', resolution: 10, }).setVisible(true).setDepth(2)
        let resposta1txt1 = this.add.text(centerX + 184, centerY + 170 ,'Pureza que lava\nmais branco',  { fontSize: '10px', fill: '#FFF', fontFamily: 'SaboFilled', resolution: 10, }).setVisible(true).setDepth(2).setOrigin(0.5, 0.5)
        let resposta2txt1 = this.add.text(centerX + 294, centerY +170 ,'Sujeira é boa',  { fontSize: '11px', fill: '#FFF', fontFamily: 'SaboFilled', resolution: 10, }).setVisible(true).setDepth(2).setOrigin(0.5, 0.5)
        let resposta3txt1 = this.add.text(centerX + 184, centerY + 215 ,'Limpeza\nimpecável',  { fontSize: '12px', fill: '#FFF', fontFamily: 'SaboFilled', resolution: 10, }).setVisible(true).setDepth(2).setOrigin(0.5, 0.5)
        let resposta4txt1 = this.add.text(centerX + 294, centerY + 215 ,'Para uma vida\nmais limpa',  { fontSize: '11px', fill: '#FFF', fontFamily: 'SaboFilled', resolution: 10, }).setVisible(true).setDepth(2).setOrigin(0.5, 0.5)

        resposta3.on('pointerdown', () => {
            if (resposta3txt1.text === ''){
            }
            else{
                caixaVermelha.setVisible(true)
                caixaVermelha.x = centerX + 184;
                caixaVermelha.y = centerY + 215;
                this.time.delayedCall(1000, () => {
                restartButton.setVisible(true);
                caixaPergunta.setVisible(false);
                resposta1.setVisible(false);
                resposta2.setVisible(false);
                resposta3.setVisible(false);
                resposta4.setVisible(false);
                caixaVermelha.setVisible(false);
                pergunta1.setVisible(false);
                resposta1txt1.setVisible(false);
                resposta2txt1.setVisible(false);
                resposta3txt1.setVisible(false);
                resposta4txt1.setVisible(false);
            })
            }
            })
        resposta1.on('pointerdown', () => {
                if(resposta1txt1.text === '1940'){
                    caixaVerde.x = centerX + 184;
                    caixaVerde.y = centerY + 170;
                    caixaVerde.setVisible(true)
                    this.time.delayedCall(1000, () => {
                        restartButton.destroy();
                        caixaPergunta.destroy();
                        resposta1.destroy();
                        resposta2.destroy();
                        resposta3.destroy();
                        resposta4.destroy();
                        caixaVermelha.destroy();
                        pergunta1.destroy();
                        resposta1txt1.destroy();
                        resposta2txt1.destroy();
                        resposta3txt1.destroy();
                        resposta4txt1.destroy();
                        caixaVerde.destroy();
                        celularQuiz.destroy();
                        this.quizAtivo = false;
                        this.quizOmoTerminado = true;
                        this.imgRx = ('ppOMO')
                        pedacosU.novoPedaco(); // Incrementa o contador
                        this.popUp(this.imgRx)
                        this.scene.get('HUD').updatePedacosText();
                    })
                } else{
                    caixaVermelha.setVisible(true)
                    caixaVermelha.x = centerX + 184;
                    caixaVermelha.y = centerY + 170;
                    this.time.delayedCall(1000, () => {
                        restartButton.setVisible(true);
                        caixaPergunta.setVisible(false);
                        resposta1.setVisible(false);
                        resposta2.setVisible(false);
                        resposta3.setVisible(false);
                        resposta4.setVisible(false);
                        caixaVermelha.setVisible(false);
                        pergunta1.setVisible(false);
                        resposta1txt1.setVisible(false);
                        resposta2txt1.setVisible(false);
                        resposta3txt1.setVisible(false);
                        resposta4txt1.setVisible(false);
                    })
                }
        });
        resposta2.on('pointerdown', () => {
                if(resposta2txt1.text === 'Sujeira é boa'){
                    caixaVerde.setVisible(true)
                    caixaVerde.x = centerX + 294;
                    caixaVerde.y = centerY +170;
                    this.time.delayedCall(1000, () => {
                    caixaVerde.setVisible(false)
                    resposta1txt1.setText('1940').setFontSize(12);
                    resposta2txt1.setText('1957').setFontSize(12);
                    resposta3txt1.setText('1967').setFontSize(12);
                    resposta4txt1.setText('1975').setFontSize(12);
                    pergunta1.setText('Em que ano a marca Omo foi\nintroduzida no mercado?').setFontSize(11);
        })}
                else{
                caixaVermelha.x = centerX + 294;
                caixaVermelha.y = centerY +170;
                caixaVermelha.setVisible(true);
                this.time.delayedCall(1000, () => {
                    restartButton.setVisible(true);
                    caixaPergunta.setVisible(false);
                    resposta1.setVisible(false);
                    resposta2.setVisible(false);
                    resposta3.setVisible(false);
                    resposta4.setVisible(false);
                    caixaVermelha.setVisible(false);
                    pergunta1.setVisible(false);
                    resposta1txt1.setVisible(false);
                    resposta2txt1.setVisible(false);
                    resposta3txt1.setVisible(false);
                    resposta4txt1.setVisible(false);
                })
                }
        });
        resposta4.on('pointerdown', () => {
            if(resposta4txt1 === ''){
            }
            else{
                caixaVermelha.x = centerX + 294;
                caixaVermelha.y = centerY + 215;
                caixaVermelha.setVisible(true);
                this.time.delayedCall(1000, () => {
                    restartButton.setVisible(true);
                    caixaPergunta.setVisible(false);
                    resposta1.setVisible(false);
                    resposta2.setVisible(false);
                    resposta3.setVisible(false);
                    resposta4.setVisible(false);
                    caixaVermelha.setVisible(false);
                    pergunta1.setVisible(false);
                    resposta1txt1.setVisible(false);
                    resposta2txt1.setVisible(false);
                    resposta3txt1.setVisible(false);
                    resposta4txt1.setVisible(false);
                    })
                }
        });
        restartButton.on('pointerdown', () => {
            restartButton.setVisible(false)
            caixaPergunta.setVisible(true);
            resposta1.setVisible(true);
            resposta2.setVisible(true);
            resposta3.setVisible(true);
            resposta4.setVisible(true);
            pergunta1.setVisible(true);
            resposta1txt1.setVisible(true);
            resposta2txt1.setVisible(true);
            resposta3txt1.setVisible(true);
            resposta4txt1.setVisible(true);
        })

        //Quando o ponteiro está em cima do botão, o mesmo fica com a textura ressaltado
        restartButton.on('pointerover', () => {
            restartButton.setTexture('botaoRestartHover');
        });

        // Quando o ponteiro sai de cima do botão, volta para a textura original
        restartButton.on('pointerout', () => {
            restartButton.setTexture('botaoRestart');
        });
    };
        }

        popUp(imagem) {

            var popupImage = this.add.image(this.cameras.main.centerX, this.cameras.main.centerY + 15, imagem).setDepth(1).setScale(0.6);
            popupImage.setScrollFactor(0); // Isso garante que a imagem fique fixa na tela e não se mova com a câmera
            // Agendar o desaparecimento da imagem após 2 segundos
            this.time.delayedCall(2000, () => {
                popupImage.destroy(); // Destruir a imagem, removendo-a da cena
            }, [], this);
        }
    }
