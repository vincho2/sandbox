from pyfiglet import Figlet
import argparse
from random import choice

# Initialise pyfiglet
figlet = Figlet()
font_list = figlet.getFonts()

# Création du parser d'arguments
parser = argparse.ArgumentParser(description="Render text in a random or specified font")
parser.add_argument(
    "-f", "--font",
    type=str,
    help="Font to use (must be one of the available fonts)"
)

# Analyse des arguments
args = parser.parse_args()

# Choix de la font
if args.font:
    if args.font in font_list:
        figlet.setFont(font=args.font)
    else:
        print(f"Error: '{args.font}' is not a valid font.")
        exit(1)
else:
    figlet.setFont(font=choice(font_list))

# Saisie du texte et affichage
text = input("Input: ")
print(figlet.renderText(text))
