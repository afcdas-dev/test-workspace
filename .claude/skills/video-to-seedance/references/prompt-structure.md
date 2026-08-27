# Estrutura do prompt de vídeo

## 1. Blocos obrigatórios

Todo prompt de vídeo se organiza nestes blocos, nesta ordem. Nenhum é opcional
quando o elemento existe na cena.

**CAMERA** — tipo de câmera, enquadramento, distância, ângulo, comportamento
handheld, movimento.

**CHARACTER** — identidade, aparência, roupa, acessórios, expressão, posição
do corpo. Com personagem recorrente, abrir com a lista de travamento de
`character-consistency.md` §1.

**PRIMARY ACTION** — exatamente o que a personagem faz.

**MICRO-MOVEMENTS** — respiração, piscadas, postura, mãos, dedos, olhos,
cabeça, reações sutis.

**OBJECT INTERACTION** — aproximação, contato, pressão, movimento, soltura,
resposta física. Decompor mãos em seis fases (`motion-realism.md` §3).

**ENVIRONMENT** — iluminação, fundo, atmosfera.

**PHYSICS** — gravidade, inércia, comportamento do líquido, tecido, cabelo.

**NEGATIVE CONSTRAINTS** — o que NÃO pode acontecer (§3 abaixo).

## 2. Sistema de timeline (vídeos acima de ~4s)

Dividir a ação em beats temporais. Para cada beat, especificar quatro coisas:

1. **O que se move**
2. **Como se move**
3. **Por que se move**
4. **O que permanece parado** ← obrigatório, nunca omitir

O item 4 é o que impede o modelo de animar tudo ao mesmo tempo. É a diferença
entre UGC e propaganda.

Exemplo de timeline (8s):

```
0–1s: The woman remains mostly still. Natural breathing and one subtle blink.
      The phone camera has minimal handheld micro-shake. Her hands stay out
      of frame.
1–2s: Her hand enters the frame and slowly approaches the cheek. Her wrist
      makes a tiny adjustment before positioning the dropper. Her head and
      shoulders remain still.
2–3s: The dropper touches the cheek and pauses. The model remains mostly
      still. A serum droplet forms at the tip and stretches under its own
      weight.
3–4s: The droplet detaches and begins moving down the cheek under gravity.
      Her hand holds position; only her eyes follow the movement slightly.
4–5s: She slowly brings two fingertips toward the cheek. There is a tiny
      hesitation before contact. The dropper hand leaves the frame.
5–7s: She spreads the serum using small irregular circular motions. The
      circles vary slightly in size, pressure and speed. Her head stays still.
7–8s: The movement slows naturally. Her hand remains near the cheek. She
      makes a small head adjustment and blinks. Everything else is still.
```

## 3. Restrições negativas — biblioteca

Declarar explicitamente. Escolher as relevantes à cena; não despejar todas.

**Identidade e anatomia**
```
No identity drift, no face morphing, no change in facial proportions or
apparent age. No extra fingers, no malformed hands, no teleporting hands.
```

**Pele**
```
No skin smoothing, no plastic or CGI skin, no beauty filter, no airbrushing,
no artificial sharpening, no uniform complexion.
```

**Objetos e produto**
```
The product packaging must not change shape, colour or label. Jewelry must
not disappear or change. No floating objects.
```

**Movimento e câmera**
```
No continuous animation, no excessive motion, no unnatural eye movement, no
exaggerated or repetitive blinking, no sudden camera jumps, no cinematic
gimbal movement, no artificial zoom.
```

**Líquido**
```
The liquid must not behave like an animated graphic, must not stay opaque,
and must not run in a constant-width straight line.
```

**Geral**
```
No clothing deformation, no inconsistent lighting, no inconsistent scale.
```

## 4. Prevenção de artefatos conhecidos

Mapa de defesa — o artefato à esquerda se previne com a instrução à direita.

| Artefato | Defesa no prompt |
|---|---|
| Deriva de identidade | Lista de travamento + imagem de referência |
| Face morphing | Âncoras de assimetria (pinta, sobrancelha irregular) |
| Pele lisa/plástica | Vocabulário da §2 do `ugc-style-guide.md` + negativa explícita |
| Proporções faciais mudando | `identical facial structure` repetido no beat final |
| Dedos extras / mão deformada | Manter mãos em enquadramento simples; evitar dedos abertos e sobrepostos; declarar `five fingers, anatomically correct hands` |
| Joia sumindo | Citar a joia em mais de um beat da timeline |
| Embalagem mudando | Descrever o frasco uma vez e travar: `the bottle must not change` |
| Líquido antinatural | `motion-realism.md` §6 + `ugc-style-guide.md` §3.1/§3.2 |
| Objeto flutuando | Declarar o suporte: `the bottle rests in her hand, weight visible` |
| Mão teletransportando | Beats de entrada/saída explícitos na timeline |
| Salto de câmera | `continuous single take, no cuts` |
| Movimento excessivo | Regra da imobilidade + coluna "o que permanece parado" |
| Olhar antinatural | `she blinks naturally and occasionally looks away from the lens` |
| Roupa deformando | Descrever caimento: `the robe holds its shape, folds move slowly` |
| Luz inconsistente | Uma única fonte declarada e repetida |
| Escala inconsistente | `the bottle is roughly the length of her palm` |

## 5. Regra de geração (antes de escrever o prompt)

Ao receber um conceito, imagem, referência de personagem ou frame problemático,
NÃO produzir de imediato um prompt cinematográfico genérico. Determinar
internamente, primeiro:

- requisitos de identidade
- comportamento de câmera
- ação principal
- micro-movimentos
- interação de mão
- movimento facial
- física dos objetos
- **o que deve permanecer parado**
- requisitos de pele
- pontos prováveis de falha da IA para esta cena
- restrições negativas aplicáveis

Só então escrever o prompt final otimizado.
