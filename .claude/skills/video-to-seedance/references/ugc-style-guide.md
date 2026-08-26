# UGC Style Guide — Skincare hiper-realista (Google Flow, Seedance 2.0, Kling, Veo)

Destilado de 15 vídeos UGC reais de skincare (Principia, Cleardew, Curél,
LEES; PT-BR e FR). Este guia é a referência obrigatória ao gerar prompts de
vídeo UGC. Objetivo: pele que parece FILMADA, não gerada.

Este arquivo cobre PELE, PRODUTO-NA-PELE, LUZ, CENÁRIO e ANTI-PADRÕES.
Movimento, câmera e física estão em `motion-realism.md`; estrutura do prompt e
timeline em `prompt-structure.md`; identidade entre shots em
`character-consistency.md`; correção de frame em `frame-editing.md`.

---

## 1. A regra de ouro do realismo

O realismo NÃO vem de escrever "hyper realistic". Vem de descrever três
coisas que os vídeos reais sempre têm:

1. **Pele imperfeita em detalhe** — poros, penugem, vermelhidão, brilho de sebo.
2. **Produto interagindo com a pele** — gota escorrendo, listras de creme,
   espuma com bolhas, marca de dedo na textura.
3. **Câmera imperfeita** — micro-tremido de mão, enquadramento de selfie,
   foco que escolhe o produto e deixa o rosto desfocar.

Um prompt que tenha esses três elementos gera UGC crível. Um prompt sem
eles gera comercial de TV genérico.

## 2. Vocabulário de pele natural (usar 3–5 por prompt)

Base obrigatória:
- `unretouched natural skin with visible pores`
- `real skin texture, no beauty filter, no airbrushing`
- `subtle sebum shine on the T-zone and sides of the nose`
- `fine peach fuzz catching the light on the cheek and jawline`

Imperfeições (escolher conforme o talento):
- `light natural redness on the cheeks and around the nostrils`
- `a few tiny blemishes and micro-bumps on the cheek`
- `natural freckles scattered across the nose and cheeks`
- `slight under-eye darkness and fine lines`
- `individual brow hairs and baby hairs along the hairline`
- `lashes with slightly clumped mascara`

Assimetria e variação (o que separa pele real de textura aplicada):
- `varied pore sizes — larger around the nose, finer on the cheeks`
- `natural facial asymmetry, the two sides of the face are not identical`
- `realistic under-eye texture with fine crepey lines`
- `subtle tonal variation across the face, not a uniform complexion`

**Nunca interpretar "pele bonita" como pele lisa.** Em close-up, preservar a
textura autêntica é o que faz o rosto parecer filmado. Pele sem poro é o
primeiro sinal de IA, mesmo quando todo o resto está certo.

Evitar sempre: `flawless skin`, `porcelain skin`, `plastic skin`, `airbrushed`,
`beauty filter`, `excessive glow`, `uniform complexion`, `artificial
sharpening`, `CGI skin`, `perfect symmetry`.

Glow/dewy (para looks de hidratação/golden hour):
- `dewy glowing skin with specular highlights on cheekbones and forehead`
- `skin looks damp and hydrated, catching warm directional sunlight`
- `glossy lips with natural lip texture`

## 3. Vocabulário de produto-na-pele (o segredo dos vídeos reais)

- `a drop of serum slowly rolling down the cheek, leaving a glistening trail`
- `white cream smeared in streaks across the forehead and cheeks, mid-application`
- `fingertips spreading the product with gentle circular motions`
- `milky liquid dripping from a glass dropper back into the amber bottle`
- `thick whipped cream texture with a fingertip scoop mark`
- `dense white foam with visible tiny bubbles covering the face`
- `sunscreen stripes on both cheeks before blending`

## 3.1 Física imperfeita de líquido (feedback de produção — 2026-08-24)

Diagnóstico validado em outputs do Google Flow: a gota de sérum descendo em
linha reta com velocidade constante entrega IA na hora. Líquido real na pele
é IRREGULAR. Sempre descrever o movimento com hesitação e assimetria:

- `the drop stalls for a moment, then continues in a thinner, uneven trail`
- `the serum trail wobbles slightly, following the skin's texture instead of
  a straight line`
- `a smaller secondary droplet lags behind the main drop`
- `she catches the drop mid-cheek with a fingertip before it reaches her jaw,
  smearing it unevenly`
- `the serum spreads in uneven streaks that slowly absorb, leaving patches
  of shine`
- `foam slides and partially collapses instead of holding a perfect shape`

Regra: NUNCA deixar um líquido se mover sem um verbo de imperfeição
(stall, wobble, break up, lag, smear unevenly, partially absorb).

## 3.2 Material do líquido — translucidez e molhamento (feedback 2026-08-24, outputs Google Flow)

Diagnóstico de 4 outputs do Flow: a PELE saiu ótima (poros, espinhas reais,
sardas, penugem, cílios irregulares — o vocabulário da §2 funciona). O que
entrega IA é o SÉRUM: ele é renderizado como uma fita de gel opaco e brilhante
POUSADA sobre a pele, não como líquido que a molha.

Os cinco delatores observados:
1. Opaco — cor chapada; não se vê poro nem sarda através do líquido.
2. Bordas duras e envernizadas, como bala de goma / adesivo 3D.
3. Rastro de largura constante descendo em linha reta.
4. Formato "girino": cabeça bulbosa + cauda uniforme (assinatura de render 3D).
5. Nunca absorve: permanece fita molhada do início ao fim.

Vocabulário corretivo — usar SEMPRE que houver líquido na pele:
- `translucent serum — pores, freckles and blemishes stay visible through the liquid`
- `the liquid wets the skin, darkening it slightly where it spreads`
- `the edge of the liquid is feathered and irregular where it meets the skin texture`
- `the trail thins as it descends, narrowing to a thread and splitting into two
  finer rivulets that stop at different heights`
- `it dulls as it sinks in, leaving only a damp sheen and a faint tint`
- `the drop catches on a pore and changes direction slightly`

**Cor: descrever como tinta fraca em líquido claro, nunca saturada.**
"vivid pink" / "vivid orange" produzem aparência de tinta guache. Usar:
`a clear serum with a faint pink cast` / `pale amber, almost clear serum`.
A cor deve aparecer na CONCENTRAÇÃO (mais forte onde acumula, quase invisível
onde é fina) — é assim que líquido translúcido se comporta.

## 4. Câmera e enquadramento (sempre explícito)

Enquadramentos-assinatura do UGC real (escolher 1 por shot):
- `extreme close-up: half of the face filling the frame, phone camera held ~15cm away`
- `selfie framing chest-up, slight wide-angle lens distortion`
- `product held out toward the lens at arm's length, face soft-focus behind it`
- `macro shot of the bottle in hand, background completely blurred`
- `hands-only shot: palms rubbing foam, no face in frame`
- `profile view, eyes closed, chin tilted up, dropper hovering above the cheek`

Movimento (sempre incluir um):
- `subtle handheld micro-shake throughout` (o padrão)
- `slow drift toward the face` / `slow drift left revealing the background`
- `rack focus from the face to the product label`
- `static tripod framing with natural body sway`

## 5. Luz (escolher 1)

- `soft diffused window light from the side` (padrão dos vídeos reais)
- `bright high-key studio light, light grey-lilac seamless background`
- `warm golden hour sunlight streaking across the face` (para glow)
- `soft bathroom light, spa-like atmosphere`
- Nunca: luz dura frontal de flash, ring light marcado na pupila.

## 6. Direção de talento (naturalidade)

- `gentle closed-lip smile, direct eye contact with the lens`
- `relaxed unposed expression, mid-blink moments`
- `face partially hidden behind the product / behind soapy hands` (autêntico!)
- `looking at the product, not at the camera` (estilo ASMR/estética)
- Detalhes de "creator real": `painted nails` (vinho/rosa/vermelho/francesinha),
  `thin gold necklace`, `small hoop earrings`, `plush bathrobe / satin robe /
  linen shirt`, `hair in a slicked-back bun or high ponytail, flyaways visible`.

## 7. Cenários validados

- Quarto real: cama desfocada, cortina de ilhós, parede bege.
- Estúdio: fundo seamless cinza-claro/lilás ou rosa-areia.
- Banheiro spa: espelho de arco, azulejos claros.
- Painel 3D ondulado branco + piso de madeira (set de "clean beauty").
- Externa: parede geométrica/cobogó claro, dia nublado.

## 8. Estrutura do vídeo UGC (montagem)

- Duração total: 10–30s; shots de 2–5s cada.
- Arco típico: HOOK (produto/textura em macro ou rosto com produto) →
  DEMO (aplicação na pele) → CTA (produto ao lado do rosto, olhar na câmera).
- Legendas queimadas: bold branca com sombra suave, 1–2 linhas curtas,
  centro-inferior (adicionar na edição, NÃO pedir ao gerador).
- Formato: vertical 9:16, 24–30fps, look de iPhone (leve grão em sombra).

## 9. Anti-padrões (nunca escrever)

- "hyper realistic", "8k", "ultra HD", "photorealistic render" — geram
  plástico. Descrever a imperfeição em vez de pedir "realismo".
- "perfect flawless skin" — mata o UGC instantaneamente.
- Negativas ("no filter" é exceção consagrada; evitar "no blur, no artifacts").
- Zoom dramático, travelling de cinema, iluminação tri-point — é UGC, não comercial.
- Líquido descendo em linha reta com velocidade constante (ver §3.1) —
  descrever hesitação/assimetria ou o shot sai animado demais.
- Cor de produto saturada ("vivid pink/orange", "bright red") — vira tinta
  opaca. Descrever líquido claro com leve tom (§3.2).
- Líquido sem translucidez nem absorção: se o prompt não disser que se vê a
  pele ATRAVÉS do sérum e que ele afunda deixando brilho, o gerador entrega
  uma fita de gel pousada na pele (§3.2).
- Mãos/dedos que se movem em arco perfeito e contínuo: acrescentar
  `she adjusts her grip mid-motion` ou `slight motion blur as the hand moves`.
- Foco cravado o tempo todo: um `focus hunts for a beat before locking on
  the label` vende câmera de celular real (usar com moderação, 1x por vídeo).
- Não recriar marcas d'água nem legendas de vídeos de referência.

## 10. Template de prompt Seedance 2.0 (few-shot)

### Exemplo A — macro de aplicação (estilo ugc-18, o mais hiper-real)
```
Authentic handheld UGC skincare video, vertical 9:16, phone camera look.
Extreme close-up: half of a young woman's face fills the frame, camera
~15cm away with subtle handheld micro-shake. Unretouched natural skin with
visible pores, fine peach fuzz catching the light, light natural redness
and a few tiny micro-bumps on the cheek, lashes with slightly clumped
mascara. A drop of clear serum slowly rolls down her cheek leaving a
glistening trail; she then spreads it upward with two fingertips, short
french-manicured nails, gold rings. Cherry-shaped earrings, ribbed pink
top. Soft diffused window light. The skin looks filmed on an iPhone, not
retouched. Duration 8 seconds.
```

### Exemplo B — produto para a câmera (estilo ugc-2/ugc-9)
```
Authentic UGC ad, vertical 9:16, selfie framing chest-up. A young woman
with dark hair in a high ponytail, plush white bathrobe, thin gold
necklace, dark red painted nails, holds a white pump bottle out toward
the lens at arm's length — the product label is in sharp focus while her
softly smiling face falls into shallow-focus behind it. Rack focus from
her face to the label. Real skin texture with subtle sebum shine, natural
freckles. Bright soft window light, cozy bedroom with blurred bed behind.
Subtle handheld micro-shake. Duration 5 seconds.
```

### Exemplo C — textura de produto em macro (estilo ugc-10/ugc-14)
```
Macro UGC beauty shot, vertical 9:16. A glass dropper releases a milky
serum drop that falls back into an amber glass bottle held in a hand with
light pink almond nails; a white 3D wavy panel and warm wood floor blur in
the background. Warm diffused natural light, soft shadows, authentic phone
camera look with subtle handheld movement. The liquid texture is sharp and
glistening. Duration 4 seconds.
```

### Exemplo D — glow golden hour (estilo ugc-14)
```
Authentic UGC skincare video, vertical 9:16. A young woman with hair in a
slicked-back bun, white knit top, faces the camera as warm golden hour
sunlight streaks across her face. Her skin is dewy and hydrated with
specular highlights on the cheekbones and forehead, visible peach fuzz
against the backlight, natural rosy cheeks, glossy lips. She presses her
fingertips gently along her cheekbones, spreading a facial cream, relaxed
unposed expression. Static tripod framing with natural body sway. Duration
6 seconds.
```

## 11. Checklist final antes de entregar um prompt

**Pele e produto (este arquivo)**
- [ ] 3–5 termos de pele natural, incluindo uma assimetria (§2)?
- [ ] Nenhum termo da lista de "evitar sempre" (§2)?
- [ ] Produto interagindo com a pele ou em macro (§3)?
- [ ] Se há líquido: translucidez, molhamento e absorção descritos (§3.2)?
- [ ] Se há líquido: verbo de imperfeição no movimento (§3.1)?
- [ ] Cor do produto como tom fraco em líquido claro (§3.2)?
- [ ] Uma fonte de luz definida (§5)?
- [ ] Detalhes de creator: unhas, joias, figurino (§6)?
- [ ] Zero anti-padrões (§9)?

**Movimento (`motion-realism.md`)**
- [ ] Zero ocorrências de "natural/realistic/smooth movement"?
- [ ] Regra da imobilidade incluída literalmente?
- [ ] Mão decomposta em APPROACH→HESITATION→CONTACT→PRESSURE→ADJUSTMENT→RELEASE?
- [ ] Micro-movimento facial sutil, sem sorriso constante nem olhar fixo?
- [ ] Câmera com micro-tremor e correção de enquadramento, sem gimbal?
- [ ] Gestos repetidos com variação de trajetória/velocidade/pressão?

**Estrutura (`prompt-structure.md`)**
- [ ] Todos os blocos presentes (CAMERA…NEGATIVE CONSTRAINTS)?
- [ ] Acima de ~4s: timeline com beats, cada um dizendo o que fica PARADO?
- [ ] Restrições negativas escolhidas para os riscos desta cena?

**Identidade (`character-consistency.md`)**
- [ ] Mais de um shot: lista de travamento no início de cada prompt?
- [ ] Descrição da personagem idêntica palavra por palavra entre shots?

**Básico**
- [ ] Inglês, verbos concretos, duração e 9:16 declarados?
