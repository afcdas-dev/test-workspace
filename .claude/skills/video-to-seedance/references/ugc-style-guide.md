# UGC Style Guide — Skincare hiper-realista (Seedance 2.0)

Destilado de 15 vídeos UGC reais de skincare (Principia, Cleardew, Curél,
LEES; PT-BR e FR). Este guia é a referência obrigatória ao gerar prompts de
vídeo UGC. Objetivo: pele que parece FILMADA, não gerada.

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

- [ ] 3–5 termos de pele natural (seção 2)?
- [ ] Produto interagindo com a pele ou em macro (seção 3)?
- [ ] Enquadramento + movimento de câmera explícitos (seção 4)?
- [ ] Uma fonte de luz definida (seção 5)?
- [ ] Detalhes de creator (unhas, joias, figurino) (seção 6)?
- [ ] Zero anti-padrões (seção 9)?
- [ ] Duração e 9:16 declarados?
