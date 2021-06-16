# mjml-msobutton

This component can be usefull if you want to try an outlook proof adventure.
The msobutton has exactly the same behaviours of the classic button but add three more attributes.
- mso-proof: boolean (default false)
- mso-width: px (200px)
- mso-height: px (40px)

More important, these 3 new attributes allow mjml to generate a bulletproof button with radius and stroke as you can see (here)[https://buttons.cm/], including the alignment.

## Problems that you should know

The outlook solution isn't really bulletproof.
1. This cannot be used with an image in background
2. It create a duplication of code in the HTML
3. The width and the height cannot use the auto

## Usage

Simply add these lines in your gulpfile before compile with mjml:

```javascript
import { registerComponent } from 'mjml-core'
import MjMsoButton from 'mjml-msobutton'

registerComponent(MjMsoButton)
```

```html
<mj-msobutton mso-proof="true">Click !</mj-msobutton>
```
