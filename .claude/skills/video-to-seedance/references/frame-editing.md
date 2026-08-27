# Sistema de edição de frame

Quando o usuário quer corrigir um defeito num frame específico de um vídeo
existente, **nunca regerar a cena inteira**. Regerar troca a pessoa, a luz e o
enquadramento junto com o defeito — e cria um frame que não casa com os
vizinhos.

## Estratégia

**FRAME EXATO → IDENTIFICAR O PROBLEMA → PRESERVAR TUDO → MODIFICAR SÓ O PROBLEMA**

O prompt de edição precisa declarar explicitamente o que permanece intocado.
A lista de preservação é mais longa que a instrução de mudança — isso é
esperado e correto.

## Lista de preservação padrão

Citar no prompt, removendo apenas o item que de fato vai mudar:

```
Preserve the woman's identity, facial structure, facial proportions, apparent
age, expression, pose, camera angle, framing, composition, hair, makeup,
clothing, jewelry, the product and its packaging, the lighting direction and
intensity, the background, and the photographic finish.
```

## Correções mais comuns

**Pele lisa / plástica** (o defeito mais frequente)
```
Edit this exact frame while preserving the woman's identity, facial
structure, expression, pose, camera angle, composition, clothing, jewelry,
product, lighting and background. Modify only the skin texture: restore
realistic pores with varied sizes, fine peach fuzz, subtle tonal variation,
mild natural redness and authentic skin texture. Do not change facial
proportions, do not beautify, do not smooth.
```

**Líquido opaco**
```
...Modify only the serum: make it translucent so the pores and freckles stay
visible through it, give its edge a feathered irregular boundary where it
meets the skin, and let the trail thin as it descends. Do not change the
skin, the hand position or the lighting.
```

**Mão/dedos deformados**
```
...Modify only the hand: correct it to an anatomically plausible hand with
five fingers in the same position and pose. Do not change the wrist angle,
the object being held, or anything else in the frame.
```

## Consistência com os frames vizinhos

Ao editar um frame extraído de um vídeo, a referência de correção não é o
"ideal" — são os frames imediatamente anterior e posterior. O frame editado
precisa ser:

**A MESMA PESSOA + O MESMO MOMENTO + A MESMA CÂMERA + A MESMA LUZ**

Só o defeito pedido muda. Na prática:
1. Extrair também o frame anterior e o posterior (`ffmpeg`) e olhar os três.
2. Conferir no resultado: tom de pele, direção da luz, posição da mão e
   enquadramento continuam batendo com os vizinhos?
3. Se o frame editado ficou mais nítido/limpo que os vizinhos, ele vai
   "pular" no vídeo — pedir para casar o acabamento:
   `match the grain, softness and colour of the surrounding footage`.

## Nunca permitir que a edição altere

identidade · proporções faciais · idade · expressão · cabelo · maquiagem ·
roupa · iluminação · ângulo de câmera · produto · composição

Se a edição mudar qualquer um desses, descartar e refazer com a lista de
preservação mais explícita — não aceitar "quase igual".
