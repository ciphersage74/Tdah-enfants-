#!/usr/bin/env python3
"""
Génère automatiquement les 280 layers d'accessoires pour FocusHéros.

Usage:
  pip install openai requests
  OPENAI_API_KEY=sk-... python scripts/generate_items.py

Coût estimé : ~12-15€ pour les 280 images
Le script reprend là où il s'est arrêté si tu le relances.
"""

import os
import time
import base64
import requests
from pathlib import Path
from openai import OpenAI

client = OpenAI(api_key=os.environ.get("OPENAI_API_KEY"))

# ── Personnages ──────────────────────────────────────────────────────────────
CHARACTERS = [
    'superhero', 'dragon', 'ninja', 'astronaut',
    'princess', 'fairy', 'mermaid', 'witch',
]

# ── Items : (id_fichier, description_en, position_en) ───────────────────────
ITEMS = [
    # Chapeaux
    ('hat_party',       'colorful cone-shaped birthday party hat with confetti',    'floating just above the head'),
    ('hat_cowboy',      'wide-brim brown cowboy hat',                               'sitting on top of the head'),
    ('hat_tophat',      'tall black magician top hat',                              'sitting on top of the head'),
    ('hat_crown',       'shiny golden royal crown with colorful gems',              'sitting on top of the head'),
    ('hat_graduation',  'black graduation mortarboard cap with golden tassel',      'sitting on top of the head'),
    ('hat_helm',        'silver medieval knight helmet with visor',                 'sitting on top of the head'),
    ('hat_witch',       'tall purple pointy witch hat with stars on it',            'sitting on top of the head'),
    ('hat_tiara',       'delicate pink princess tiara with diamonds',               'sitting on top of the head'),
    ('hat_santa',       'red Santa hat with white fluffy trim and white pompom',    'sitting on top of the head'),
    # Armes
    ('weapon_wand',      'magic wand with glowing star tip and sparkles',           'held in the right hand'),
    ('weapon_shield',    'blue and gold knight shield with a star emblem',          'held in the left hand'),
    ('weapon_sword',     'shiny silver sword with golden hilt and guard',           'held in the right hand'),
    ('weapon_bow',       'elegant curved wooden elven bow with taut string',        'held in both hands in front'),
    ('weapon_axe',       'viking battle axe with wooden handle and sharp blade',    'held in the right hand'),
    ('weapon_trident',   'shiny golden three-pronged trident',                      'held in the right hand'),
    ('weapon_lightsaber','glowing blue lightsaber energy sword with black handle',  'held in the right hand'),
    # Magie
    ('magic_sparkles',  'golden sparkles and glowing star particles aura',          'floating all around the body'),
    ('magic_lightning', 'bright yellow cartoon lightning bolt',                     'crackling in the right hand'),
    ('magic_fire',      'orange and red cartoon flames',                            'burning in the right hand'),
    ('magic_moon',      'yellow crescent moon with a cute smiling face',            'floating above the head'),
    ('magic_comet',     'glowing white and yellow comet with fiery orange tail',    'streaking above the character'),
    ('magic_rainbow',   'colorful rainbow arc with a small cloud on each end',      'arching above the character'),
    ('magic_star_gold', 'large shiny golden 5-pointed star with glow effect',      'floating above the head'),
    ('magic_gem',       'large blue diamond gem with sparkle light reflections',    'floating above the head'),
    ('magic_galaxy',    'swirling purple blue pink galaxy nebula glow aura',        'surrounding the whole character'),
    # Compagnons
    ('companion_cat',       'cute chibi orange tabby cat sitting upright',          'sitting close on the left side'),
    ('companion_rabbit',    'cute chibi white rabbit with long ears, pink nose',    'sitting close on the left side'),
    ('companion_butterfly', 'colorful chibi butterfly with large open wings',       'hovering on the left side'),
    ('companion_fox',       'cute chibi orange fox with big ears and fluffy tail',  'sitting close on the left side'),
    ('companion_owl',       'cute chibi brown owl with big round eyes',             'perched on the left shoulder area'),
    ('companion_eagle',     'chibi golden eagle with wings spread wide',            'flying just above on the left'),
    ('companion_wolf',      'cute chibi gray wolf with pointed ears fluffy tail',   'sitting close on the left side'),
    ('companion_phoenix',   'chibi phoenix bird with red orange golden feathers',   'flying on the left side'),
    ('companion_dragon',    'tiny cute chibi green dragon with small wings',        'sitting close on the left side'),
    ('companion_unicorn',   'cute chibi white unicorn with rainbow mane and horn',  'standing close on the left side'),
]

# ── Descriptions des persos pour aider DALL-E à maintenir le style ───────────
CHAR_STYLE = {
    'superhero': 'blue and red chibi superhero with cape and mask',
    'dragon':    'red chibi dragon character with wings',
    'ninja':     'black and red chibi ninja with headband',
    'astronaut': 'teal and white chibi astronaut with space helmet',
    'princess':  'pink chibi princess with crown and dress',
    'fairy':     'purple chibi fairy with wings',
    'mermaid':   'teal chibi mermaid with fish tail',
    'witch':     'purple chibi witch with hat and wand',
}


def generate_item(char_id: str, item_id: str, item_desc: str, position: str) -> None:
    out_path = Path(f"assets/items/{char_id}/{item_id}.png")
    if out_path.exists():
        print(f"  ✓ déjà fait  {out_path}")
        return

    out_path.parent.mkdir(parents=True, exist_ok=True)
    char_style = CHAR_STYLE[char_id]

    prompt = (
        f"Chibi cartoon illustration, transparent background PNG, 400x400 canvas. "
        f"Draw ONLY a {item_desc} {position} of a {char_style} character. "
        f"The item must match the chibi cartoon art style. "
        f"Do NOT draw the character body — only the {item_desc.split()[0]}. "
        f"Completely transparent background. The item should be large and clearly visible, minimum 150px wide."
    )

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
            img_url = response.data[0].url
            img_bytes = requests.get(img_url, timeout=30).content
            out_path.write_bytes(img_bytes)
            print(f"  ✓ généré     {out_path}")
            return
        except Exception as e:
            wait = (attempt + 1) * 5
            print(f"  ✗ erreur ({e}) — retry dans {wait}s")
            time.sleep(wait)

    print(f"  ✗ ÉCHEC définitif pour {out_path}")


def main():
    if not os.environ.get("OPENAI_API_KEY"):
        print("❌ Erreur : variable OPENAI_API_KEY manquante.")
        print("   Lance avec : OPENAI_API_KEY=sk-... python scripts/generate_items.py")
        return

    total = len(CHARACTERS) * len(ITEMS)
    done  = sum(
        1 for c in CHARACTERS for (item_id, _, _) in ITEMS
        if Path(f"assets/items/{c}/{item_id}.png").exists()
    )
    print(f"\n🎨 FocusHéros — Générateur d'items")
    print(f"   {done}/{total} images déjà générées")
    print(f"   Coût estimé pour les {total - done} restantes : ~{(total - done) * 0.04:.0f}€\n")

    for char in CHARACTERS:
        print(f"\n{'─'*45}")
        print(f"  Personnage : {char.upper()}")
        print(f"{'─'*45}")
        for item_id, item_desc, position in ITEMS:
            generate_item(char, item_id, item_desc, position)
            time.sleep(2)  # respecte le rate limit OpenAI (50 img/min)

    print("\n✅ Terminé ! Copie le dossier assets/items/ dans ton projet React Native.")


if __name__ == "__main__":
    main()
