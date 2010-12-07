function hasClass(e,c) {return e.className.match(new RegExp('(\\s|^)'+c+'(\\s|$)'));}
function addClass(e,c) {if (!this.hasClass(e,c)) e.className+=' '+c;}
function removeClass(e,c) {if (hasClass(e,c)) {e.className=e.className.replace(new RegExp('(\\s|^)'+c+'(\\s|$)'),' ');}}

FLASH_TYPE = 'application/x-shockwave-flash'
HIDDEN_CLASS = 'maximizeFlashHiddenObject'
MAXIMIZED_CLASS =  'maximizeFlashMaxmizedObject'
FLASHZONE_CLASS = 'maximizeFlashFlashZone'
NOSCROLLBODY_CLASS = 'maximizeFlashNoScrollBody'
FLASHZONE_BUTTON_VERTICAL_CLASS = 'maximizeFlashButtonV'
FLASHZONE_BUTTON_HORIZONTAL_CLASS = 'maximizeFlashButtonH'

imBusy = false
flashZones = []
flashToOpenIntoTab = null

// Open Flash element in a new tab
function newFlashTab(w) {
  z = w.target.parentNode
  
  host = window.location.protocol+'//'+window.location.host
  flashToOpenIntoTab = z.$e.outerHTML.replace(/"\/(.*?)"/g, '"'+host+'/$1"')
  chrome.extension.sendRequest({method: 'newTab'})
}

// Resize flash object to fit windows size
// This is meant to be call by the onclick event
function maximizeFlash(w) {
  z = w.target.parentNode

  document.body.appendChild(z.$e)
  addClass(z.$e, MAXIMIZED_CLASS) 
  addClass(document.body, NOSCROLLBODY_CLASS)
  removeClass(z.$e, HIDDEN_CLASS)
  window.scrollTo(0,0)
}

// Restore flash object where and how it was
function restoreFlash(z) {
  removeClass(document.body, NOSCROLLBODY_CLASS)
  removeClass(z.$e, MAXIMIZED_CLASS)
  z.parentNode.insertBefore(z.$e, z.nextSibling)
}

// Create a click-able div (z)
// Put it over the flash object with insertBefore
// Hide Flash object by applying a custom class
function setFlashZone(e) {
  var style = getComputedStyle(e)
  _w = parseInt(style.width)
  _h = parseInt(style.height)
  if (_w < 10 || _h < 10)
    return
    
  var z = document.createElement("div") 
  z.$e = e

  z.className = FLASHZONE_CLASS 
  z.style['height'] = _h - 10 + 'px'
  z.style['width'] = _w - 10 + 'px'
  z.style['left'] = style.left;
  z.style['top'] = style.top; 

  z.$m = z.$t = document.createElement('img')
  z.$t = document.createElement('img') 
  z.$m.src = chrome.extension.getURL('maximize-white.png')
  z.$t.src = chrome.extension.getURL('newtab-white.png')
  z.$m.onclick = maximizeFlash 
  z.$t.onclick = newFlashTab

  if (_h > _w) {
    z.$m.className = z.$t.className = FLASHZONE_BUTTON_VERTICAL_CLASS
    z.$m.style['top'] = (_h / 2) - (_h * 0.35) + 'px'
    z.$t.style['top'] = (_h / 2) - (_h * 0.20) + 'px'
  }
  else {
    z.$m.className = z.$t.className = FLASHZONE_BUTTON_HORIZONTAL_CLASS
    z.$t.style['margin-left'] = _h * 0.10 + 'px';
    z.$m.style['top'] = (_h / 2) - (_h * 0.25 / 2) + 'px'
    z.$t.style['top'] = (_h / 2) - (_h * 0.25 / 2) + 'px'
  }

  z.appendChild(z.$m)
  z.appendChild(z.$t)  
  e.parentElement.insertBefore(z, e)
  addClass(e, HIDDEN_CLASS)
  flashZones.push(z)
}

// Call setFlashZones for each REAL flash object
function setFlashZones() {
  objs = document.querySelectorAll('embed,object')
  for (i in objs) {  
    if (objs[i].type == FLASH_TYPE) 
      setFlashZone(objs[i])
  }
}

// Remove each flashZone div
// If the object was maximized, restore it 
// Remove hiding class
// Flush our flashZones references  
function unsetFlashZones() {
  for (i in flashZones) { 
    z = flashZones[i]
    if (hasClass(z.$e, MAXIMIZED_CLASS))
      restoreFlash(z)
    z.parentNode.removeChild(z)
    removeClass(z.$e, HIDDEN_CLASS)   
  }
  flashZones = []
}

// Catch the request sent when the pageaction icon is clicked
chrome.extension.onRequest.addListener(
  function(request, sender, sendResponse) {
    if (imBusy == false) {
      imBusy = true 
      if (request.method == 'setFlashZones')
        setFlashZones()
      else if (request.method == 'unsetFlashZones')
        unsetFlashZones()
      imBusy = false     
    }
    if (request.method == 'sendObject' && flashToOpenIntoTab != null) {
	  chrome.extension.sendRequest({method: 'setObject', id: request.id, object: flashToOpenIntoTab})
	  flashToOpenIntoTab = null
	}
  });

chrome.extension.sendRequest({method: 'initTab'})

