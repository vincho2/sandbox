#Requires AutoHotkey v2.0

deadKeyCount := 0

; Touche morte : SC027 (correspond à ';' sur QWERTY US)
SC027::
{
    global deadKeyCount
    deadKeyCount += 1
    SetTimer(resetDeadKey, -2000) ; Réinitialise après 2 secondes
}

; Accent grave
graveMap := Map("a", "à", "e", "è", "u", "ù", "c", "ç", "o", "œ", "m", "µ", "s", "ß")
graveMapMaj := Map("A", "À", "E", "È", "U", "Ù", "C", "Ç", "O", "Œ")
; Accent aigu (touche à gauche)
aiguMap := Map("q", "æ", "w", "é")
aiguMapMaj := Map("Q", "Æ", "W", "É")
; Accent circonflexe (touche sous la voyelle)
circMap := Map("z", "â", "d", "ê", "k", "î", "l", "ô", "j", "û")
circMapMaj := Map("Z", "Â", "D", "Ê", "K", "Î", "L", "Ô", "J", "Û")
; Tréma (double deadkey)
tremaMap := Map("a", "ä", "e", "ë", "i", "ï", "o", "ö", "u", "ü")
tremaMapMaj := Map("A", "Ä", "E", "Ë", "I", "Ï", "O", "Ö", "U", "Ü")

; Fonction générique pour gérer les touches
handleAccent(key) {
    global deadKeyCount, graveMap, graveMapMaj, aiguMap, aiguMapMaj, circMap, circMapMaj, 
    tremaMap, tremaMapMaj


    if deadKeyCount = 1 {
        if graveMapMaj.Has(key) {
            SendText graveMapMaj[key]
        } else if graveMap.Has(key) {
            SendText graveMap[key]
        } else if aiguMapMaj.Has(key) {
            SendText aiguMapMaj[key]
        } else if aiguMap.Has(key) {
            SendText aiguMap[key]
        } else if circMapMaj.Has(key) {
            SendText circMapMaj[key]
        } else if circMap.Has(key) {
            SendText circMap[key]
        } else {
            SendText key
        }
    } else if deadKeyCount = 2 {
        if tremaMapMaj.Has(key) {
            SendText tremaMapMaj[key]
        } else if tremaMap.Has(key) {
            SendText tremaMap[key]
        } else {
            SendText key
        }
    } else {
        SendText key
    }

    deadKeyCount := 0
}

; Interception des touches
a::handleAccent("a")
e::handleAccent("e")
i::handleAccent("i")
o::handleAccent("o")
u::handleAccent("u")
c::handleAccent("c")
m::handleAccent("m")
s::handleAccent("s")

+a::handleAccent("A")
+e::handleAccent("E")
+i::handleAccent("I")
+o::handleAccent("O")
+u::handleAccent("U")
+c::handleAccent("C")

; Touche à gauche (aigu)
w::handleAccent("w")
+w::handleAccent("W")

; Touche sous (circonflexe)
d::handleAccent("d")
j::handleAccent("j")
l::handleAccent("l")
k::handleAccent("k")
z::handleAccent("z")

+d::handleAccent("D")
+j::handleAccent("J")
+l::handleAccent("L")
+k::handleAccent("K")
+z::handleAccent("Z")

q::handleAccent("q")
+q::handleAccent("Q")


resetDeadKey() {
    global deadKeyCount
    deadKeyCount := 0
}

; Touche ISO (à droite de Shift gauche sur clavier ISO)
SC056::SendText "<"
+SC056::SendText ">"

; Shift + , → ;
vkBC::SendText ","
+vkBC::SendText ";"

; Shift + . → :
vkBE::SendText "."
+vkBE::SendText ":"

; Couche AltGr
<^>!q::Send "^"
<^>!w::Send "<"
<^>!e::Send ">"
<^>!r::Send "$"
<^>!t::Send "%"
<^>!y::Send "@"
<^>!u::Send "&"
<^>!i::Send "*"
<^>!o::Send "'"
<^>!p::Send "``"
<^>!a::Send "{"
<^>!s::Send "("
<^>!d::Send ")"
<^>!f::Send "}"
<^>!g::Send "="
<^>!h::Send "\"
<^>!j::Send "+"
<^>!k::Send "-"
<^>!l::Send "/"
<^>!;::Send '`"'
<^>!z::Send "~"
<^>!x::Send "["
<^>!c::Send "]"
<^>!v::Send "_"
<^>!b::Send "#"
<^>!n::Send "|"
<^>!m::Send "!"
<^>!,::Send ";"
<^>!.::Send ":"
<^>!/::Send "?"
