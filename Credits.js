//=============================================================================
// Credits.js
//=============================================================================

/*:
 * @target MZ
 * @plugindesc Tela de créditos com rolagem automática e botão no menu inicial.
 * @author ymdntsk
 *
 * @help
 * ============================================================================
 * Credits
 * ============================================================================
 * Mostra os créditos do jogo numa tela com rolagem automática.
 *
 * COMO USAR
 * 1. Salve como Credits.js em js/plugins/ (o nome precisa ser esse).
 * 2. Ative no Gerenciador de Plugins e escreva seus créditos no parâmetro
 *    "Texto dos créditos".
 *
 * COMO ESCREVER OS CRÉDITOS (uma linha por item)
 *   # Texto             -> título grande
 *   ## Texto            -> subtítulo
 *   Texto               -> linha normal
 *   (linha vazia)       -> espaço
 *   [space:40]          -> espaço de 40 pixels
 *   [img:nome]          -> imagem da pasta img/pictures/ (sem extensão)
 *
 * NA TELA DE CRÉDITOS
 *   - ESC (ou clique direito) sai.
 *   - Segurar Enter, seta para baixo ou o clique/toque acelera.
 *   - No fim, a tela fecha sozinha.
 *
 * BOTÃO NO MENU INICIAL
 *   - Com o plugin CustomTitleScreen: adicione um botão com a ação
 *     "Créditos" nos parâmetros dele.
 *   - Com o menu inicial padrão do RPG Maker: este plugin adiciona o
 *     comando automaticamente (dá pra desligar no parâmetro).
 *
 * COMANDO DE PLUGIN
 *   "Mostrar créditos" abre os créditos a partir de um evento
 *   (ótimo para o final do jogo).
 *
 * @param creditsText
 * @text Texto dos créditos
 * @desc Veja a ajuda do plugin para saber como formatar.
 * @type note
 * @default "# Meu Jogo\n\n## Direção\nSeu Nome\n\n## Programação\nSeu Nome\n\n## Arte\nSeu Nome\n\n## Música\nNome do Compositor\n\n## Agradecimentos Especiais\nSeus amigos e familiares\n\nObrigado por jogar!"
 *
 * @param backgroundImage
 * @text Imagem de fundo
 * @desc Imagem em img/system/ (esticada para a tela toda). Vazio = fundo preto.
 * @type file
 * @dir img/system/
 * @require 1
 *
 * @param scrollSpeed
 * @text Velocidade da rolagem
 * @desc Pixels por frame. 0.6 é devagar, 1.5 é rápido.
 * @type number
 * @decimals 2
 * @min 0.05
 * @default 0.6
 *
 * @param fastMultiplier
 * @text Multiplicador ao acelerar
 * @desc Quantas vezes mais rápido ao segurar Enter / seta para baixo / clique.
 * @type number
 * @min 1
 * @default 5
 *
 * @param startDelay
 * @text Espera antes de rolar
 * @desc Frames de espera depois do fade in (60 = 1 segundo).
 * @type number
 * @min 0
 * @default 30
 *
 * @param endDelay
 * @text Espera no final
 * @desc Frames de espera depois do último texto sair, antes de fechar.
 * @type number
 * @min 0
 * @default 90
 *
 * @param allowExit
 * @text Permitir sair com ESC
 * @type boolean
 * @on Sim
 * @off Não
 * @default true
 *
 * @param showHint
 * @text Mostrar dica na tela
 * @type boolean
 * @on Sim
 * @off Não
 * @default true
 *
 * @param hintText
 * @text Texto da dica
 * @type string
 * @default ESC: sair   |   Segure Enter: acelerar
 *
 * @param fontSize
 * @text Fonte: texto normal
 * @type number
 * @min 1
 * @default 26
 *
 * @param subheadingFontSize
 * @text Fonte: subtítulo (##)
 * @type number
 * @min 1
 * @default 32
 *
 * @param headingFontSize
 * @text Fonte: título (#)
 * @type number
 * @min 1
 * @default 44
 *
 * @param lineSpacing
 * @text Espaço extra entre linhas
 * @type number
 * @min 0
 * @default 8
 *
 * @param textColor
 * @text Cor do texto normal
 * @type string
 * @default #ffffff
 *
 * @param subheadingColor
 * @text Cor do subtítulo
 * @type string
 * @default #8fd3ff
 *
 * @param headingColor
 * @text Cor do título
 * @type string
 * @default #ffe08a
 *
 * @param bgm
 * @text Música dos créditos
 * @desc Opcional. Ao sair, a música anterior volta a tocar.
 * @type file
 * @dir audio/bgm/
 * @require 1
 *
 * @param bgmVolume
 * @text Volume da música
 * @type number
 * @min 0
 * @max 100
 * @default 90
 *
 * @param bgmPitch
 * @text Pitch da música
 * @type number
 * @min 50
 * @max 150
 * @default 100
 *
 * @param addToTitleMenu
 * @text Adicionar ao menu inicial padrão
 * @desc Só vale para o menu inicial padrão do RPG Maker.
 * @type boolean
 * @on Sim
 * @off Não
 * @default true
 *
 * @param commandName
 * @text Nome do comando no menu inicial
 * @type string
 * @default Créditos
 *
 * @command showCredits
 * @text Mostrar créditos
 * @desc Abre a tela de créditos. Ao terminar, volta para onde estava.
 */

(() => {
    "use strict";

    const pluginName = "Credits";
    const params = PluginManager.parameters(pluginName);

    const num = (v, d) => {
        const n = Number(v);
        return (v === undefined || v === "" || Number.isNaN(n)) ? d : n;
    };
    const bool = (v, d) => (v === undefined || v === "" ? d : String(v) === "true");

    //-------------------------------------------------------------------------
    // Parâmetros
    //-------------------------------------------------------------------------

    function readCreditsText() {
        const raw = params.creditsText;
        if (raw === undefined) {
            return "";
        }
        try {
            const parsed = JSON.parse(raw);
            return typeof parsed === "string" ? parsed : String(raw);
        } catch (e) {
            return String(raw);
        }
    }

    const creditsText = readCreditsText();
    const backgroundImage = String(params.backgroundImage || "");
    const scrollSpeed = num(params.scrollSpeed, 0.6);
    const fastMultiplier = num(params.fastMultiplier, 5);
    const startDelay = num(params.startDelay, 30);
    const endDelay = num(params.endDelay, 90);
    const allowExit = bool(params.allowExit, true);
    const showHint = bool(params.showHint, true);
    const hintText = params.hintText === undefined ? "ESC: sair   |   Segure Enter: acelerar" : String(params.hintText);
    const fontSize = num(params.fontSize, 26);
    const subheadingFontSize = num(params.subheadingFontSize, 32);
    const headingFontSize = num(params.headingFontSize, 44);
    const lineSpacing = num(params.lineSpacing, 8);
    const textColor = String(params.textColor || "#ffffff");
    const subheadingColor = String(params.subheadingColor || "#8fd3ff");
    const headingColor = String(params.headingColor || "#ffe08a");
    const creditsBgm = String(params.bgm || "");
    const bgmVolume = num(params.bgmVolume, 90);
    const bgmPitch = num(params.bgmPitch, 100);
    const addToTitleMenu = bool(params.addToTitleMenu, true);
    const commandName = String(params.commandName || "Créditos");

    //-------------------------------------------------------------------------
    // Leitura do texto dos créditos
    //-------------------------------------------------------------------------

    function parseCreditLines(text) {
        return text.split(/\r?\n/).map(line => {
            const t = line.trim();
            if (!t) {
                return { type: "space" };
            }
            let m = /^\[img:(.+)\]$/i.exec(t);
            if (m) {
                return { type: "image", name: m[1].trim() };
            }
            m = /^\[space:(\d+)\]$/i.exec(t);
            if (m) {
                return { type: "space", px: Number(m[1]) };
            }
            if (t.startsWith("## ")) {
                return { type: "sub", text: t.slice(3).trim() };
            }
            if (t.startsWith("# ")) {
                return { type: "heading", text: t.slice(2).trim() };
            }
            return { type: "text", text: t };
        });
    }

    //-------------------------------------------------------------------------
    // Comando de plugin
    //-------------------------------------------------------------------------

    PluginManager.registerCommand(pluginName, "showCredits", () => {
        if (!$gameParty.inBattle()) {
            SceneManager.push(Scene_Credits);
        }
    });

    //-------------------------------------------------------------------------
    // Scene_Credits
    //-------------------------------------------------------------------------

    function Scene_Credits() {
        this.initialize(...arguments);
    }

    Scene_Credits.prototype = Object.create(Scene_Base.prototype);
    Scene_Credits.prototype.constructor = Scene_Credits;

    Scene_Credits.prototype.initialize = function() {
        Scene_Base.prototype.initialize.call(this);
        this._entries = [];
        this._scroll = 0;
        this._totalHeight = 0;
        this._delay = 0;
        this._endTimer = 0;
        this._ending = false;
        this._savedBgm = null;
        this._savedBgs = null;
        this._creditsBgmPlaying = false;
    };

    Scene_Credits.prototype.create = function() {
        Scene_Base.prototype.create.call(this);
        this.createBackground();
        this.createEntryLayer();
        this.createHint();
        this.parseEntries();
    };

    Scene_Credits.prototype.createBackground = function() {
        if (!backgroundImage) {
            return;
        }
        const bitmap = ImageManager.loadSystem(backgroundImage);
        this._backgroundSprite = new Sprite(bitmap);
        bitmap.addLoadListener(() => {
            this._backgroundSprite.scale.x = Graphics.width / bitmap.width;
            this._backgroundSprite.scale.y = Graphics.height / bitmap.height;
        });
        this.addChild(this._backgroundSprite);
    };

    Scene_Credits.prototype.createEntryLayer = function() {
        this._entryLayer = new Sprite();
        this.addChild(this._entryLayer);
    };

    Scene_Credits.prototype.createHint = function() {
        if (!showHint || !hintText) {
            return;
        }
        const height = 36;
        const bitmap = new Bitmap(Graphics.width, height);
        bitmap.fontFace = $gameSystem.mainFontFace();
        bitmap.fontSize = 18;
        bitmap.textColor = "#ffffff";
        bitmap.paintOpacity = 170;
        bitmap.drawText(hintText, 0, 0, Graphics.width - 16, height, "right");
        this._hintSprite = new Sprite(bitmap);
        this._hintSprite.y = Graphics.height - height;
        this.addChild(this._hintSprite);
    };

    Scene_Credits.prototype.parseEntries = function() {
        this._entries = parseCreditLines(creditsText);
        // Pede as imagens agora, para estarem carregadas quando a cena começar.
        this._entries.forEach(e => {
            if (e.type === "image") {
                e.bitmap = ImageManager.loadPicture(e.name);
            }
        });
    };

    Scene_Credits.prototype.lineHeightFor = function(size) {
        return Math.ceil(size * 1.4) + lineSpacing;
    };

    Scene_Credits.prototype.layoutEntries = function() {
        let y = 0;
        for (const e of this._entries) {
            switch (e.type) {
                case "heading":
                    e.size = headingFontSize;
                    e.color = headingColor;
                    e.h = this.lineHeightFor(e.size) + 12;
                    break;
                case "sub":
                    e.size = subheadingFontSize;
                    e.color = subheadingColor;
                    e.h = this.lineHeightFor(e.size) + 4;
                    break;
                case "text":
                    e.size = fontSize;
                    e.color = textColor;
                    e.h = this.lineHeightFor(e.size);
                    break;
                case "image":
                    e.h = e.bitmap.height + 12;
                    break;
                default: // space
                    e.h = e.px !== undefined ? e.px : this.lineHeightFor(fontSize);
                    break;
            }
            e.y = y;
            e.sprite = null;
            y += e.h;
        }
        this._totalHeight = y;
    };

    Scene_Credits.prototype.start = function() {
        Scene_Base.prototype.start.call(this);
        this.layoutEntries();
        this.playCreditsBgm();
        this.startFadeIn(this.slowFadeSpeed(), false);
        this._delay = startDelay;
    };

    Scene_Credits.prototype.playCreditsBgm = function() {
        if (!creditsBgm) {
            return;
        }
        this._savedBgm = AudioManager.saveBgm();
        this._savedBgs = AudioManager.saveBgs();
        AudioManager.stopBgs();
        AudioManager.playBgm({ name: creditsBgm, volume: bgmVolume, pitch: bgmPitch, pan: 0 });
        this._creditsBgmPlaying = true;
    };

    Scene_Credits.prototype.update = function() {
        Scene_Base.prototype.update.call(this);
        if (this._ending) {
            return;
        }
        this.updateInput();
        this.updateScroll();
        this.updateEntries();
    };

    Scene_Credits.prototype.updateInput = function() {
        if (allowExit && (Input.isTriggered("cancel") || TouchInput.isCancelled())) {
            this.exitCredits();
        }
    };

    Scene_Credits.prototype.isFastForward = function() {
        return Input.isPressed("ok") || Input.isPressed("down") || TouchInput.isPressed();
    };

    Scene_Credits.prototype.updateScroll = function() {
        if (this._delay > 0) {
            this._delay--;
            return;
        }
        const speed = scrollSpeed * (this.isFastForward() ? fastMultiplier : 1);
        const maxScroll = Graphics.height + this._totalHeight + 20;
        this._scroll = Math.min(this._scroll + speed, maxScroll);
        if (this._scroll >= maxScroll) {
            this._endTimer++;
            if (this._endTimer >= endDelay) {
                this.exitCredits();
            }
        }
    };

    // Só mantém sprites das linhas que estão perto da tela (economiza memória).
    Scene_Credits.prototype.updateEntries = function() {
        const margin = 80;
        for (const e of this._entries) {
            if (e.type === "space") {
                continue;
            }
            const y = Graphics.height + e.y - this._scroll;
            const visible = y + e.h > -margin && y < Graphics.height + margin;
            if (visible) {
                if (!e.sprite) {
                    this.createEntrySprite(e);
                }
                e.sprite.y = Math.round(y);
            } else if (e.sprite) {
                this.destroyEntrySprite(e);
            }
        }
    };

    Scene_Credits.prototype.createEntrySprite = function(e) {
        if (e.type === "image") {
            const sprite = new Sprite(e.bitmap);
            sprite.anchor.x = 0.5;
            sprite.x = Graphics.width / 2;
            e.sprite = sprite;
        } else {
            const bitmap = new Bitmap(Graphics.width, e.h);
            bitmap.fontFace = $gameSystem.mainFontFace();
            bitmap.fontSize = e.size;
            bitmap.textColor = e.color;
            bitmap.drawText(e.text, 40, 0, Graphics.width - 80, e.h, "center");
            e.sprite = new Sprite(bitmap);
        }
        this._entryLayer.addChild(e.sprite);
    };

    Scene_Credits.prototype.destroyEntrySprite = function(e) {
        this._entryLayer.removeChild(e.sprite);
        if (e.type !== "image" && e.sprite.bitmap) {
            e.sprite.bitmap.destroy();
        }
        e.sprite = null;
    };

    Scene_Credits.prototype.exitCredits = function() {
        if (this._ending) {
            return;
        }
        this._ending = true;
        if (this._creditsBgmPlaying) {
            AudioManager.fadeOutBgm(1);
        }
        this.startFadeOut(this.slowFadeSpeed(), false);
        if (SceneManager._stack.length > 0) {
            SceneManager.pop();
        } else {
            SceneManager.goto(Scene_Title);
        }
    };

    Scene_Credits.prototype.terminate = function() {
        Scene_Base.prototype.terminate.call(this);
        for (const e of this._entries) {
            if (e.sprite) {
                this.destroyEntrySprite(e);
            }
        }
        if (this._hintSprite && this._hintSprite.bitmap) {
            this._hintSprite.bitmap.destroy();
        }
        if (this._savedBgm) {
            AudioManager.replayBgm(this._savedBgm);
        }
        if (this._savedBgs) {
            AudioManager.replayBgs(this._savedBgs);
        }
    };

    // Ao voltar dos créditos para o mapa, faz fade in (em vez de aparecer de repente).
    const _Scene_Map_needsFadeIn = Scene_Map.prototype.needsFadeIn;
    Scene_Map.prototype.needsFadeIn = function() {
        return _Scene_Map_needsFadeIn.call(this) || SceneManager.isPreviousScene(Scene_Credits);
    };

    //-------------------------------------------------------------------------
    // Menu inicial padrão: adiciona o comando "Créditos"
    //-------------------------------------------------------------------------

    const _Window_TitleCommand_makeCommandList = Window_TitleCommand.prototype.makeCommandList;
    Window_TitleCommand.prototype.makeCommandList = function() {
        _Window_TitleCommand_makeCommandList.call(this);
        if (addToTitleMenu) {
            this.addCommand(commandName, "credits");
        }
    };

    const _Scene_Title_commandWindowRect = Scene_Title.prototype.commandWindowRect;
    Scene_Title.prototype.commandWindowRect = function() {
        const rect = _Scene_Title_commandWindowRect.call(this);
        if (addToTitleMenu) {
            const extra = this.calcWindowHeight(4, true) - this.calcWindowHeight(3, true);
            rect.y -= extra;
            rect.height += extra;
        }
        return rect;
    };

    const _Scene_Title_createCommandWindow = Scene_Title.prototype.createCommandWindow;
    Scene_Title.prototype.createCommandWindow = function() {
        _Scene_Title_createCommandWindow.call(this);
        if (this._commandWindow) {
            this._commandWindow.setHandler("credits", this.commandCredits.bind(this));
        }
    };

    Scene_Title.prototype.commandCredits = function() {
        this._commandWindow.close();
        SceneManager.push(Scene_Credits);
    };

    window.Scene_Credits = Scene_Credits;
})();
