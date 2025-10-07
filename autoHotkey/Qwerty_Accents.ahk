
; -------------------------------
; MODULE : Apostrophe contextuelle (préfixes j, l, m, n, t)
; -------------------------------

/*
:C*?:J'::J'
:C*?:M'::M'
:C*?:T'::T'
:C*?:L'::L'
:C*?:S'::S'
:C*?:N'::N'
:C*?:C'::C'
:C*?:D'::D'

:C*?: j':: j'
:C*?: m':: m'
:C*?: t':: t'
:C*?: l':: l'
:C*?: s':: s'
:C*?: n':: n'
:C*?: c':: c'
:C*?: d':: d'

*/

:C*?:k-a::k-a

;-----------------------------------------------------------------------------------------
; ' pour les accentuations de lettres les plus courantes (aïgues ou graves) + çédilles
;-----------------------------------------------------------------------------------------

:C*?:''::{U+0027} ; ' followed by ' => '

:C*?:'E::{U+00C9} ; ' followed by E => É
:C*?:'A::{U+00C0} ; ' followed by A => À
:C*?:'U::{U+00D9} ; ' followed by U => Ù
;:C*?:'I::{U+00CE} ; - followed by I => Î
;:C*?:'O::{U+00D4} ; - followed by O => Ô

:C*?:'e::{U+00E9} ; ' followed by e => é
:C*?:'a::{U+00E0} ; ' followed by a => à
:C*?:'u::{U+00F9} ; ' followed by u => ù
;:C*?:'i::{U+00EE} ; - followed by i => î
;:C*?:'o::{U+00F4} ; ' followed by o => ô

:C*?:'C::{U+00C7} ; ' followed by C => Ç
:C*?:'c::{U+00E7} ; ' followed by c => ç

;-----------------------------------------------------------------------------------------
; ` pour le è et È
;-----------------------------------------------------------------------------------------
:C*?:````::{U+0060} ; ` followed by ` => `
:C*?:``E::{U+00C8} ; ` followed by E => È
:C*?:``e::{U+00E8} ; ` followed by e => è

;-----------------------------------------------------------------------------------------
; - pour les accents circonflexes "^"
;-----------------------------------------------------------------------------------------
:C*?:--::{U+002D} ; - followed by - => -
:C*?:-A::{U+00C2} ; - followed by A => Â
:C*?:-E::{U+00CA} ; - followed by E => Ê
:C*?:-I::{U+00CE} ; - followed by I => Î
:C*?:-O::{U+00D4} ; - followed by O => Ô

:C*?:-U::{U+00DB} ; - followed by U => Û

:C*?:-a::{U+00E2} ; - followed by a => â
:C*?:-e::{U+00EA} ; - followed by e => ê
:C*?:-u::{U+00FB} ; - followed by u => û
:C*?:-i::{U+00EE} ; - followed by i => î
:C*?:-o::{U+00F4} ; ' followed by o => ô

:C*?:-2::{U+00B2} ; - followed by 2 => ²

;-----------------------------------------------------------------------------------------
; " pour les trémas "ë" etc
;-----------------------------------------------------------------------------------------
:C*?:""::{U+0022} ; " followed by " => "
:C*?:"E::{U+00CB} ; " followed by E => Ë

:C*?:"e::{U+00EB} ; " followed by e => ë
:C*?:"i::{U+00EF} ; " followed by i => ï

;-----------------------------------------------------------------------------------------
; autres
;-----------------------------------------------------------------------------------------

:C*?:E$::{U+20AC} ; E followed by $ => €
:C*?:e$::{U+20AC} ; e followed by $ => €

;; Thanks for comments and or corrections to Guido Van Hoecke guivho@gmail.com
