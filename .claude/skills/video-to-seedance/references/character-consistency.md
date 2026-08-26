# Sistema de consistência de personagem

A mesma pessoa precisa atravessar todos os shots sem deriva. Identidade
inconsistente é o artefato que mais rápido destrói a credibilidade de um UGC:
o espectador não sabe nomear o que houve, mas sente que "mudou de pessoa".

## 1. O que precisa ser idêntico entre shots

Lista de travamento — citar explicitamente no prompt sempre que houver mais de
um shot com a mesma pessoa:

| Atributo | Como travar no prompt |
|---|---|
| Identidade | `the exact same woman as in the reference image` |
| Estrutura facial | `identical facial structure, same bone structure and face shape` |
| Proporções corporais | `identical body proportions and height` |
| Tom de pele | `identical skin tone` |
| Textura de pele | `identical skin texture, same pores and freckle pattern` |
| Cabelo | `identical hair — same colour, length, parting and style` |
| Roupa | `identical clothing, same garment and fit` |
| Acessórios | `identical accessories — same earrings, rings, necklace` |
| Idade | `same apparent age, no age change` |
| Maquiagem | `identical makeup level` |
| Acabamento fotográfico | `identical photographic finish, same lens character and grain` |

Regra: quando um shot novo reutiliza a personagem, o prompt abre com a
referência e a lista de travamento ANTES de descrever a ação.

## 2. Character sheet de 3 painéis (DNA visual)

Sempre que possível, gere primeiro uma folha de personagem e use-a como
referência de imagem em todos os shots. É o método mais confiável de manter
identidade — mais do que qualquer descrição textual.

### Prompt da folha (gerar como IMAGEM, não vídeo)

```
A single wide frame containing three equal panels side by side, flat 18%
neutral grey seamless background, soft completely even studio lighting, no
cast shadows, no dramatic lighting, no environmental elements.

The three panels depict the EXACT SAME PERSON with identical identity,
facial structure, body proportions, skin tone, skin texture, hair, clothing,
accessories, scale and visual finish.

Panel 1 — full-body front view: the complete body visible from head to feet,
neutral relaxed pose, arms at her sides, complete headroom, nothing cropped.

Panel 2 — full-body rear view: the same exact person from behind, same scale
and proportions, head attached and fully visible, neutral relaxed pose.

Panel 3 — tight facial close-up: front-facing or subtle three-quarter angle,
showing realistic skin texture with visible pores, fine peach fuzz and
natural tonal variation.

[INSERIR AQUI a descrição da personagem: idade, etnia, cabelo, roupa,
acessórios, características de pele — ver §3 abaixo]

No identity drift between panels. No age changes. No facial restructuring.
No beautification. No smoothing. Same person, three views.
```

### Regras da folha
- Fundo cinza neutro 18% e luz chapada existem para não contaminar os shots
  seguintes com iluminação ou cenário.
- Os três painéis na MESMA imagem (não três imagens separadas) — é isso que
  força o modelo a manter escala e identidade.
- Se o painel 3 sair com pele lisa demais, regere a folha inteira; não tente
  corrigir só o rosto (quebra a consistência com os outros painéis).

## 3. Descrição da personagem (preencher antes de gerar a folha)

Ser específico e concreto. Vago produz deriva. Cobrir:

- Idade aparente com faixa estreita: `a woman in her late twenties` (não
  "young woman")
- Etnia e tom de pele
- Formato de rosto e traços marcantes: `oval face, slightly asymmetric
  eyebrows, a small mole below the left cheekbone`
- Cabelo: cor, comprimento, textura, repartição, penteado
- Pele: seguir o vocabulário do `ugc-style-guide.md` §2
- Roupa completa e acessórios (esses reaparecem em todo shot)
- Uma ou duas assimetrias/imperfeições — são âncoras de identidade e as
  melhores defesas contra "face morphing"

## 4. Uso da folha nos shots

1. Gere a folha como imagem.
2. Confirme visualmente que os três painéis são a mesma pessoa (se não forem,
   regere — não siga com folha ruim).
3. Use a folha como imagem de referência no gerador de vídeo, ou recorte o
   painel 3 como primeiro frame no modo image-to-video.
4. No prompt de cada shot, abra com a lista de travamento (§1).

Sem folha (só texto), repetir a MESMA descrição literal da personagem em todos
os prompts, palavra por palavra — variar a redação produz variação de rosto.

## 5. Ordem de prioridade quando há conflito

Se o pedido do usuário conflitar com a consistência (ex.: "muda a roupa nesse
shot"), a consistência de IDENTIDADE (rosto, corpo, pele, idade) nunca cede;
roupa e acessórios podem mudar se o usuário pedir, e a mudança deve ser
declarada explicitamente para o modelo não interpretar como licença geral:
`same woman, identical face and skin; only the top changes to X`.
