// @ts-ignore
import { Remarkable } from 'remarkable'
// @ts-ignore
import { linkify } from 'remarkable/linkify'

const remark = new Remarkable({
  html: true, // Enable HTML tags in source
  xhtmlOut: false, // Use '/' to close single tags (<br />)
  breaks: false, // Convert '\n' in paragraphs into <br>
  langPrefix: 'language-', // CSS language prefix for fenced blocks

  // Enable some language-neutral replacement + quotes beautification
  typographer: true,

  // Double + single quotes replacement pairs, when typographer enabled,
  // and smartquotes on. Set doubles to '«»' for Russian, '„“' for German.
  quotes: '“”‘’',

  // Highlighter function. Should return escaped HTML,
  // or '' if the source string is not changed
  highlight: function(/* str, lang */) { return '' },
}).use(linkify) // Autoconvert URL-like text to links

export default remark
