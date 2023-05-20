let defaultPreference = {
  urlFilterList: [],
  version: 1
};
let preferences = {};
let retry = 0;

const storageChangeHandler = (changes, area) => {
  if(area === 'local') {
    let changedItems = Object.keys(changes);
    for (let item of changedItems) {
      preferences[item] = changes[item].newValue;
    }
  }
};

const loadPreference = () => {
  chrome.storage.local.get(results => {
    if ((typeof results.length === 'number') && (results.length > 0)) {
      results = results[0];
    }
    if (!results.version) {
      preferences = defaultPreference;
      chrome.storage.local.set(defaultPreference, res => {
        chrome.storage.onChanged.addListener(storageChangeHandler);
      });
    } else {
      preferences = results;
      chrome.storage.onChanged.addListener(storageChangeHandler);
    }

    if (preferences.version !== defaultPreference.version) {
      let update = {};
      let needUpdate = false;
      for(let p in defaultPreference) {
        if(preferences[p] === undefined) {
          update[p] = defaultPreference[p];
          needUpdate = true;
        }
      }
      if(needUpdate) {
        update.version = defaultPreference.version;
        chrome.storage.local.set(update);
      }
    }
  });
};

const tryConnection = () => {
  chrome.runtime.sendMessage('PopupWindow@ettoolong', {action: 'ack'}, response => {
    if(response && response.result === 'ok') {
      chrome.tabs.query({windowType:'normal'}, tabs => {
        for (let tab of tabs) {
          const action = urlFilter(tab.url)
          if(action) {
            chrome.runtime.sendMessage('PopupWindow@ettoolong', {
                action: 'popupWindow',
                tabId: tab.id,
                ...action,
            });
          }
        }
      });
    } else {
      retry++;
      if(retry < 20) {
        setTimeout(tryConnection, 1000);
      }
    }
  });
}

window.addEventListener('DOMContentLoaded', event => {
  loadPreference();
  setTimeout(tryConnection, 1000);
});

const createAction = setting => {
  if (setting.position === undefined && setting.size === undefined) {
    return {}
  }
  const position = setting.position ?? '0'
  const size = setting.size ?? { width: 30, height: 30 }
  const action = {}

  let screen = window.screen;
  let width = size.width;
  let height = size.height;

  let top = screen.availTop !== undefined ? screen.availTop: screen.top;
  let left = screen.availLeft !== undefined ? screen.availLeft: screen.left;
  let sTop = top;
  let sLeft = left;
  let sWidth = screen.availWidth !== undefined ? screen.availWidth: screen.width;
  let sHeight = screen.availHeight !== undefined ? screen.availHeight: screen.height;
  if (position === '0') {
    top = sTop + Math.round((sHeight - height)/2);
    left = sLeft + Math.round((sWidth - width)/2);
  }
  else if (position === '1') {
    // DO NOTHING
  }
  else if (position === '2' || position === '3' || position === '4') {
    if (position === '2' || position === '4') {
      top = sTop + sHeight - height;
      if(top < sTop)
        top = sTop;
    }
    if (position === '3' || position === '4') {
      left = sLeft + sWidth - width;
      if(left < sLeft)
        left = sLeft;
    }
  }
  else {
    top = position.top;
    left = position.left;
  }

  action.top = top
  action.left = left
  action.width = size.width
  action.height = size.height
  return action
}

const urlFilter = url => {
  if(preferences.urlFilterList) {
    for (const filter of preferences.urlFilterList) {
      if (filter.url.includes('*')) {
        const p = filter.url.replace(/(\W)/ig, '\\$1').replace(/\\\*/ig, '*').replace(/\*/ig, '.*');
        const re = new RegExp('^' + p + '$', 'ig');
        if (url.match(re) !== null) {
          return createAction(filter);
        }
      }
      else if (url === filter.url) {
        return createAction(filter);
      }
    }
  }
  return null;
};

chrome.tabs.onUpdated.addListener( (tabId, changeInfo, tabInfo) => {
  if(changeInfo.url) {
    chrome.windows.get(tabInfo.windowId, win => {
      if (win.type === 'normal') {
        const action = urlFilter(changeInfo.url)
        if(action) {
          console.log('pop-up window');
          chrome.runtime.sendMessage('PopupWindow@ettoolong', {
            action: 'popupWindow',
            tabId: tabId,
            ...action,
          });
        }
      }
    });
  }
});
