# Seedance 2.0 — Recriação do vídeo `kling_20260816_VIDEO_A_highly_r_773_0.mp4`

## Ficha técnica do vídeo original
| Propriedade | Valor |
|---|---|
| Duração | 5,04 s |
| Resolução | 1076 × 1924 (vertical 9:16) |
| Frame rate | 24 fps |
| Estrutura | 1 take contínuo, sem cortes |
| Áudio | Trilha presente (não analisada a partir dos frames) |
| Origem | Gerado por KlingAI 3.0 (marca d'água no canto) |

## Análise frame a frame (resumo)
- **0.0–1.5s** — Mulher jovem negra, pele com sardas naturais e sem maquiagem,
  rabo de cavalo alto e liso caindo sobre o ombro esquerdo, roupão felpudo
  rosa-claro, colar dourado fino com pingente de nome. Segura um frasco pump
  branco e azul de CeraVe Hydrating Hyaluronic Acid Serum ao lado do rosto,
  rótulo para a câmera. Sorriso suave de lábios fechados, olhar direto na
  lente. Fundo: quarto aconchegante, parede bege, cortina cinza de ilhós à
  direita, cama desfocada atrás.
- **1.5–3.0s** — Micro-movimentos naturais: ela inclina levemente a cabeça,
  ajusta o frasco. Câmera com leve drift de mão (estilo selfie/tripé caseiro).
- **3.0–5.0s** — Câmera desliza sutilmente para a esquerda/abre um pouco,
  revelando um quadro de moldura de madeira na parede. Ela dá uma piscada
  lenta e aproxima o frasco alguns centímetros da câmera, apresentando o
  produto; o sorriso se mantém.

---

## 1. MASTER PROMPT (texto-para-vídeo, colar direto no Seedance 2.0)

```
Authentic handheld UGC skincare video, vertical 9:16. A young Black woman in
her early twenties with natural freckled skin and no makeup, sleek black hair
pulled into a high ponytail draping over her left shoulder, wearing a plush
light-pink fluffy bathrobe and a thin gold nameplate necklace. She sits
chest-up facing the camera in a cozy bedroom: warm beige walls, grey eyelet
blackout curtains on the right, a softly blurred bed behind her. Soft diffused
daylight, warm neutral tones.

[Shot 1] She holds a white-and-blue pump serum bottle upright beside her
cheek, label facing the camera, giving a gentle closed-lip smile and looking
straight into the lens. Subtle handheld micro-shake, static selfie framing.

[Shot 2] The camera drifts slowly to the left and widens slightly, revealing a
wooden picture frame on the wall; she tilts her head a touch, blinks slowly
and naturally, and moves the bottle a few centimeters toward the camera to
present it, keeping her soft smile and eye contact.

Realistic skin texture with visible pores and freckles, natural motion,
smartphone-camera look, shallow depth of field on the background, cozy
morning-routine atmosphere. Duration 5 seconds, 24 fps, aspect ratio 9:16.
```

> Se quiser o produto idêntico ao original, acrescente: "the bottle is a
> CeraVe Hydrating Hyaluronic Acid Serum pump bottle with a transparent cap".
> Para um vídeo publicável sem marca registrada, troque por:
> "a generic white skincare pump bottle with a blue diagonal label".

---

## 2. PROMPT IMAGE-TO-VIDEO (modo recomendado — máxima fidelidade)

- **Imagem de referência (first frame):** `reference_frames/first_frame.png`
- **Duração alvo:** 5 s · **Proporção:** 9:16

```
The scene continues naturally from the reference image. The woman holds the
serum bottle steady beside her cheek and smiles softly at the camera with
natural micro-movements of her head. The handheld camera drifts slowly to the
left and widens slightly, revealing a wooden picture frame on the wall. She
blinks slowly once, then moves the bottle a few centimeters closer to the
camera to present the label, keeping eye contact and her gentle closed-lip
smile. Realistic skin texture, soft diffused daylight, authentic smartphone
UGC look, subtle handheld micro-shake throughout.
```

---

## 3. NOTAS DE MONTAGEM
- Vídeo de take único: **não precisa montar** — uma única geração de 5 s resolve.
- Se o Seedance gerar mais que 5 s, corte para 5,0 s mantendo o início.
- O original tem trilha de áudio; os frames não revelam fala (lábios fechados
  o tempo todo — provavelmente música/voice-over). Adicione voice-over ou
  música suave de "morning routine" na edição.
- Não recriar a marca d'água "KlingAI 3.0" do original.

## Dicas específicas do Seedance
- Use o **modo image-to-video** com `first_frame.png` — garante identidade da
  pessoa, do produto e do cenário em uma tacada.
- O movimento de câmera está explícito ("drifts slowly to the left and widens
  slightly") — sem isso o Seedance tende a deixar a câmera travada.
- Evite negativas; tudo está descrito afirmativamente.
