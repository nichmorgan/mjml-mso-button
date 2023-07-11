import { BodyComponent } from 'mjml-core'

import widthParser from 'mjml-core/lib/helpers/widthParser'

function transformFill(bgColor) {
  /*
  Check which background was used on original button and try to transform it into VML form.
  Real CSS parser may be used here, but a primitive one is used to avoid dependencies
  */
  const trimmedBgColor = bgColor.trim()
  const gradientArgsMatch = trimmedBgColor.match(/gradient\((.+)\)$/)
  if (gradientArgsMatch !== null) {
    const gradientArgs = gradientArgsMatch[1].split(',').map((a) => a.trim())
    if (trimmedBgColor.startsWith('linear-gradient')) {
      // Expected format: linear-gradient(90deg, #AABBCC 0%, #DDEEFF 100%)
      if (gradientArgs.length === 3) {
        const angle = gradientArgs[0]
        // Colors are in inverted positions in VML
        const color1 = gradientArgs[2]
        const color2 = gradientArgs[1]
        return `<v:fill type="gradient" color="${color1}" color2="${color2}" angle="${angle}" />`
      }
    } else if (trimmedBgColor.startsWith('radial-gradient')) {
      // Expected format: radial-gradient(50% 50%, #AABBCC 0%, #DDEEFF 100%)
      if (gradientArgs.length === 3) {
        const focusPosition = gradientArgs[0]
        // Colors are in inverted positions in VML
        const color1 = gradientArgs[2]
        const color2 = gradientArgs[1]
        return `<v:fill type="gradientradial" color="${color1}" color2="${color2}" focusposition="${focusPosition}" />`
      }
    }
  }
  // Fallback
  return `<v:fill type="tile" color="${trimmedBgColor}" />`
}

export default class MjMsoButton extends BodyComponent {
  static componentName = 'mj-msobutton'

  static endingTag = true

  static dependencies = {
    // Tell the validator which tags are allowed as our component's parent
    'mj-hero': ['mj-msobutton'],
    'mj-column': ['mj-msobutton'],
    // Tell the validator which tags are allowed as our component's children
    'mj-msobutton': [],
  }

  static allowedAttributes = {
    align: 'enum(left,center,right)',
    'background-color': 'color',
    'border-bottom': 'string',
    'border-left': 'string',
    'border-radius': 'string',
    'border-right': 'string',
    'border-top': 'string',
    border: 'string',
    color: 'color',
    'container-background-color': 'color',
    'font-family': 'string',
    'font-size': 'unit(px)',
    'font-style': 'string',
    'font-weight': 'string',
    height: 'unit(px,%)',
    href: 'string',
    name: 'string',
    title: 'string',
    'inner-padding': 'unit(px,%){1,4}',
    'letter-spacing': 'unitWithNegative(px,em)',
    'line-height': 'unit(px,%,)',
    'padding-bottom': 'unit(px,%)',
    'padding-left': 'unit(px,%)',
    'padding-right': 'unit(px,%)',
    'padding-top': 'unit(px,%)',
    padding: 'unit(px,%){1,4}',
    rel: 'string',
    target: 'string',
    'text-decoration': 'string',
    'text-transform': 'string',
    'vertical-align': 'enum(top,bottom,middle)',
    'text-align': 'enum(left,right,center)',
    width: 'unit(px,%)',
    'mso-height': 'unit(px)',
    'mso-width': 'unit(px)',
    'mso-proof': 'boolean',
  }

  static defaultAttributes = {
    align: 'center',
    'background-color': '#414141',
    border: 'none',
    'border-radius': '3px',
    color: '#ffffff',
    'font-family': 'Ubuntu, Helvetica, Arial, sans-serif',
    'font-size': '13px',
    'font-weight': 'normal',
    'inner-padding': '10px 25px',
    'line-height': '120%',
    padding: '10px 25px',
    target: '_blank',
    'text-decoration': 'none',
    'text-transform': 'none',
    'vertical-align': 'middle',
    'mso-height': '40px',
    'mso-width': '200px',
    'mso-proof': 'false',
  }

  getStyles() {
    return {
      table: {
        'border-collapse': 'separate',
        width: this.getAttribute('width'),
        'line-height': '100%',
      },
      td: {
        border: this.getAttribute('border'),
        'border-bottom': this.getAttribute('border-bottom'),
        'border-left': this.getAttribute('border-left'),
        'border-radius': this.getAttribute('border-radius'),
        'border-right': this.getAttribute('border-right'),
        'border-top': this.getAttribute('border-top'),
        cursor: 'auto',
        'font-style': this.getAttribute('font-style'),
        height: this.getAttribute('height'),
        'mso-padding-alt': this.getAttribute('inner-padding'),
        'text-align': this.getAttribute('text-align'),
        background: this.getAttribute('background-color'),
      },
      content: {
        display: 'inline-block',
        width: this.calculateAWidth(this.getAttribute('width')),
        background: this.getAttribute('background-color'),
        color: this.getAttribute('color'),
        'font-family': this.getAttribute('font-family'),
        'font-size': this.getAttribute('font-size'),
        'font-style': this.getAttribute('font-style'),
        'font-weight': this.getAttribute('font-weight'),
        'line-height': this.getAttribute('line-height'),
        'letter-spacing': this.getAttribute('letter-spacing'),
        margin: '0',
        'text-decoration': this.getAttribute('text-decoration'),
        'text-transform': this.getAttribute('text-transform'),
        padding: this.getAttribute('inner-padding'),
        'mso-padding-alt': '0px',
        'border-radius': this.getAttribute('border-radius'),
      },
      msocontainer: {
        height: this.getAttribute('mso-height'),
        width: this.getAttribute('mso-width'),
        padding: this.getAttribute('padding'),
        'v-text-anchor': 'middle',
      },
      msobutton: {
        color: this.getAttribute('color'),
        'font-family': this.getAttribute('font-family'),
        'font-size': this.getAttribute('font-size'),
        'font-style': this.getAttribute('font-style'),
        'font-weight': this.getAttribute('font-weight'),
        'line-height': this.getAttribute('line-height'),
        'letter-spacing': this.getAttribute('letter-spacing'),
        'vertical-align': this.getAttribute('vertical-align'),
      },
    }
  }

  calculateAWidth(width) {
    if (!width) return null

    const { parsedWidth, unit } = widthParser(width)

    // impossible to handle percents because it depends on padding and text width
    if (unit !== 'px') return null

    const { borders } = this.getBoxWidths()

    const innerPaddings =
      this.getShorthandAttrValue('inner-padding', 'left') +
      this.getShorthandAttrValue('inner-padding', 'right')

    return `${parsedWidth - innerPaddings - borders}px`
  }

  renderMSO() {
    const bgColor =
      this.getAttribute('background-color') === 'none'
        ? undefined
        : this.getAttribute('background-color')
    const radii = !this.getAttribute('border-radius')
      ? 0
      : parseInt(this.getAttribute('border-radius'), 10)
    const height = parseInt(this.getAttribute('mso-height'), 10)
    let arcsize = 0
    if (radii > height) arcsize = 100
    if (radii !== 0 && arcsize !== 100) arcsize = (radii / height) * 100

    let borderAttr = ['0pt', 'Solid', '#000000']
    const borderstyleAdapter = {
      solid: 'Solid',
      dotted: 'Dot',
      dashed: 'Dash',
      double: 'Solid',
      groove: 'Solid',
      ridge: 'Solid',
      inset: 'Solid',
      outset: 'Solid',
      none: 'Solid',
      hidden: 'Solid',
    }
    const stroked = this.getAttribute('border') !== 'none'
    if (stroked) {
      const border = this.getAttribute('border').split(' ')
      borderAttr = [
        border.length > 0 ? border[0] : borderAttr[0],
        border.length > 1 ? borderstyleAdapter[border[1]] : borderAttr[1],
        border.length === 3 ? border[2] : borderAttr[2],
      ]
    }
    return `
    <!--[if mso]>
      <table
        ${this.htmlAttributes({
          border: '0',
          cellpadding: '0',
          cellspacing: '0',
          role: 'presentation',
          style: 'table',
        })}
      >
        <tbody>
          <tr>
            <td ${this.htmlAttributes({
              align: this.getAttribute('align'),
            })}>
              <v:roundrect
                xmlns:v="urn:schemas-microsoft-com:vml"
                xmlns:w="urn:schemas-microsoft-com:office:word"
                ${this.htmlAttributes({
                  href: this.getAttribute('href'),
                  arcsize,
                  fill: bgColor === undefined ? 'f' : 't',
                  strokeweight: stroked ? borderAttr[0] : '0pt',
                  strokecolor: borderAttr[2],
                  stroked: stroked ? 't' : 'f',
                  style: 'msocontainer',
                })}
                >
                ${stroked ? `<v:stroke dashstyle="${borderAttr[1]}" />` : ''}
                ${bgColor === undefined ? '' : transformFill(bgColor)}
                <w:anchorlock/>
                <center ${this.htmlAttributes({ style: 'msobutton' })}>
                  ${this.getContent()}
                </center>
              </v:roundrect>
            </td>
          </tr>
        </tbody>
      </table>
    <![endif]-->
    `
  }

  render() {
    const tag = this.getAttribute('href') ? 'a' : 'p'
    const mso = this.getAttribute('mso-proof')
    return `
      ${mso ? this.renderMSO() : ''}
      ${mso ? '<!--[if !mso]><!---->' : ''}
      <table
        ${this.htmlAttributes({
          border: '0',
          cellpadding: '0',
          cellspacing: '0',
          role: 'presentation',
          style: 'table',
        })}
      >
        <tbody>
          <tr>
            <td
              ${this.htmlAttributes({
                align: this.getAttribute('align'),
                bgcolor:
                  this.getAttribute('background-color') === 'none'
                    ? undefined
                    : this.getAttribute('background-color'),
                role: 'presentation',
                style: 'td',
                valign: this.getAttribute('vertical-align'),
              })}
            >
              <${tag}
                ${this.htmlAttributes({
                  href: this.getAttribute('href'),
                  rel: this.getAttribute('rel'),
                  name: this.getAttribute('name'),
                  style: 'content',
                  target: tag === 'a' ? this.getAttribute('target') : undefined,
                })}
              >
                ${this.getContent()}
              </${tag}>
            </td>
          </tr>
        </tbody>
      </table>
      ${mso ? '<![endif]-->' : ''}
    `
  }
}
