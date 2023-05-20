let categories;
let tableRowItems = {
  urlFilterList:[]
};
let tableRowButtons;
let screenMask;
let urlFilterEditor;
let currentPrefs = {};
let l10n = {};
const positionMapping = {
  0: 'center',
  1: 'topLeft',
  2: 'bottomLeft',
  3: 'topRight',
  4: 'bottomRight',
  5: 'custom',
}

const checkFilterEditorInput = () => {
  let disabled = false

  if(document.getElementById('newFilterUrl').value.trim() === '') {
    disabled = true
  }

  if(document.getElementById('defaultPosition').value === '5') {
    const left = Number(document.getElementById('windowPositionLeft').value)
    const top = Number(document.getElementById('windowPositionTop').value)
    if (typeof left !== 'number' || left < 0 || typeof top !== 'number' || top < 0) {
      disabled = true
    }
  }

  const width = Number(document.getElementById('windowWidth').value)
  const height = Number(document.getElementById('windowHeight').value)
  if (typeof width !== 'number' || width < 30 || typeof height !== 'number' || height < 30) {
    disabled = true
  }

  if (disabled) {
    document.getElementById('btnAcceptFilter').setAttribute('disabled', 'true');
  } else {
    document.getElementById('btnAcceptFilter').removeAttribute('disabled');
  }
}

// const exportToFile = (data, fileName) => {
// }

// const importFromFile = (callback) => {
//   let selectFile = document.getElementById('selectFile');
//   selectFile.onchange = () => {
//     if(selectFile.files && selectFile.files.length) {
//       let file = selectFile.files[0];
//       let reader = new FileReader();
//       reader.onload = function(evt) {
//         try {
//           let data = JSON.parse(evt.target.result);
//           callback(data);
//         }
//         catch (ex) {
//           callback();
//         }
//       };
//       reader.readAsText(file);
//     }
//   };
//   selectFile.click();
// }

// const exportAllOptions = () => {
//   exportToFile(JSON.stringify(currentPrefs), 'NewTongWenTang-Options.json');
// }

// const importAllOptions = () => {
//   importFromFile(data => {
//     if(data) {
//       for(let p in data) {
//         let elem = document.getElementById(p);
//         let elemType = elem.getAttribute('type');
//         if(elemType === 'listBox' || elemType === 'listBoxObj') {
//           //Remove all list from UI
//           for(let i = elem.children.length - 2; i > 0; i--) {
//             elem.removeChild(elem.children[i]);
//           }
//           currentPrefs[p] = data[p];
//         }
//         setValueToElem(p, data[p]);
//         sendVelueChangeMessage(p, data[p]);
//       }
//       currentPrefs = data;
//     }
//   });
// }

const resetListPrefs = (name, data) => {
  //Remove all list from UI
  let list = document.getElementById(name);
  for(let i = list.children.length - 2; i > 0; i--) {
    list.removeChild(list.children[i]);
  }

  //Replace setting
  currentPrefs[name] = data;

  //Add new list to UI
  setValueToElem(name, currentPrefs[name]);

  //Save to storage
  sendVelueChangeMessage(name, currentPrefs[name]);
}

const importUrlRule = () => {
  importFromFile(data => {
    if(data) {
      resetListPrefs('urlFilterList', data);
    }
  });
}

const hideScreenMask = () => {
  urlFilterEditor.style.display = 'none';
  screenMask.style.display = 'none';
  document.body.style.height = 'none';
  document.body.style.overflowY = 'scroll';
}

const showUrlFilterEditor = (url, position = '0', size = {width: 500, height: 400}, index) => {
  screenMask.style.display = 'block';
  urlFilterEditor.style.display = 'block';
  document.body.style.height = document.documentElement.clientHeight + 'px';
  document.body.style.overflowY = 'hidden';
  const urlNode = document.getElementById('newFilterUrl');
  urlNode.value = url;
  urlNode.setAttribute('index', index);

  const positionNode = document.getElementById('defaultPosition');
  if (['0', '1', '2', '3', '4'].includes(position)) {
    positionNode.value = position;
  } else {
    positionNode.value = '5';
  }
  const positionLeftNode = document.getElementById('windowPositionLeft');
  positionLeftNode.value = 0
  const positionTopNode = document.getElementById('windowPositionTop');
  positionTopNode.value = 0

  const widthNode = document.getElementById('windowWidth');
  widthNode.value = size.width
  const heightNode = document.getElementById('windowHeight');
  heightNode.value = size.height

  urlNode.focus();
  onDefaultPositionChange();
}

const clickOnRowItem = (event) => {
  let target = event.currentTarget.parentNode.getAttribute('id');
  let items = tableRowItems[target];
  for(let tableRowItem of items) {
    if(tableRowItem === event.currentTarget) {
      tableRowItem.setAttribute('selected', true);
    }
    else {
      tableRowItem.removeAttribute('selected');
    }
  }
}

const clickOnRowButton = (event) => {
  event.stopPropagation();
  event.preventDefault();
  let button = event.currentTarget;
  if(button.nodeName === 'LI') {
    button = button.querySelector('.cellEdit');
  }
  if(button.classList.contains('cellEdit')) {
    const target = button.parentNode.parentNode.getAttribute('id');
    if(target === 'urlFilterList') {
      const index = parseInt(button.parentNode.getAttribute('index'));
      const value = currentPrefs.urlFilterList[index];
      showUrlFilterEditor(value.url, value.position, value.size, index);
    }
  }
  else if(button.classList.contains('cellDelete')){
    const target = button.parentNode.parentNode.getAttribute('id');
    if(target === 'urlFilterList') {
      let urlFilterList = document.getElementById('urlFilterList');
      let node = button.parentNode;
      if(node.getAttribute('selected')==='true') {
        let index = parseInt(node.getAttribute('index'));
        node.parentNode.removeChild(node);
        for(let i = index+1; i < urlFilterList.children.length-1; ++i) {
          urlFilterList.children[i].setAttribute('index', i-1);
        }
        currentPrefs.urlFilterList.splice(index, 1);
        sendVelueChangeMessage('urlFilterList', currentPrefs.urlFilterList);
        //sendVelueChangeMessage(id);
      }
      else {
        clickOnRowItem({currentTarget: node});
      }
    }
    else {
      let target = button.parentNode.parentNode.getAttribute('id');
      let key = button.previousElementSibling.previousElementSibling.previousElementSibling.textContent;
      let node = button.parentNode;
      if(node.getAttribute('selected')==='true') {
        node.parentNode.removeChild(node);
        delete currentPrefs[target][key];
        sendVelueChangeMessage(target, currentPrefs[target]);
      }
      else {
        clickOnRowItem({currentTarget: node});
      }
    }
  }
}

const addRowItemCell = (row, classList, text, onClick) => {
  let div = document.createElement('div');
  for(let c of classList) {
    div.classList.add(c);
  }
  if(text)
    div.appendChild(document.createTextNode(text));
  if(onClick)
    div.addEventListener('click', onClick, true);
  row.appendChild(div);
  return div;
}

const moveUrlFilterPos = (shift) => {
  let selectedIndex = 0;
  let selectedRowItem = null;
  let nNode = null;
  let nIndex = 0;
  for(let tableRowItem of tableRowItems.urlFilterList) {
    if(tableRowItem.getAttribute('selected') === 'true') {
      let index = parseInt(tableRowItem.getAttribute('index'));
      if((shift === -1 && index === 0) || (shift === 1 && index === currentPrefs.urlFilterList.length-1))
        return;
      selectedIndex = index;
      selectedRowItem = tableRowItem;
      let filter = currentPrefs.urlFilterList.splice(index, 1);
      currentPrefs.urlFilterList.splice(index+shift, 0, filter[0]);
      sendVelueChangeMessage('urlFilterList', currentPrefs.urlFilterList);
      break;
    }
  }

  let urlFilterList = document.getElementById('urlFilterList');
  if(shift === 1 && selectedIndex === currentPrefs.urlFilterList.length-2) {
    let lastChild = urlFilterList.querySelector('li:last-of-type');
    urlFilterList.insertBefore(selectedRowItem, lastChild);
    nNode = selectedRowItem.previousElementSibling;
    nIndex = selectedIndex;
  }
  else {
    for(let tableRowItem of tableRowItems.urlFilterList) {
      let index = parseInt(tableRowItem.getAttribute('index'));
      if(shift === -1 && index === selectedIndex-1) {
        urlFilterList.insertBefore(selectedRowItem, tableRowItem);
        nNode = selectedRowItem;
        nIndex = selectedIndex-1;
        break;
      }
      else if(shift === 1 && index === selectedIndex+2) {
        urlFilterList.insertBefore(selectedRowItem, tableRowItem);
        nNode = selectedRowItem.previousElementSibling;
        nIndex = selectedIndex;
        break;
      }
    }
  }

  let item = nNode;
  while(item) {
    if(item.classList.contains('tableFooter'))
      break;
    item.setAttribute('index', nIndex++);
    item = item.nextElementSibling;
  }
}

const modefyUrlFilter = (url, position, size, index) => {
  let urlFilterList = document.getElementById('urlFilterList');
  let row = urlFilterList.children[index+1];
  row.children[0].textContent = url;
  row.children[1].textContent = ['0', '1', '2', '3', '4'].includes(position) ?
    chrome.i18n.getMessage(positionMapping[position]) :
    `${chrome.i18n.getMessage('windowPositionLeft')}: ${position.left}, ${chrome.i18n.getMessage('windowPositionTop')}: ${position.top}`;
  row.children[2].textContent = `${size.width} x ${size.height}`;
  currentPrefs.urlFilterList[index].url = url;
  currentPrefs.urlFilterList[index].position = position;
  currentPrefs.urlFilterList[index].size = size;
}

const addUrlFilter = (url, position, size, index) => {
  let urlFilterList = document.getElementById('urlFilterList');
  let li = document.createElement('li');
  if(index === undefined)
    index = currentPrefs.urlFilterList.length;
  li.setAttribute('index', index);
  li.classList.add('tableRow');
  addRowItemCell(li, ['cellUrl'], url);
  addRowItemCell(
    li,
    ['cellPosition'],
    position ? (['0', '1', '2', '3', '4'].includes(position) ?
      chrome.i18n.getMessage(positionMapping[position]) :
      `${chrome.i18n.getMessage('windowPositionLeft')}: ${position.left}, ${chrome.i18n.getMessage('windowPositionTop')}: ${position.top}`) :
    ''
  );
  addRowItemCell(li, ['cellSize'], size ? `${size.width} x ${size.height}` : '');

  let edit = addRowItemCell(li, ['cellEdit','cellButton'], null, clickOnRowButton);
  edit.setAttribute('custom', true);
  addRowItemCell(li, ['cellDelete','cellButton'], null, clickOnRowButton);
  li.addEventListener('click', clickOnRowItem, false);
  li.addEventListener('dblclick', clickOnRowButton, false);
  let lastChild = urlFilterList.querySelector('li:last-of-type');
  urlFilterList.insertBefore(li, lastChild);
  tableRowItems.urlFilterList.push(li);
}

const startup = () => {
  tableRowButtons = Array.from(document.querySelectorAll('.cellButton'));
  tableRowButtons.forEach(tableRowButton => {
    tableRowButton.addEventListener('click', clickOnRowButton, true);
  });
  screenMask = document.getElementById('screenMask');
  urlFilterEditor = document.getElementById('urlFilterEditor');

  screenMask.addEventListener('click', event => {
    hideScreenMask();
  }, false);

  Array.from(document.querySelectorAll('.btnCancel')).forEach(btn => {
    btn.addEventListener('click', event => {
      hideScreenMask();
    }, false);
  });

  Array.from(document.querySelectorAll('.btnAccept')).forEach(btn => {
    btn.addEventListener('click', event => {
      let dlgName = event.target.getAttribute('dlgName');
      if(dlgName === 'urlFilterEditor') {
        const newFilterUrl = document.getElementById('newFilterUrl');
        const defaultPosition = document.getElementById('defaultPosition');
        const positionLeftNode = document.getElementById('windowPositionLeft');
        const positionTopNode = document.getElementById('windowPositionTop');
        const widthNode = document.getElementById('windowWidth');
        const heightNode = document.getElementById('windowHeight');
        const index = parseInt(newFilterUrl.getAttribute('index'));
        const url = newFilterUrl.value;
        const position = defaultPosition.value !== '5' ?
          defaultPosition.value :
          { left: Number(positionLeftNode.value), top: Number(positionTopNode.value) };
        const size = { width: Number(widthNode.value), height: Number(heightNode.value) };

        if(index === -1) {
          addUrlFilter(url, position, size);
          currentPrefs.urlFilterList.push({url, position, size});
        }
        else {
          modefyUrlFilter(url, position, size, index);
        }
        sendVelueChangeMessage('urlFilterList', currentPrefs.urlFilterList);
        hideScreenMask();
      }
    }, false);
  });

  document.getElementById('btnAddUrlFilter').addEventListener('click', event => {
    showUrlFilterEditor('', '0', {width: 500, height: 400}, -1);
  }, false);
  document.getElementById('btnMoveUp').addEventListener('click', event => {
    moveUrlFilterPos(-1);
  }, false);
  document.getElementById('btnMoveDown').addEventListener('click', event => {
    moveUrlFilterPos(+1);
  }, false);

  document.getElementById('newFilterUrl').addEventListener('input', checkFilterEditorInput, false);
  document.getElementById('windowPositionLeft').addEventListener('input', checkFilterEditorInput, false);
  document.getElementById('windowPositionTop').addEventListener('input', checkFilterEditorInput, false);
  document.getElementById('windowWidth').addEventListener('input', checkFilterEditorInput, false);
  document.getElementById('windowHeight').addEventListener('input', checkFilterEditorInput, false);
  document.getElementById('defaultPosition').addEventListener('change', onDefaultPositionChange);
}

const setValueToElem = (id, value) => {
  let elem = document.getElementById(id);
  if(elem) {
    let elemType = elem.getAttribute('type');
    if(elemType === 'radioGroup') {
      let radios = Array.from(elem.querySelectorAll('input[name='+id+']'));
      for(let radio of radios) {
        if(parseInt(radio.getAttribute('value')) === value) {
          radio.checked = true;
          break;
        }
      }
    }
    else if(elemType === 'checkbox') {
      elem.checked = value;
    }
    else if(elemType === 'color' || elemType === 'number' || elemType === 'text') {
      elem.value = value;
    }
    else if(elemType === 'listBox') {
      for(let i = 0; i < value.length; ++i) {
        addUrlFilter(value[i].url, value[i].position, value[i].size, i);
      }
    }
  }
}

const getValueFromElem = (id) => {

}

const sendVelueChangeMessage = (id, value) => {
  if(value === undefined) {
    delete currentPrefs[id];
  }
  else if(typeof value === 'object') {
    let update = {};
    update[id] = value;
    chrome.storage.local.set(update);
  }
  else {
    if(currentPrefs[id] !== value) {
      currentPrefs[id] = value;
      let update = {};
      update[id] = value;
      chrome.storage.local.set(update);
    }
  }
}

const handleVelueChange = (id) => {
  let elem = document.getElementById(id);
  if(elem) {
    let elemType = elem.getAttribute('type');
    if(elemType === 'radioGroup') {
      let radios = Array.from(elem.querySelectorAll('input[name='+id+']'));
      for(let radio of radios) {
        radio.addEventListener('input', event => {if(radio.checked)sendVelueChangeMessage(id, parseInt(radio.getAttribute("value")));});
      }
    }
    else if(elemType === 'checkbox') {
      elem.addEventListener('input', event => {sendVelueChangeMessage(id, elem.checked);});
    }
    else if(elemType === 'color') {
      elem.addEventListener('input', event => {sendVelueChangeMessage(id, elem.value);});
    }
    else if(elemType === 'number') {
      elem.addEventListener('input', event => {sendVelueChangeMessage(id, parseInt(elem.value));});
    }
    else if(elemType === 'text') {
      elem.addEventListener('input', event => {sendVelueChangeMessage(id, elem.value);});
    }
  }
}

const onDefaultPositionChange = () => {
  let defaultPosition = document.getElementById('defaultPosition');
  let elems = Array.from(document.querySelectorAll('.windowPosition'));

  if(defaultPosition.value === '5') {
    elems.forEach(tag => {
      tag.classList.add('show');
      tag.classList.remove('hidden');
    });
  } else {
    elems.forEach(tag => {
      tag.classList.add('hidden');
      tag.classList.remove('show');
    });
  }
  checkFilterEditorInput();
}

const init = preferences => {
  currentPrefs = preferences;
  for(let p in preferences) {
    setValueToElem(p, preferences[p]);
    handleVelueChange(p);
  }
  document.title = chrome.i18n.getMessage('optionPageTitle');
  const l10nTags = Array.from(document.querySelectorAll('[data-l10n-id]'));
  l10nTags.forEach(tag => {
    tag.textContent = chrome.i18n.getMessage(tag.getAttribute('data-l10n-id'));
  });
}

window.addEventListener('load', event => {
  chrome.storage.local.get(results => {
    if ((typeof results.length === 'number') && (results.length > 0)) {
      results = results[0];
    }
    if (results.version) {
      init(results);
      startup();
      chrome.runtime.sendMessage('PopupWindow@ettoolong', {action: 'ack'}, response => {
        if(response && response.result === 'ok') {
          // console.log('ok');
        } else {
          // console.log('failed');
          let notes = Array.from(document.querySelectorAll('.note'));
          for(let note of notes) {
            note.classList.remove('hidden');
          }
        }
      });
    }
  });
}, true);

window.addEventListener('contextmenu', event => {
  event.stopPropagation();
  event.preventDefault();
}, true);

window.addEventListener('keydown', event => {
  if(event.key === 'Escape') {
    hideScreenMask();
  }
}, true);
