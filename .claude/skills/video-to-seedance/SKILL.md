---
name: video-to-seedance
description: Transforma vídeos UGC anexados em prompts hiper-realistas para o Seedance 2.0 (ou gera prompts UGC do zero). Usar quando o usuário anexar um vídeo pedindo prompts, pedir "recriar esse vídeo", ou pedir um prompt de vídeo UGC de skincare/beleza com pele natural.
---

# video-to-seedance

Pipeline: vídeo → frames → análise → prompts Seedance 2.0 calibrados com o
guia de estilo destilado dos vídeos de referência da agência.

## Antes de tudo

Leia `references/ugc-style-guide.md` (nesta pasta). Ele é OBRIGATÓRIO: todo
prompt gerado precisa passar no checklist da seção 11 do guia. As fichas dos
vídeos de referência estão em `references/analises/` para consulta.

## Modo A — Recriar um vídeo anexado

1. **Extração** (instalar ffmpeg via apt se ausente):
   - `ffprobe`: duração, resolução, fps, proporção, presença de áudio.
   - Cenas: `ffmpeg -i in.mp4 -vf "select='gt(scene,0.25)',showinfo" -vsync vfr reference_frames/scene_%02d.png`
   - Amostragem: ~1 frame a cada 3–5s (`fps=` calculado pela duração),
     mínimo 4, máximo ~8 frames por vídeo.
   - Salvar o primeiro frame como `reference_frames/first_frame.png`.
2. **Análise**: ler os frames em ordem. Registrar por cena: sujeito, ação,
   produto (e como interage com a pele), enquadramento, movimento de câmera,
   luz, cenário, figurino/unhas/joias, textura de pele visível, legendas.
   Atenção: vídeo com texto invertido = espelhado (registrar; não recriar
   marcas d'água/legendas). Verificar se há layout empilhado (multi-painel).
3. **Saída** — arquivo `seedance_prompts.md` contendo:
   - Ficha técnica (tabela) + análise por cena com timestamps.
   - **Master prompt** texto-para-vídeo multi-shot em inglês.
   - **Prompt image-to-video** por cena, referenciando o frame extraído
     (`the scene continues naturally from the reference image`).
   - Notas de montagem (ordem, durações, onde entram legendas/áudio).
   - Enviar o .md e o(s) frame(s) de referência ao usuário.

## Modo B — Prompt UGC do zero (sem vídeo)

Perguntar (ou inferir do pedido): produto, formato do vídeo (hook/demo/CTA),
idioma das legendas. Montar o prompt escolhendo 1 cenário validado (guia §7),
1 enquadramento-assinatura (§4), 1 luz (§5) e a estrutura de shots (§8).
Usar os exemplos few-shot do guia (§10) como molde.

## Regras de estilo (resumo do guia — o guia completo prevalece)

- Realismo = imperfeição descrita: poros, penugem, sebo, vermelhidão,
  produto escorrendo/espalhado + câmera de celular com micro-tremido.
- Proibido: "hyper realistic", "8k", "flawless skin", negativas.
- Sempre em inglês, verbos concretos, câmera explícita em todo shot,
  vertical 9:16 e duração declaradas.
- Legendas queimadas ficam para a edição, nunca no prompt.

## Feedback loop

Quando o usuário reportar o resultado do Seedance ("pele saiu plástica",
"câmera ficou parada"), atualizar `references/ugc-style-guide.md`: adicionar
o vocabulário que funcionou, mover o que falhou para os anti-padrões (§9),
e commitar a mudança. O guia é vivo.
