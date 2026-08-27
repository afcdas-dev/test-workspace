---
name: video-to-seedance
description: Sistema completo de UGC de skincare hiper-realista para geradores de vídeo (Google Flow, Seedance 2.0, Kling, Veo). Gera prompts de vídeo, folhas de personagem para consistência entre shots, e prompts de correção de frame. Usar quando o usuário anexar um vídeo pedindo prompts, pedir para recriar um vídeo, pedir um prompt UGC de skincare/beleza, pedir consistência de personagem entre cenas, ou pedir para corrigir um frame gerado (pele plástica, mão deformada, líquido artificial).
---

# video-to-seedance

Sistema para produzir UGC de skincare que pareça **gravado num iPhone por uma
pessoa real**, não uma propaganda polida gerada por IA.

## Leitura obrigatória

Antes de escrever qualquer prompt, ler os arquivos em `references/` que a
tarefa exigir:

| Arquivo | Quando |
|---|---|
| `ugc-style-guide.md` | **Sempre.** Vocabulário de pele, produto-na-pele, luz, cenário, anti-padrões — destilado de 15 vídeos reais e validado contra outputs de produção. |
| `motion-realism.md` | **Sempre que houver vídeo.** Movimento humano, mãos, rosto, câmera, física, imobilidade. |
| `prompt-structure.md` | **Sempre que houver vídeo.** Blocos do prompt, timeline de beats, restrições negativas, prevenção de artefatos. |
| `character-consistency.md` | Personagem que aparece em mais de um shot, ou pedido de folha de personagem. |
| `frame-editing.md` | Correção de um frame específico. |
| `analises/` | Consulta: fichas dos vídeos de referência reais. |

## Regra de geração (nunca pular)

Ao receber um conceito, imagem, referência ou frame problemático, **não
produzir de imediato um prompt genérico**. Determinar internamente primeiro:
identidade, câmera, ação principal, micro-movimentos, interação de mão,
movimento facial, física dos objetos, **o que permanece parado**, requisitos
de pele, pontos prováveis de falha da IA, restrições negativas. Só então
escrever o prompt final. Detalhes em `prompt-structure.md` §5.

## Modos

### A — Recriar um vídeo anexado
1. **Extração** (instalar ffmpeg via apt se ausente):
   - `ffprobe`: duração, resolução, fps, proporção, áudio.
   - Cenas: `ffmpeg -i in.mp4 -vf "select='gt(scene,0.25)',showinfo" -vsync vfr reference_frames/scene_%02d.png`
   - Amostragem: ~1 frame a cada 3–5s, mínimo 4, máximo ~8 por vídeo.
   - Salvar o primeiro frame como `reference_frames/first_frame.png`.
2. **Análise**: por cena — sujeito, ação, produto e como interage com a pele,
   enquadramento, movimento de câmera, luz, cenário, figurino/unhas/joias,
   textura de pele, legendas. Texto invertido = vídeo espelhado (registrar;
   não recriar marcas d'água nem legendas). Verificar layout empilhado.
3. **Saída**: arquivo `seedance_prompts.md` com ficha técnica, análise por
   cena com timestamps, prompt image-to-video por cena referenciando o frame
   extraído, e notas de montagem. Enviar o `.md` e os frames ao usuário.

### B — Prompt de vídeo do zero
Perguntar ou inferir: produto, formato (hook/demo/CTA), idioma das legendas.
Aplicar a regra de geração, montar com os blocos de `prompt-structure.md` e
entregar no **formato de saída de vídeo** (abaixo).

### C — Corrigir um frame gerado
Seguir `frame-editing.md`. Entregar no **formato de saída de edição** (abaixo).

### D — Folha de personagem
Seguir `character-consistency.md` §2. Entregar o prompt da folha de 3 painéis
e, em seguida, a lista de travamento a ser colada nos prompts dos shots.

## Formatos de saída

### Prompt de vídeo
```
CONCEITO           uma frase descrevendo a cena
CAMERA             comportamento e enquadramento
CHARACTER          personagem e instruções de identidade
MOVEMENT           ação principal + micro-movimentos
TIMELINE           beats temporais precisos (o que move / como / por que / o que fica parado)
PHYSICS            objeto, líquido, cabelo, tecido — quando relevante
NEGATIVE CONSTRAINTS  o que não pode acontecer
FINAL FLOW PROMPT  um prompt consolidado, pronto para colar
```

### Correção de frame
```
DIAGNÓSTICO DO FRAME   o que está errado
O QUE PRESERVAR        tudo que deve permanecer intocado
FLOW EDIT PROMPT       prompt que muda APENAS o elemento pedido
```

Não criar variações que o usuário não pediu.

## Padrão de qualidade final

Antes de entregar, verificar: consistência de identidade · realismo de pele ·
realismo físico · movimento humano natural · câmera com comportamento de
celular · interação de mão realista · física de líquido realista ·
imobilidade apropriada · luz consistente · escala consistente · nenhum
movimento desnecessário · nenhum efeito de filtro de beleza · nenhum
polimento cinematográfico.

O vídeo final deve parecer **acidental, íntimo, crível e humano** — alguém
que de fato gravou aquele momento no celular. Nunca IA imitando comercial.

## Regras invioláveis nos prompts

- Sempre em inglês, verbos concretos, vertical 9:16 e duração declarados.
- Nunca "natural movement", "realistic movement", "smooth movement" —
  descrever o comportamento físico.
- Nunca "hyper realistic", "8k", "flawless skin".
- Nunca interpretar "pele bonita" como pele lisa: em close, preservar textura.
- Incluir sempre a regra da imobilidade (`motion-realism.md` §2).
- Legendas queimadas ficam para a edição, nunca no prompt.

## Feedback loop

Quando o usuário reportar o resultado ("pele saiu plástica", "câmera parada",
"líquido opaco"), atualizar o arquivo de referência correspondente: adicionar
o vocabulário que funcionou, mover o que falhou para os anti-padrões, e
commitar. Os arquivos de `references/` são vivos — foi assim que nasceram as
seções §3.1 e §3.2 do guia de estilo.
