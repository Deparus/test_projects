document.onclick = function(e) {
    if (e.target.tagName != 'BUTTON') return;

    if (e.target.innerHTML == '10x10') drawTable(10, 10);
    if (e.target.innerHTML == '15x15') drawTable(15, 15);
    if (e.target.innerHTML == '20x20') drawTable(20, 20)
  }

  document.getElementById('drawCustomField').onclick = function() {
    var width = parseInt(document.getElementById('width').value);
    var height = parseInt(document.getElementById('height').value);

    if (isNaN(width)) {
      alert('Введите N(число) ячеек по ширине');
      return;
    }
    if (isNaN(height)) {
      alert('Введите N(число) ячеек по высоте');
      return;
    }

    drawTable(width, height);
  }

  function drawTable(width, height) {

    if (document.querySelector('table')) document.querySelector('table').remove();

    //var width = document.getElementById('width').value;
    //var height = document.getElementById('height').value;

    var table = document.createElement('table');

    for (var i = 0; i < height; i++) {
      var tr = document.createElement('tr');
      for (var j = 0; j < width; j++) {
        var td = document.createElement('td');
        tr.appendChild(td);
      }
      table.appendChild(tr);
    }

    var tds = table.getElementsByTagName('td');
    for (var i = 0; i < tds.length; i++) {
      tds[i].setAttribute('data-id', i + 1);
    }

    document.getElementById('table-container').appendChild(table);

    table.onmousedown = selectTd;

    table.onkeyup = function() {
      return false;
    }
    table.ondragstart = function() {
      return false;
    }

    table.oncontextmenu = function(e) {
      if (e.target.classList.contains('numbered') &&
        e.target.classList.contains('selected')) return false;

      if (!e.target.classList.contains('flagged')) {
        e.target.classList.add('flagged');
        e.target.innerHTML = '&#9971';
      } else {
        e.target.classList.remove('flagged');
        e.target.innerHTML = e.target.dataset.mines;
      }

      return false;
    }

    placeMines();
    generateNumbers();

  }

  function selectTd(e) {
    var target = e.target;
    if (target.tagName != 'TD') return;

    if (e.which == 1) {
      target.classList.add('selected');

      if (target.classList.contains('flagged')) target.classList.remove('flagged');

      if (target.classList.contains('minen')) {
        target.style.background = 'red';
        gameOver('lose');
      } else if (document.body.getElementsByClassName('selected').length +
        document.body.getElementsByClassName('minen').length ==
        document.body.getElementsByTagName('td').length) {
        gameOver('win');
      } else {
        openEmptyCells(target);
      }
    }
    if (e.which == 2) {
      if (!target.classList.contains('numbered')) return;

      var siblings = getSiblings(target);

      var flagsCountered = 0;

      siblings.forEach(function(el) {
        if (el.classList.contains('flagged'))
          flagsCountered++;
      });

      if (flagsCountered == target.innerHTML) {
        siblings.forEach(function(el) {
          if (!el.classList.contains('flagged')) {
            el.classList.add('selected');
            openEmptyCells(el);
          }
        });
        if (document.body.querySelectorAll('.minen.selected').length) gameOver('lose');
        if (document.body.getElementsByClassName('selected').length +
          document.body.getElementsByClassName('minen').length ==
          document.body.getElementsByTagName('td').length) {
          gameOver('win');
        }
      }

      if (flagsCountered != target.innerHTML) {
        siblings.forEach(function(el) {
          if (!el.classList.contains('selected', 'numbered')) {
            el.style.background = '#FF4500';
            setTimeout(function() {
              el.style.background = '';
            }, 300);
          }
        });
      }
    }
  }

  function recolorTable() {
    var table = document.body.querySelector('table');
    table.classList.toggle('recolored');
  }

  function resetTable() {
    var table = document.body.querySelector('table');
    table.className = '';
    var selectedTds = table.querySelectorAll('td.selected');

    for (var i = 0; i < selectedTds.length; i++) {
      selectedTds[i].className = '';
    }
  }

  function placeMines() {

    var tds = document.body.getElementsByTagName('td');
    var mineCount = Math.floor(tds.length / 7) + 1;
    var arr = [];

    function generateRandomMines(min, max, mines) {
      var mines = mines;
      while (mines > 0) {
        var generated = Math.floor(Math.random() * (max - min)) + min;
        if (arr.indexOf(generated) != -1) continue;
        arr.push(generated);
        mines--;
      }
    }

    generateRandomMines(0, tds.length, mineCount);

    arr.forEach(function(el) {
      tds[el].innerHTML = '&#9881';
      tds[el].classList.add('minen');
    });
    document.getElementById('totalmines').innerHTML = mineCount;
  }

  function generateNumbers() {
    var table = document.querySelector('table');
    var tr = table.rows;

    for (var i = 0; i < tr.length; i++) {
      var td = tr[i].cells;
      for (var j = 0; j < td.length; j++) {

        if (td[j].classList.contains('minen')) continue;

        var counter = 0;

        var siblings = getSiblings(td[j]);

        siblings.forEach(function(el) {
          if (el.classList.contains('minen')) counter++;
        });

        if (counter) {
          td[j].innerHTML = counter;
          td[j].setAttribute('data-mines', counter);
          td[j].classList.add('numbered');
        }
      }
    }
  }

  function openEmptyCells(cell) {
    var table = document.querySelector('table');
    var cellX = cell.cellIndex;
    var cellY = (cell.parentNode.sectionRowIndex == -1) ? cell.parentNode.rowIndex : cell.parentNode.sectionRowIndex;

    function map(x, y) { //recursive function for opening of empty cells
      //console.log(x, y)
      if (table.rows[y].cells[x].classList.contains('numbered')) {
        table.rows[y].cells[x].classList.add('selected');
        return;
      }

      table.rows[y].cells[x].classList.add('selected');

      if (checkSiblings(table, y, x - 1, false, 'minen', 'selected'))
        map(x - 1, y);

      if (checkSiblings(table, y, x + 1, false, 'minen', 'selected'))
        map(x + 1, y);

      if (checkSiblings(table, y - 1, x - 1, false, 'minen', 'selected'))
        map(x - 1, y - 1);

      if (checkSiblings(table, y - 1, x, false, 'minen', 'selected'))
        map(x, y - 1);

      if (checkSiblings(table, y - 1, x + 1, false, 'minen', 'selected'))
        map(x + 1, y - 1);

      if (checkSiblings(table, y + 1, x - 1, false, 'minen', 'selected'))
        map(x - 1, y + 1);

      if (checkSiblings(table, y + 1, x, false, 'minen', 'selected'))
        map(x, y + 1);

      if (checkSiblings(table, y + 1, x + 1, false, 'minen', 'selected'))
        map(x + 1, y + 1);

    }

    map(cellX, cellY);
  }

  function checkSiblings(table, tr, td, containClasses, cls1, cls2) { //containClasses true || false

    if (!table.rows[tr]) {
      return false;
    }

    if (!table.rows[tr].cells[td]) {
      return false;
    }

    var cl1 = table.rows[tr].cells[td].classList.contains(cls1);
    var cl2 = table.rows[tr].cells[td].classList.contains(cls2);

    if (containClasses) {
      if (cl1) return true;
    } else if (!containClasses) {
      if (!cl1 && !cl2) return true;
    }

    return false;
  }

  function gameOver(status) {
    var table = document.querySelector('table');
    var td = table.getElementsByTagName('td');

    var height = table.rows.length;
    var width = td.length / height;

    function fillMines(color) {
      [].forEach.call(td, function(el) {
        if (el.classList.contains('minen')) {
          el.classList.add('selected');
          if (el.classList.contains('flagged')) el.classList.remove('flagged');
          el.style.background = color;
          el.innerHTML = '&#9881';
        } else {
          el.classList.add('selected');
        }
      });
    }

    var newg;

    if (status == 'lose') {
      fillMines('red');
      newg = confirm('You lose. Start new game?');
    }

    if (status == 'win') {
      fillMines('#1EFDC9');
      newg = alert('You win this game!');
    }

    if (newg) drawTable(width, height);
    if (!newg) {
      table.onclick = function() {
        return false;
      }
    }
  }

  function getSiblings(cell) {

    var result = [];

    var table = document.querySelector('table');
    var cellX = cell.cellIndex;
    var cellY = (cell.parentNode.sectionRowIndex == -1) ? cell.parentNode.rowIndex : cell.parentNode.sectionRowIndex;;

    if (table.rows[cellY - 1] && table.rows[cellY - 1].cells[cellX])
      result.push(table.rows[cellY - 1].cells[cellX]);

    if (table.rows[cellY - 1] && table.rows[cellY - 1].cells[cellX + 1])
      result.push(table.rows[cellY - 1].cells[cellX + 1]);

    if (table.rows[cellY].cells[cellX + 1])
      result.push(table.rows[cellY].cells[cellX + 1]);

    if (table.rows[cellY + 1] && table.rows[cellY + 1].cells[cellX + 1])
      result.push(table.rows[cellY + 1].cells[cellX + 1]);

    if (table.rows[cellY + 1] && table.rows[cellY + 1].cells[cellX])
      result.push(table.rows[cellY + 1].cells[cellX]);

    if (table.rows[cellY + 1] && table.rows[cellY + 1].cells[cellX - 1])
      result.push(table.rows[cellY + 1].cells[cellX - 1]);

    if (table.rows[cellY].cells[cellX - 1])
      result.push(table.rows[cellY].cells[cellX - 1]);

    if (table.rows[cellY - 1] && table.rows[cellY - 1].cells[cellX - 1])
      result.push(table.rows[cellY - 1].cells[cellX - 1]);

    return result;
  }

