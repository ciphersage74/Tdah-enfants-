#!/usr/bin/env python3
"""
Génère les 35 layers d'accessoires pour FocusHéros.
Les items sont générés UNE FOIS sur un gabarit standard 400x400.
Le code React Native applique un offset par perso pour le positionnement.

Usage:
  pip install openai requests
  OPENAI_API_KEY=sk-... python scripts/generate_items.py

Coût : ~35 images × 0.04€ = ~1.50€ seulement
Durée : ~5 minutes
"""

import os, time, requests
from pathlib import Path
from openai import OpenAI

client = OpenAI(api_key=os.environ.get("OPENAI_API_KEY"))

# Gabarit standard auquel tous les persos doivent être calibrés :
#   - Centre de la tête  : x=200, y=120
#   - Bas du chapeau     : x=200, y=185
#   - Main droite        : x=300, y=285
#   - Côté gauche (compagnon) : x=80,  y=260

ITEMS = [
    # (id, description, position sur gabarit 400x400)

    # ── Chapeaux ─────────────────────────────────────────────────────────────
    # Position : centrés horizontalement, bas du chapeau vers y=185
    ('hat_party',
     'colorful cone-shaped birthday party hat with confetti pattern',
     'centered horizontally, hat brim at y=185, hat top near y=40 of a 400x400 canvas'),

    ('hat_cowboy',
     'wide-brim brown cowboy hat',
     'centered horizontally, hat brim at y=185, hat top near y=60 of a 400x400 canvas'),

    ('hat_tophat',
     'tall black magician top hat',
     'centered horizontally, hat brim at y=190, hat top near y=30 of a 400x400 canvas'),

    ('hat_crown',
     'shiny golden royal crown with colorful gems',
     'centered horizontally, crown bottom at y=185, crown top near y=100 of a 400x400 canvas'),

    ('hat_graduation',
     'black graduation mortarboard cap with golden tassel',
     'centered horizontally, cap brim at y=185, cap top near y=80 of a 400x400 canvas'),

    ('hat_helm',
     'silver medieval knight helmet with visor',
     'centered horizontally, helmet bottom at y=200, helmet top near y=50 of a 400x400 canvas'),

    ('hat_witch',
     'tall purple pointy witch hat with stars and moon decorations',
     'centered horizontally, hat brim at y=185, hat tip near y=10 of a 400x400 canvas'),

    ('hat_tiara',
     'delicate pink princess tiara with diamonds and gems',
     'centered horizontally, tiara bottom at y=180, tiara top near y=120 of a 400x400 canvas'),

    ('hat_santa',
     'red Santa hat with white fluffy trim and white pompom',
     'centered horizontally, hat brim at y=185, hat tip near y=40 of a 400x400 canvas'),

    # ── Armes ────────────────────────────────────────────────────────────────
    # Position : dans le coin bas-droit, poignée vers x=300 y=285
    ('weapon_wand',
     'magic wand with glowing star tip and sparkles around it',
     'angled 30 degrees, handle at x=300 y=300, star tip toward x=200 y=150 of a 400x400 canvas'),

    ('weapon_shield',
     'blue and gold knight shield with a star emblem',
     'centered around x=260 y=260, about 150px tall, in a 400x400 canvas'),

    ('weapon_sword',
     'shiny silver sword with golden hilt and cross-guard',
     'angled 30 degrees, hilt at x=300 y=300, blade tip toward x=160 y=120 of a 400x400 canvas'),

    ('weapon_bow',
     'elegant curved wooden elven bow with taut string',
     'vertical, centered around x=300 y=220, spanning from y=80 to y=360 of a 400x400 canvas'),

    ('weapon_axe',
     'viking battle axe with wooden handle and sharp curved blade',
     'angled 30 degrees, handle base at x=310 y=310, axe head toward x=190 y=150 of a 400x400 canvas'),

    ('weapon_trident',
     'shiny golden three-pronged trident',
     'vertical, centered around x=300 y=200, spanning from y=40 to y=370 of a 400x400 canvas'),

    ('weapon_lightsaber',
     'glowing blue energy lightsaber blade with black cylindrical handle',
     'angled 30 degrees, handle at x=300 y=310, blade tip toward x=150 y=100 of a 400x400 canvas'),

    # ── Magie ────────────────────────────────────────────────────────────────
    ('magic_sparkles',
     'golden sparkles and glowing star particles scattered like an aura',
     'spread across the upper half of a 400x400 canvas, mostly between y=40 and y=220'),

    ('magic_lightning',
     'bright yellow cartoon lightning bolt with energy crackles',
     'in the bottom-right area, centered around x=300 y=270 of a 400x400 canvas'),

    ('magic_fire',
     'orange and red cartoon flames, 3 flame tongues',
     'in the bottom-right area, flame base around x=295 y=320 of a 400x400 canvas'),

    ('magic_moon',
     'yellow crescent moon with a cute smiling face',
     'centered horizontally, centered around x=200 y=100 of a 400x400 canvas'),

    ('magic_comet',
     'glowing white and yellow comet with long orange fiery tail',
     'diagonal from bottom-left to top-right, comet head around x=250 y=80 of a 400x400 canvas'),

    ('magic_rainbow',
     'colorful rainbow arc with a small fluffy cloud on each end',
     'spanning the top of the canvas from x=20 to x=380, peak around y=50 of a 400x400 canvas'),

    ('magic_star_gold',
     'large shiny golden 5-pointed star with bright glow',
     'centered horizontally around x=200 y=90 of a 400x400 canvas'),

    ('magic_gem',
     'large blue diamond gem with sparkle light reflections',
     'centered horizontally around x=200 y=90 of a 400x400 canvas'),

    ('magic_galaxy',
     'swirling purple blue and pink galaxy nebula glow, semi-transparent edges',
     'filling the upper 60% of a 400x400 canvas, center around x=200 y=160'),

    # ── Compagnons ───────────────────────────────────────────────────────────
    # Position : côté gauche, centré autour de x=80 y=270
    ('companion_cat',
     'cute chibi orange tabby cat sitting upright with big eyes',
     'sitting in the bottom-left area, centered around x=85 y=270 of a 400x400 canvas'),

    ('companion_rabbit',
     'cute chibi white rabbit with long ears and pink nose sitting',
     'sitting in the bottom-left area, centered around x=85 y=260 of a 400x400 canvas'),

    ('companion_butterfly',
     'colorful chibi butterfly with large open wings, pink and yellow',
     'hovering in the left area, centered around x=80 y=230 of a 400x400 canvas'),

    ('companion_fox',
     'cute chibi orange fox with big ears and fluffy tail sitting',
     'sitting in the bottom-left area, centered around x=85 y=270 of a 400x400 canvas'),

    ('companion_owl',
     'cute chibi brown owl with big round eyes sitting upright',
     'sitting in the left area, centered around x=80 y=240 of a 400x400 canvas'),

    ('companion_eagle',
     'chibi golden eagle with wings spread wide',
     'flying in the upper-left area, centered around x=85 y=180 of a 400x400 canvas'),

    ('companion_wolf',
     'cute chibi gray wolf with pointed ears and fluffy tail sitting',
     'sitting in the bottom-left area, centered around x=85 y=275 of a 400x400 canvas'),

    ('companion_phoenix',
     'chibi phoenix bird with red orange and golden feathers, wings spread',
     'flying in the left area, centered around x=85 y=220 of a 400x400 canvas'),

    ('companion_dragon',
     'tiny cute chibi green dragon with small wings sitting',
     'sitting in the bottom-left area, centered around x=85 y=270 of a 400x400 canvas'),

    ('companion_unicorn',
     'cute chibi white unicorn with rainbow mane and golden horn',
     'standing in the bottom-left area, centered around x=85 y=265 of a 400x400 canvas'),
]

BASE_PROMPT = (
    "Chibi cartoon illustration style. "
    "Transparent background PNG, 400x400 pixels canvas. "
    "Draw ONLY the item described — NO character body, NO background, NO shadow. "
    "The item must be large and clearly visible (minimum 140px). "
    "Item description and position: {desc}, {position}."
)


def generate_item(item_id: str, desc: str, position: str) -> None:
    out_path = Path(f"assets/items/{item_id}.png")
    if out_path.exists():
        print(f"  ✓ déjà fait  {item_id}.png")
        return

    out_path.parent.mkdir(parents=True, exist_ok=True)
    prompt = BASE_PROMPT.format(desc=desc, position=position)

    for attempt in range(3):
        try:
            response = client.images.generate(
                model="dall-e-3",
                prompt=prompt,
                size="1024x1024",
                quality="standard",
                response_format="url",
                n=1,
            )
            img_bytes = requests.get(response.data[0].url, timeout=30).content
            out_path.write_bytes(img_bytes)
            print(f"  ✓ généré     {item_id}.png")
            return
        except Exception as e:
            wait = (attempt + 1) * 5
            print(f"  ✗ erreur ({e}) — retry dans {wait}s")
            time.sleep(wait)

    print(f"  ✗ ÉCHEC {item_id}.png")


def main():
    if not os.environ.get("OPENAI_API_KEY"):
        print("❌  OPENAI_API_KEY manquante.")
        print("    Lance : OPENAI_API_KEY=sk-... python scripts/generate_items.py")
        return

    already = sum(1 for (item_id, _, _) in ITEMS if Path(f"assets/items/{item_id}.png").exists())
    remaining = len(ITEMS) - already
    print(f"\n🎨 FocusHéros — Générateur d'items")
    print(f"   {already}/{len(ITEMS)} items déjà générés")
    print(f"   Coût estimé : ~{remaining * 0.04:.2f}€  ({remaining} images restantes)\n")

    for item_id, desc, position in ITEMS:
        print(f"→ {item_id}")
        generate_item(item_id, desc, position)
        time.sleep(2)

    print(f"\n✅ Terminé ! {len(ITEMS)} items dans assets/items/")
    print("   Lance un build puis ajuste les AVATAR_ANCHORS dans colors.js si besoin.")


if __name__ == "__main__":
    main()
