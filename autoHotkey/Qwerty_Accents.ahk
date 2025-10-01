    /*
    Easy accents on a qwerty keyboard including french ç as well as spanish ñ and ¿ 1nd ¡
    
    Note: Obtained the unicode values at: https en.wikipedia.org /wiki/List_of_Unicode_characters  Spaced Link for safety
    
    Basiclly this solution allows to type any vowel preceded by any of [':;^] to obtain the 'accented' version:
    ' before [AEIOUaeiou'NnCc?!] produces [ÁÉÍÓÚáéíóú'ÑñÇç¿¡]
    " before [AEIOUaeiou"]       produces [ÄËÏÖÜäëïöü"]
    ` before [AEIOUaeiou`]       produces [ÀÈÌÒÙàèìòù`]
    ^ before [AEIOUaeiou^]       produces [ÂÊÎÔÛâêîôû^]
    
    The leader character can be produced by typing it twice: '' => ', "" => " et al.
    This is only needed if the leader character is followed by a vowel, n, c, ? or !.
    
    Note that for my personal ease of typing, ñ and Ñ can also pr produced by 'n and 'N.
    
    The available combinations can easily be extended if you need other accented characters.
    
    */

:C*?:E$::{U+20AC} ; E followed by $ => €
:C*?:e$::{U+20AC} ; e followed by $ => €

; ' followed by character
:C*?:'!::{U+00A1} ; ! followed by ' => ¡
:C*?:''::{U+0027} ; ' followed by ' => '
:C*?:'?::{U+00BF} ; ? followed by ' => ¿
:C*?:'A::{U+00C0} ; ' followed by A => À
:C*?:'C::{U+00C7} ; ' followed by C => Ç
:C*?:'E::{U+00C9} ; ' followed by E => É
:C*?:'N::{U+00D1} ; ' followed by N => Ñ
:C*?:'O::{U+00D4} ; ^ followed by O => Ô
:C*?:'U::{U+00D9} ; ` followed by U => Ù
:C*?:'a::{U+00E0} ; ' followed by a => à
:C*?:'c::{U+00E7} ; ' followed by c => ç
:C*?:'e::{U+00E9} ; ' followed by e => é
:C*?:'n::{U+00F1} ; ' followed by n => ñ
:C*?:'o::{U+00F4} ; ^ followed by o => ô
:C*?:'u::{U+00F9} ; ' followed by u => ù

; " followed by character
:C*?:""::{U+0022} ; " followed by " => "
:C*?:"A::{U+00C4} ; " followed by A => Ä
:C*?:"E::{U+00CB} ; " followed by E => Ë
:C*?:"O::{U+00D6} ; " followed by O => Ö
:C*?:"U::{U+00DC} ; " followed by U => Ü
:C*?:"a::{U+00E4} ; " followed by a => ä
:C*?:"e::{U+00EB} ; " followed by e => ë
:C*?:"i::{U+00EF} ; " followed by i => ï
:C*?:"o::{U+00F6} ; " followed by o => ö
:C*?:"u::{U+00FC} ; " followed by u => ü

; ` followed by character
:C*?:````::{U+0060} ; ` followed by ` => `
:C*?:``E::{U+00C8} ; ` followed by E => È
:C*?:``e::{U+00E8} ; ` followed by e => è

; ^ followed by character
:C*?:^^::{U+005E} ; ^ followed by ^ => ^
:C*?:^A::{U+00C2} ; ^ followed by A => Â
:C*?:^E::{U+00CA} ; ^ followed by E => Ê
:C*?:^I::{U+00CE} ; ^ followed by I => Î
:C*?:^O::{U+00D4} ; ^ followed by O => Ô
:C*?:^U::{U+00DB} ; ^ followed by U => Û
:C*?:^a::{U+00E2} ; ^ followed by a => â
:C*?:^e::{U+00EA} ; ^ followed by e => ê
:C*?:^i::{U+00EE} ; ^ followed by i => î
:C*?:^u::{U+00FB} ; ^ followed by u => û
:C*?:^2::{U+00B2} ; ^ followed by 2 => ²

; ~ followed by character
:C*?:~~::{U+007E} ; ~ followed by ~ => ~
:C*?:~N::{U+00D1} ; ~ followed by N => Ñ
:C*?:~n::{U+00F1} ; ~ followed by n => ñ

;; Thanks for comments and or corrections to Guido Van Hoecke guivho@gmail.com
