/*
 * Table Block
 * Recreate a table
 * https://www.hlx.live/developer/block-collection/table
 */

function buildCell(rowIndex) {
  const cell = rowIndex ? document.createElement('td') : document.createElement('th');
  if (!rowIndex) cell.setAttribute('scope', 'col');
  return cell;
}

function buildWeatherCell(col, rowNum) {
  const cell = rowNum > 0 ? document.createElement('td') : document.createElement('th');
  const cellContainer = document.createElement('div');
  if (rowNum) {
    // eslint-disable-next-line eqeqeq
    if (cell.textContent == parseInt(cell.textContent, 10)) {
      // if cell contents are only numerical
      cell.classList.add('table-cell-num');
    }
  }
  if (cell.nodeName === 'TD') {
    cellContainer.classList.add('weather-cell');
  }

  switch (rowNum) {
    case 1:
      cellContainer.innerHTML = '<img src="/pages/icons/inclement-weather-clear.svg" alt="icon weather clear">';
      break;
    case 2:
      cellContainer.innerHTML = '<img src="/pages/icons/inclement-weather-aware.svg" alt="icon weather be aware">';
      break;
    case 3:
      cellContainer.innerHTML = '<img src="/pages/icons/inclement-weather-prepared.svg" alt="icon weather be prepared">';
      break;
    case 4:
      cellContainer.innerHTML = '<img src="/pages/icons/inclement-weather-action.svg" alt="icon weather take action">';
      break;
    case 5:
      cellContainer.innerHTML = '<img src="/pages/icons/inclement-weather-closure.svg" alt="icon weather course closed">';
      break;
    default: // Do Nothing
  }

  const cellText = document.createElement('div');
  cellText.innerHTML = typeof col === 'object' ? col.innerHTML : col;
  cellContainer.innerHTML += cellText.outerHTML;
  cell.innerHTML = cellContainer.outerHTML;
  return cell;
}

export default async function decorate(block) {
  const table = document.createElement('table');
  const thead = document.createElement('thead');
  const tbody = document.createElement('tbody');
  if (block.className.includes('weather')) {
    block.querySelectorAll(':scope > div').forEach((row, i) => {
      const tr = document.createElement('tr');
      row.querySelectorAll('div').forEach((col, j) => {
        if (j === 0) {
          tr.append(buildWeatherCell(col, i));
        } else {
          const cell = buildCell(i);
          cell.innerHTML = col.innerHTML;
          tr.append(cell);
        }
      });
      if (i > 0) tbody.append(tr);
      else thead.append(tr);
    });
    table.append(thead, tbody);
    block.innerHTML = '';
    block.append(table);
  } else {
    table.append(thead, tbody);
    [...block.children].forEach((child, i) => {
      const row = document.createElement('tr');
      if (i) tbody.append(row);
      else thead.append(row);
      [...child.children].forEach((col) => {
        const cell = buildCell(i);
        cell.innerHTML = col.innerHTML;
        row.append(cell);
      });
    });
    const cols = thead.querySelectorAll('th').length;
    if (cols && cols === 2) table.classList.add('two-col');
    block.innerHTML = '';
    block.append(table);
  }
}
