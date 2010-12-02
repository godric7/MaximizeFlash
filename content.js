function hasClass(e,c) {return e.className.match(new RegExp('(\\s|^)'+c+'(\\s|$)'));}
function addClass(e,c) {if (!this.hasClass(e,c)) e.className+=' '+c;}
function removeClass(e,c) {if (hasClass(e,c)) {e.className=e.className.replace(new RegExp('(\\s|^)'+c+'(\\s|$)'),' ');}}

FLASH_TYPE = 'application/x-shockwave-flash'
HIDDEN_CLASS = 'maximizeFlashHiddenObject'
MAXIMIZED_CLASS =  'maximizeFlashMaxmizedObject'
FLASHZONE_CLASS = 'maximizeFlashFlashZone'
NOSCROLLBODY_CLASS = 'noScrollBody'

toogle = false
imBusy = false
flashZones = []

// Resize flash object to fit windows size
// This is meant to be call by the onclick event
function maximizeFlash(w) {
  document.body.appendChild(w.target.$e)
  addClass(w.target.$e, MAXIMIZED_CLASS) 
  addClass(document.body, NOSCROLLBODY_CLASS)
  removeClass(w.target.$e, HIDDEN_CLASS)
  window.scrollTo(0,0)
}

// Restore flash object where and how it was
function restoreFlash(z) {
  removeClass(document.body, NOSCROLLBODY_CLASS)
  removeClass(z.$e, MAXIMIZED_CLASS)
  z.parentNode.insertBefore(z.$e, z.nextSibling)
}


// Add a click-able div over the flash object (z)
// Hide Flash object
function setFlashZone(e) {
  var z = document.createElement("div") 
  z.$e = e

  var style = getComputedStyle(e)
  z.className = FLASHZONE_CLASS 
  z.style['background-image'] = 'url(\''+chrome.extension.getURL('maximize-128-white.png')+'\')'
  z.style['height'] = parseInt(style.height) - 10 + 'px'
  z.style['width'] = parseInt(style.width) - 10 + 'px'
  z.style['left'] = style.left;
  z.style['top'] = style.top; 
  z.style['vertical-align'] = style['vertical-align'];
  z.onclick = maximizeFlash

  e.parentElement.insertBefore(z, e)
  addClass(e, HIDDEN_CLASS)
  flashZones.push(z)
}

// Call setFlashZones for each flash object
function setFlashZones() {
  objs = document.querySelectorAll('embed,object')
  for (i in objs) {
    if (objs[i].type == FLASH_TYPE) 
      setFlashZone(objs[i])
  }
  toogle = true
  chrome.extension.sendRequest({method: 'setMinimizeIcon'})  
}

// Remove each flash placeholder, zone, and show flash object
function unsetFlashZones() {
  for (i in flashZones) { 
    z = flashZones[i]
    if (hasClass(z.$e, MAXIMIZED_CLASS))
      restoreFlash(z)
    z.parentNode.removeChild(z)
    removeClass(z.$e, HIDDEN_CLASS)   
  }
  flashZones = []
  toogle = false 
  chrome.extension.sendRequest({method: 'setMaximizeIcon'})
}

// Catch the request sent when the pageaction icon is clicked
chrome.extension.onRequest.addListener(
  function(request, sender, sendResponse) {
    if (request.method == 'toogleFlashZones' && imBusy == false) {
      imBusy = true
      if (toogle == false)
        setFlashZones()
      else
        unsetFlashZones()
      imBusy = false
    }
  });

chrome.extension.sendRequest({method: 'showIcon'})

