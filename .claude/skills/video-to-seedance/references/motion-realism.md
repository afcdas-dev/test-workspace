# Sistema de movimento realista

Movimento é onde o UGC gerado mais falha. A regra que governa tudo abaixo:

> **Nunca escrever "natural movement", "realistic movement" ou "smooth
> movement".** Essas frases não informam nada ao modelo. Descrever o
> comportamento físico concreto.

## 1. Movimento humano

O corpo humano em repouso não fica parado nem se mexe o tempo todo. Incluir:

- micro-movimentos involuntários
- pausas naturais entre ações
- respiração visível (ombros, peito)
- piscadas
- pequenos ajustes de postura
- correções mínimas de cabeça
- movimento sutil dos olhos (não fixo na lente o tempo todo)
- transferência leve de peso
- trajetórias de mão imperfeitas
- pequenos ajustes de punho
- reposicionamento de dedos
- variação de velocidade dentro do mesmo gesto
- variação de trajetória entre repetições
- inércia, gravidade, atrito e peso crível dos objetos

Vocabulário utilizável:
- `she breathes normally, her shoulders rising slightly`
- `one unhurried blink, not perfectly timed`
- `a small involuntary head correction, a few degrees`
- `her weight shifts slightly onto one hip`
- `her wrist makes a tiny adjustment mid-motion`

## 2. Regra da imobilidade (obrigatória em todo prompt)

Incluir literalmente em todos os prompts de vídeo:

```
Do not continuously animate the character. Allow natural pauses and moments
of near-stillness between actions.
```

Pessoas reais não movem tudo o tempo todo. Preencher a duração com movimento
é o erro que mais transforma UGC em propaganda. **Imobilidade é conteúdo.**

Nunca adicionar movimento só para ocupar o tempo do clipe. Se sobrar duração,
a personagem fica quase parada — respirando e piscando.

## 3. Mãos — decomposição obrigatória

Nunca escrever `she smoothly applies the serum`. Toda ação de mão se decompõe
em seis fases:

**APPROACH → HESITATION → CONTACT → PRESSURE → ADJUSTMENT → RELEASE**

Modelo de redação:

```
Her fingertips approach the cheek slowly, decelerate slightly before contact,
touch the skin lightly, pause for a fraction of a second, then begin small
irregular circular motions with subtle variations in pressure and speed,
repositioning her fingers once before lifting her hand away unhurriedly.
```

Evitar:
- trajetórias perfeitamente suaves
- movimentos perfeitamente simétricos
- gestos robóticos repetidos
- círculos idênticos
- velocidade constante
- movimento exagerado de dedos

Imperfeições pequenas são desejáveis: o dedo que escorrega um pouco, o
reposicionamento a meio caminho, a pressão que varia.

## 4. Micro-movimento facial

O rosto não pode parecer congelado nem hiperativo. Usar sutilmente:
- piscadas (irregulares, não ritmadas)
- respiração
- pequenos desvios de olhar
- reações faciais mínimas
- relaxamento leve da mandíbula
- ajustes pequenos de cabeça
- mudança sutil de expressão

Evitar: sorriso constante, sobrancelha dramática, expressões exageradas,
contato visual antinatural (encarar sem piscar), rosto congelado, piscada
repetitiva em loop.

Vocabulário:
- `her expression settles rather than performs`
- `she looks at the product, then briefly back toward the lens`
- `her jaw relaxes slightly between movements`

## 5. Câmera — celular na mão, não gimbal

A câmera é um iPhone segurado por uma pessoa. Deve conter:
- micro-tremor de mão contínuo e sutil
- pequenas correções de enquadramento
- deriva leve e natural
- mudanças mínimas de posição
- inércia real (a câmera "alcança" o movimento com atraso)
- comportamento de foco/exposição quando fizer sentido
  (`the focus hunts for a beat before locking`)

Evitar: trajetória perfeitamente suave, câmera flutuante, dolly dramático,
tremor excessivo, zoom artificial, movimento cinematográfico.

O operador precisa parecer humano — inclusive um pouco desatento.

## 6. Física

Todo movimento respeita o mundo real: gravidade, inércia, atrito, peso do
objeto, contato com a pele, anatomia da mão, limites das articulações,
comportamento de líquido, tensão superficial, movimento de cabelo e de tecido.

**Líquidos** (ver também `ugc-style-guide.md` §3.1 e §3.2, que trazem o
diagnóstico empírico dos outputs reais):
- a gota se FORMA, ESTICA, DESTACA e CAI segundo viscosidade e gravidade
- ao tocar a pele, molha a superfície — escurece levemente onde espalha
- o rastro afina conforme desce e pode se dividir em filetes
- é translúcido: poros e sardas permanecem visíveis através dele
- absorve, virando brilho — não permanece fita molhada
- nunca se comporta como gráfico animado

**Cabelo**: fios soltos respondem com atraso ao movimento da cabeça.
**Tecido**: roupão felpudo amassa e volta devagar; cetim desliza e reflete.

## 7. Variação de movimento

Repetição idêntica é assinatura de IA. Em qualquer gesto repetido, variar:
trajetória, velocidade, pressão, amplitude — e inserir micro-pausas.

Em vez de:
> `She makes three identical circular motions.`

Escrever:
> `She makes several small circular motions with subtle variation in size and
> speed, occasionally changing pressure and slightly repositioning her
> fingertips.`

## 8. Autenticidade UGC

O resultado precisa parecer **uma pessoa real se gravando casualmente no
iPhone**, não uma atriz performando num comercial de beleza.

A personagem não pode parecer executar conscientemente cada movimento. Permitir
— e descrever explicitamente:
- pequenas hesitações
- timing imperfeito (a ação não começa no tempo "certo")
- assimetria leve
- pausas
- micro-ajustes
- postura casual, não composta
- imperfeições sutis

Vocabulário:
- `she is not performing for the camera; the movement looks incidental`
- `her timing is slightly off, as if she is not thinking about being filmed`
- `casual posture, one shoulder slightly lower than the other`

Autenticidade vale mais que perfeição visual. Entre um take tecnicamente
impecável e um take com um pequeno defeito humano, o segundo vende melhor.
