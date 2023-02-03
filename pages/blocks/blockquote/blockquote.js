export default async function decorate(block) {
  const quotes = block.querySelectorAll('h2');
  const sources = block.querySelectorAll('p');
  if (quotes && quotes.length) {
    const figure = document.createElement('figure');
    const blockquote = document.createElement('blockquote');
    figure.append(blockquote);
    quotes.forEach((quote) => {
      const q = document.createElement('p');
      q.innerHTML = quote.innerHTML;
      blockquote.append(q);
    });
    // only apply styles to sources if paired with quotes
    if (sources && sources.length) {
      blockquote.className = 'blockquote-with-source';
      const figcaption = document.createElement('figcaption');
      sources.forEach((source) => {
        const s = document.createElement('p');
        s.innerHTML = source.innerHTML;
        // replace italics with semantic <cite>
        s.innerHTML = s.innerHTML.replaceAll('em>', 'cite>');
        figcaption.append(s);
      });
      figure.append(figcaption);
    }
    block.innerHTML = '';
    block.append(figure);
  }
}
