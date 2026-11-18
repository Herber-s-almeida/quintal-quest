# Quintal Quest — contexto do projeto

Jogo web de plataforma 2D em pixel art, inspirado em **Super Mombo Quest** (rápido, ágil, cheio de efeitos e "dopamina").
Protagonista: uma formiguinha azul. Todo o mundo se passa no quintal e dentro de uma casa.

- **Jogo publicado (artifact Claude):** https://claude.ai/artifact/NzTyvPnj9VASbrXsN3GWt5
- **Arquivo jogável:** `index.html` (arquivo único, ~12 MB, com todas as imagens e sons embutidos — abre direto no Chrome, inclusive no Android).

## Estrutura dos arquivos

| Arquivo | O que é |
|---|---|
| `index.html` | **Build final** (gerado). É o que se joga/publica. |
| `game.js` | Todo o código do jogo (fonte). |
| `shell.html` | Esqueleto HTML/CSS (canvas, botões de toque, GOD, FASES). Recebe `/*ASSETS*/` e `/*GAME*/` no build. |
| `assets/` | Imagens processadas (PNG) e metadados (JSON) usados no jogo. |
| `tools/build.py` | Junta `shell.html` + `game.js` + `assets/` (em base64) → `index.html`. |
| `tools/process*.py` | Scripts que recortaram/redimensionaram os assets originais enviados (referência; apontam para caminhos do ambiente do Claude). |
| `tools/p*.py` | Patches históricos aplicados ao `game.js` (só referência; não precisa rodar). |

**Para rebuildar:** ajuste os caminhos no topo de `tools/build.py` para esta pasta e rode `python tools/build.py`.

## Técnico
- Canvas 640×360 escalado (pixel art), tile 16 px, `ROWS = 26`, `BASE = 3` (chão elevado).
- Áudio 100% sintetizado (WebAudio): efeitos + música chiptune por fase.
- Progresso salvo em `localStorage` (prefixo `qq_`).
- Formiga: atlas `ant.png` (64×60 por frame; animações run/walk/hurt/punch; linha 2 = versão vermelha para inimigos) e `antclimb.png` (escalada/soco na parede).
- Inimigos e chefes, quando não havia sprite, são desenhados por código (`pix()`).

## Controles
- **Celular:** analógico flutuante (metade esquerda da tela, base segue o dedo, zona morta pequena, histerese) + botões PULO, SOCO, DASH, pausa.
- **Teclado:** setas/WASD, Espaço/Z pulo, X soco, Shift/C dash, ↑ escalar, M som, G godmode, Esc pausa.
- **Teste:** botão **GOD** (invencível) e botão **FASES** (escolher qualquer fase).

## Mecânicas do personagem
- 4 corações; cada dano tira **½ coração**; cair em água/buraco tira 1 (limitado a 1x a cada 1,5 s, volta em chão firme com 0,5 s de controle travado — corrigido bug de loop de morte).
- Pulo com altura variável, coyote time 0,12 s, buffer 0,15 s, controle aéreo forte, virada instantânea no chão.
- **Pulo duplo** (cambalhota); pisar em inimigo recarrega.
- Soco, dash (1x no ar), pisão que quica, combos aéreos com multiplicador.
- **Turbo do açúcar:** a cada 10 cubos → 5 s invencível + 50% mais rápido (encostar derrota inimigos).
- **Posto das Enfermeiras Operárias** (formiga enfermeira): cura total, só antes dos chefes.
- Final de fase: bandeira sobe, fanfarra, confete, placar (açúcar, inimigos, combo, tempo) e 1–3 estrelas; mapa do quintal avança.

## Fases (8)
1. **Formigueiro** — besouros e gafanhotos mini; formiguinhas assustadas no fundo. **Chefe: Gafanhoto Invasor** (pulos com ondas de choque, chute em disparada).
2. **Caixa de Areia** — joaninhas carnívoras, escorpiões (+10%, pisar em cima machuca: ferrão), formigas vermelhas. **Chefe: Escorpião Gigante** (ferroada mirada que prende na areia, investida de pinças → tonto, mergulho na areia).
3. **Poça de Lama (pântano)** — sapos (lambida) e moscas. Cutscene: enxame com o **Rei das Moscas** finge ser o chefe e o **Sapo Gigante** come todas. Chefe com espinhos nas costas; ataques: língua alta/baixa, salto esmagador (sombra com aviso "FUJA!"), sucção. Arena +20%.
4. **Gramado** — bicho-pau camuflado, gafanhotos, borboletas, lagartas de fogo, cobrinhas. **Chefe: Cobra Venenosa** (88% do tamanho original, 17 de vida; só os espinhos do corpo machucam; bote → atordoada, cuspe de veneno com poças, crias, pulo com ondas; na metade da vida cospe **veneno rosa de cura (+2 corações)** e fica furiosa).
5. **Parede da Casa** — fase vertical de escalada; cupins operários e soldados, ninhos nas rachaduras (lacrar com 3 socos), tinta fresca escorregadia; termina no parapeito da janela.
6. **Cozinha** — **Mesa** (baratas, moscas, mel grudento, tachinhas) → cutscene: **cabeça do cachorro (frente)** fareja, late e derruba a formiga → **queda longa** com câmera acompanhando, "AAAAH!" de braços erguidos → **Chão da Cozinha** (checkpoint; fundo mostra a parte de baixo dos móveis; patas gigantes do cachorro pisando com sombra de aviso; tachinhas, espátula em pêndulo, bolas de tênis). **Chefe: Onda de Pulgas** saindo da cabeça do cachorro (de lado, em camadas: língua/mandíbula atrás da cabeça).
7. **Banheiro (bônus, sem inimigos)** — puzzle de bolhas de sabão: bolhas que estouram e impulsionam, bolhas douradas‑interruptor que criam pontes de espuma temporárias, correntes de bolhas; termina no **ralo**.
8. **Esgoto** — ratos e baratas grandes/nojentas. **Chefe: Rato Gigante** (chega surfando num cocô com milho; aura verde de fedor; pancada com o cocô, arremesso, pum tóxico, surfe).

## Pendências / ideias
- Trocar inimigos desenhados por código por sprites próprios quando houver.
- Sprite próprio da formiga caindo (hoje os braços são desenhados por cima).
- Repetição visível da textura de madeira da mesa.
- Testar em celular real (tamanho do analógico/botões).
- Possível hospedagem no servidor Hostinger do Herbie para link próprio.
