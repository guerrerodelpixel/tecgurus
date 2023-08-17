class User { // eslint-disable-line
  constructor () {}
  save (name, isLoged, token, provider, im) {
    const user = {
      name,
      token,
      isLoged,
      provider
    }
    localStorage.setItem('user', JSON.stringify(user))
    localStorage.setItem('user_im', im)
  }

  get () {
    const data = localStorage.getItem('user')
    if (data) return JSON.parse(data)
    return undefined
  }

  remove () {
    localStorage.removeItem('user')
    localStorage.removeItem('user_token')
    localStorage.removeItem('user_im')
  }

  saveAnnonimous (data) {
    localStorage.setItem('user_im', data.im)
    localStorage.setItem('user_token', data.token)
  }

  isAnonymousPresent () {
    const user_im = localStorage.getItem('user_im')
    const user_token = localStorage.getItem('user_token')
    if (user_im && user_token) return true
    return false
  }

  getUserIm () {
    const data = localStorage.getItem('user_im')
    if (data) return data
    return undefined
  }

  getUserToken () {
    const data = localStorage.getItem('user_token')
    if (data) return data
    return undefined
  }
}

class Device { // eslint-disable-line
  getDeviceType () {
    const ua = navigator.userAgent
    if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
      return 'tablet'
    }
    if (
      /Mobile|iP(hone|od)|Android|BlackBerry|IEMobile|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(
        ua
      )
    ) {
      return 'mobile'
    }
    return 'desktop'
  }

  getOS () {
    const userAgent = window.navigator.userAgent
    const platform = window.navigator.platform
    const macosPlatforms = ['Macintosh', 'MacIntel', 'MacPPC', 'Mac68K']
    const windowsPlatforms = ['Win32', 'Win64', 'Windows', 'WinCE']
    const iosPlatforms = ['iPhone', 'iPad', 'iPod']
    let os = null

    if (macosPlatforms.indexOf(platform) !== -1) {
      os = 'Mac OS'
    } else if (iosPlatforms.indexOf(platform) !== -1) {
      os = 'iOS'
    } else if (windowsPlatforms.indexOf(platform) !== -1) {
      os = 'Windows'
    } else if (/Android/.test(userAgent)) {
      os = 'Android'
    } else if (!os && /Linux/.test(platform)) {
      os = 'Linux'
    }

    return os
  }
}

let key = document.getElementById('azpartners_sdk').dataset.clientid
if(!key) {
  if (document.querySelector('.loginAzteca')) {
    key = document.querySelector('.loginAzteca').getAttribute('key')
  }
}
const apiKey = 'bB6UbsL4JuOpbGF8E6EnqVAXg3SGT54mhExUPnUZR'
const baseUrl = 'https://qn7ubxj566.execute-api.us-east-1.amazonaws.com/dev'
const postBaseUrl = 'https://f2hrjgpiik.execute-api.us-east-1.amazonaws.com/dev2'
const user = new User() // eslint-disable-line
const deviceInfo = new Device() // eslint-disable-line

let moduleConfigs = null
let responseData
let im // eslint-disable-line

/* fetch */
async function GET () {
  try {
    const response = await fetch(`${baseUrl}/public/partner/${key}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey
      }
    })
    const json = await response.json()
    if (response.status <= 299) return { data: json, error: null }
    return { data: null, error: json }
  } catch (error) {
    return { data: null, error }
  }
}
async function POST (url, body) {
  try {
    const response = await fetch(postBaseUrl + url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': '9A5A65a121284662a3E56467bae962C5N6gJo'
      },
      body: JSON.stringify(body)
    })
    const json = await response.json()
    if (response.status <= 299) return { data: json, error: null }
    return { data: null, error: json }
  } catch (error) {
    return { data: null, error }
  }
}
// Beginning
getModuleConfigs()
createLogout()
Promise.resolve(GET())
  .then((res) => {
    responseData = res?.data ?? undefined
  })
  .then(async () => {
    // const user = new User()
    if (responseData) {
      if (responseData?.config?.login_anonymous && responseData?.status) {
        if (!user.isAnonymousPresent()) {
          const response = await anonimousLogin()
          if (response?.data) user.saveAnnonimous(response.data)
          responseData = {
            ...responseData,
            ...(Boolean(response?.data?.im) && { im: response?.data?.im })
          }
          im = response?.data?.im || undefined
        } else {
          im = user.getUserIm() ?? undefined
        }
      }
    } else {
      const container = document.querySelector('.aztecaContainer')
      if (container) {
        container.style.display = 'none'
      }
      user.remove()
    }
  })
  .finally(() => {
    // const user = new User()
    const info = user.get()
    if (responseData) {
      if (responseData.config.facebook_client_app_id) FacebookScript()
      if (responseData.config.google_secret_app_id) GoogleScript()
      if (responseData.customJS) CustomJS()
      if (responseData.customCSS) CustomCSS()
    }
    if (!info) AztecaLogin()
    else AztecaLogout()
  })

/* edit Google button */
setTimeout(() => changeGoogleText(), 800)
setTimeout(() => changeGoogleText(), 1500)
setTimeout(() => changeGoogleText(), 2500)
setTimeout(() => changeGoogleText(), 3800)

/* Azteca functions */
function getModuleConfigs (){
  const container = document.querySelector('.aztecaContainer')
  if (container && container.dataset.configs) {
    try {
      moduleConfigs = JSON.parse(container.dataset.configs)
    } catch (error) {
      console.warn('[Partners Service] Couldn\'t get configs from element:', error)
    }
  }
}

/* Login/Logout buttons */
function createLogout () {
  const container = document.querySelector('.aztecaContainer')

  if (container) {
    let staticPanel = false
    if (moduleConfigs) staticPanel = moduleConfigs?.static

    if (!staticPanel) container.style.display = 'inline-block'

    const loginButton = document.createElement('button')
    loginButton.classList.add('loginAzteca', 'azButton')
    loginButton.innerText = 'Iniciar Sesión'
    container.appendChild(loginButton)
    if (staticPanel) loginButton.style.display = 'none'

    const logoutButton = document.createElement('button')
    logoutButton.style.display = 'none'
    logoutButton.id = 'logoutAzteca'
    logoutButton.classList.add('loginAzteca', 'azButton')
    container.appendChild(logoutButton)
  }
}

const closeModal = () => {
  const body = document.body
  const modal = document.getElementById('modalAzteca')
  body.style.overflow = 'auto'
  modal.style.display = 'none'
}

/* Login Panel */
function renderModal () {
  const render = document.getElementById('modalAzteca')
  if (!render) {
    /* body and button */
    const modalWidth = 442
    const modalHeight = 242
    const loginButton = document.querySelector('.loginAzteca')
    const body = document.body
    const container = document.querySelector('.aztecaContainer')
    let staticPanel = false
    if (moduleConfigs) staticPanel = moduleConfigs?.static

    /* components methods */
    const getY = () => {
      if (!loginButton || staticPanel) return '0'
      const parentY = loginButton.offsetTop
      const parentHeight = loginButton.offsetHeight
      const windowHeight = window.innerHeight
      if (parentHeight + modalHeight + parentY < windowHeight) { return `${parentY + parentHeight + 10}px` }
      return `${parentY - modalHeight - 10}px`
    }
    const getX = () => {
      if (!loginButton || staticPanel) return '0'
      const parentX = loginButton.getBoundingClientRect().left + 10
      const windowWidth = window.innerWidth
      const restPixels = modalWidth - loginButton.offsetWidth
      if (parentX + modalWidth >= windowWidth) { return `${parentX - restPixels}px` }
      return `${parentX}px`
    }

    /* components */
    const exitIcon = () => {
      const xmlns = 'http://www.w3.org/2000/svg'
      const line = (x1, y1, x2, y2) => {
        const newLine = document.createElementNS(xmlns, 'line')
        newLine.setAttribute('x1', x1)
        newLine.setAttribute('x2', x2)
        newLine.setAttribute('y1', y1)
        newLine.setAttribute('y2', y2)
        newLine.setAttribute('stroke', '#333333')
        newLine.setAttribute('stroke-width', '1.55')
        return newLine
      }
      const icon = document.createElementNS(xmlns, 'svg')
      icon.setAttributeNS(null, 'viewBox', '0 0 10 10')
      icon.appendChild(line('0', '0', '10', '10'))
      icon.appendChild(line('0', '10', '10', '0'))
      return icon
    }

    const boxContainer = () => {
      const box = document.createElement('div')
      box.id = 'boxModalAzteca'
      let boxStyles
      if (staticPanel) {
        boxStyles = 'padding:16px 16px;background:white;border-radius:3px;width:100%;max-width:600px;min-width:300px;display:flex;flex-direction:column;row-gap:16px;font-family:sans-serif;color:#333333;position:relative;margin:0 auto;'
      } else {
        boxStyles = `padding:16px 16px;background:white;border-radius:19px;width:410px;box-shadow:rgb(0 0 0 / 20%) 0px 5px 5px -3px, rgb(0 0 0 / 14%) 0px 8px 10px 1px, rgb(0 0 0 / 12%) 0px 3px 14px 2px;display:flex;flex-direction:column;row-gap:16px;font-family:sans-serif;color:#333333;position:absolute;top:${getY()};left:${getX()};`
      }
      box.style.cssText = boxStyles
      return box
    }

    const StaticLogout = () => {
      const staticLogoutBox = document.createElement('div')
      staticLogoutBox.id = 'boxStaticLogoutAzteca'
      let staticLogoutBoxStyles = 'cursor:pointer;padding:16px 16px;background:white;border-radius:3px;width:100%;max-width:600px;min-width:300px;display:none;flex-direction:column;row-gap:16px;font-family:sans-serif;color:#333333;position:relative;margin:0 auto;'
      staticLogoutBox.style.cssText = staticLogoutBoxStyles

      const staticLogoutTitle = document.createElement('p')
      let staticLogoutTitleStyles = 'text-align:center;margin:5px;font-weight:700;font-size:18px;'
      staticLogoutTitle.style.cssText = staticLogoutTitleStyles
      staticLogoutTitle.innerHTML = 'Bienvenido, <span class="boxStaticUsername"></span>'
      staticLogoutBox.appendChild(staticLogoutTitle)

      const staticLogoutSubtitle = document.createElement('p')
      let staticLogoutSubtitleStyles = 'text-align:center;margin:0;font-size:14px;'
      staticLogoutSubtitle.style.cssText = staticLogoutSubtitleStyles
      staticLogoutSubtitle.innerHTML = 'Da click aquí para salir.'
      staticLogoutBox.appendChild(staticLogoutSubtitle)

      const staticLogoutButton = document.createElement('button')
      staticLogoutButton.id = 'staticLogoutAzteca'
      let staticLogoutButtonStyles = 'border-radius:8px;font-size:14px;padding:8px 16px;border:none;display:inline-block;width:200px;height:42px;text-transform:uppercase;cursor:pointer;margin-bottom:15px;align-self:center;'
      staticLogoutButton.style.cssText = staticLogoutButtonStyles
      staticLogoutButton.innerHTML = 'Cerrar Sesión'
      staticLogoutBox.appendChild(staticLogoutButton)

      return staticLogoutBox
    }

    const header = () => {
      const textArea = () => {
        const title = () => {
          const title = document.createElement('p')
          const titleStyles = 'text-align:center;margin:5px;font-weight:700;font-size:18px;'
          title.style.cssText = titleStyles
          title.innerHTML = 'Autenticate por única ocasión'
          return title
        }
        const subTitle = () => {
          const subTitle = document.createElement('p')
          const subTitleStyles = 'text-align:center;margin:0;font-size:14px;'
          subTitle.style.cssText = subTitleStyles
          subTitle.innerHTML = `Para disfrutar el contenido completo de ${
            responseData?.namepartner ?? ''
          }`
          return subTitle
        }
        const textArea = document.createElement('div')
        if (!staticPanel) {
          const textAreaStyles = 'flex:0.9;'
          textArea.style.cssText = textAreaStyles
        }
        textArea.appendChild(title())
        textArea.appendChild(subTitle())
        return textArea
      }
      const exitArea = () => {
        const exitArea = document.createElement('div')
        const exitAreaStyles = 'flex:0.06;height:25px;cursor:pointer;'
        exitArea.style.cssText = exitAreaStyles
        exitArea.appendChild(exitIcon())
        exitArea.onclick = closeModal
        return exitArea
      }

      const header = document.createElement('div')
      header.appendChild(textArea())
      if (!staticPanel) {
        const headerStyles = 'flex:0.2;display:flex;'
        header.style.cssText = headerStyles
        header.appendChild(exitArea())
      }
      return header
    }

    const section = () => {
      const facebookButton = () => {
        const button = document.createElement('div')
        button.className = 'fb-login-button'
        button.setAttribute('data-width', '')
        button.setAttribute('data-size', 'large')
        button.setAttribute('data-button-type', 'continue_with')
        button.setAttribute('data-layout', 'default')
        button.setAttribute('data-auto-logout-link', 'false')
        button.setAttribute('data-use-continue-as', 'false')
        button.setAttribute('onLogin', 'fbLogin()')
        return button
      }

      const googleButton = () => {
        const button = document.createElement('div')
        button.setAttribute('class', 'g_id_signin')
        button.setAttribute('data-type', 'standard')
        button.setAttribute('data-width', '250')
        return button
      }

      const section = document.createElement('div')
      const sectionStyles = 'flex:0.6;display: flex;row-gap: 12px;flex-direction: column;justify-content: center;align-items: center;'
      section.style = sectionStyles

      section.appendChild(facebookButton())
      section.appendChild(googleButton())
      return section
    }

    const footer = () => {
      const termsAndConditions = () => {
        const text = document.createElement('p')
        const link = document.createElement('a')
        link.style.textDecoration = 'none'
        link.style.color = '#125ed0'
        link.href = responseData?.config?.url_terminos ?? '#'
        link.appendChild(document.createTextNode(' Aviso de Privacidad'))
        const textStyles = 'font-size:0.8em;line-height:1.4;text-align:center;'
        text.style.cssText = textStyles
        text.appendChild(
          document.createTextNode('Al ingresar reconoces estar de acuerdo con el ')
        )
        text.appendChild(link)

        return text
      }
      const footer = document.createElement('div')
      const footerStyles = 'flex: 0.2;'
      footer.style.cssText = footerStyles
      footer.appendChild(termsAndConditions())
      return footer
    }

    const Card = () => {
      const card = boxContainer()
      card.appendChild(header())
      card.appendChild(section())
      card.appendChild(footer())
      return card
    }

    const renderLogin = () => {
      /* modal */
      const card = Card()
      const modal = document.createElement('div')
      modal.setAttribute('id', 'modalAzteca')
      modal.style.cssText = 'position:absolute;z-index:9999;top:0;left:0;width:100vw;height:100vh;display:none'

      modal.appendChild(card)
      if (!staticPanel) {
        modal.onclick = ({ target }) => card.contains(target) ? null : closeModal()
      } else {
        const staticLogout = StaticLogout()
        modal.appendChild(staticLogout)
      }

      /* render */
      if (staticPanel) {
        loginButton.style.display = 'none'
        modal.style.cssText = 'position:relative;width:100%;height:auto;display:block;margin:0 auto;padding:24px 0;'
        container.insertAdjacentElement('afterend', modal)
      } else {
        if (loginButton) body.appendChild(modal)
      }
    }
    renderLogin()
  }
}
function AztecaLogin () {
  /* body and button */
  const loginButton = document.querySelector('.loginAzteca')
  const body = document.body
  const logoutButton = document.getElementById('logoutAzteca')
  logoutButton.style.display = 'none'

  if (loginButton) {
    loginButton.style.display = 'block'
    if (responseData) {
      const data = responseData
      if (data.status && data.config?.login) {
        renderModal()
        loginButton.addEventListener(
          'click',
          () => {
            body.style.overflow = 'hidden'
            const modal = document.getElementById('modalAzteca')
            modal.style.display = 'block'
          },
          false
        )
      } else loginButton.style.display = 'none'
    } else {
      loginButton.style.display = 'none'
    }
  }
}

/* Logout */
function AztecaLogout () {
  renderModal()

  // const user = new User()
  const { name } = user.get()

  let staticPanel = false
  if (moduleConfigs) staticPanel = moduleConfigs?.static

  if (staticPanel) {
    const boxModal = document.getElementById('boxModalAzteca')
    boxModal.style.display = 'none'

    const staticLogoutBox = document.getElementById('boxStaticLogoutAzteca')
    let nameSpace = staticLogoutBox.querySelector('.boxStaticUsername')
    if (nameSpace) nameSpace.innerHTML = name
    staticLogoutBox.style.display = 'flex'
    // const logoutButton = document.getElementById('staticLogoutAzteca')
    staticLogoutBox.onclick = () => logout()
  } else {
    const modal = document.getElementById('modalAzteca')
    if (modal) closeModal()
    const loginButton = document.querySelector('.loginAzteca')
    const logoutButton = document.getElementById('logoutAzteca')
    const actionZone = document.createElement('span')
    actionZone.style.cssText = 'cursor: pointer;'
    actionZone.innerHTML = ' | Cerrar Sesion'
    const fontColor = loginButton.getAttribute('logoutFill') || '#000000'
    const styles = `
    display: block;
    background: none;
    border: none;
    color: ${fontColor};
    font-family: "Roboto", sans-serif;`
    logoutButton.style.cssText = styles
    if (loginButton) loginButton.style.display = 'none'
    logoutButton.innerHTML = name
    logoutButton.appendChild(actionZone)
    actionZone.onclick = () => logout()
  } 

  function logout () {
    // const base_url = window.location.origin
    const { provider } = user.get()
    if (provider === 'google') return signOut()
    else return fbLogout()
  }
}

function handleRedirection (userIm = false, forceReload = false, homePage = false) {
  let redirection = false
  if (moduleConfigs) {
    redirection = moduleConfigs?.redirect
  }

  if (redirection) {
    let currentUrl = window.location.search
    let urlParams = new window.URLSearchParams(currentUrl)
    let redirectParam = urlParams.has('redirect') ? urlParams.get('redirect') : null
    if (!redirectParam) {
      if (homePage) redirectParam = window.location.origin
      else if (document.referrer !== '') redirectParam = document.referrer
    }
    if (redirectParam) {
      if (userIm) redirectParam += '?im=' + userIm
      window.location.href = redirectParam
    }
  } else if (forceReload) {
    window.location.reload()
  }
}

/* google */
function GoogleScript () {
  const { config } = responseData
  const addScript = () => {
    const head = document.head
    const googleScript = document.createElement('script')
    googleScript.src = 'https://accounts.google.com/gsi/client'
    googleScript.async = true
    googleScript.defer = true
    head.appendChild(googleScript)
  }

  const authScript = () => {
    const head = document.head
    const authScript = document.createElement('script')
    authScript.src = 'https://apis.google.com/js/api.js'
    authScript.async = true
    authScript.defer = true
    head.appendChild(authScript)
  }
  const addMeta = () => {
    const head = document.head
    const googleMeta = document.createElement('div')
    googleMeta.id = 'g_id_onload'
    googleMeta.setAttribute('data-client_id', config.google_secret_app_id)
    googleMeta.setAttribute('data-callback', 'handleCredentialResponse')
    googleMeta.setAttribute('data-auto_prompt', 'false')

    head.appendChild(googleMeta)
  }
  authScript()
  addScript()
  addMeta()
}

/* google methods */
function parseJwt (token) {
  const base64Url = token.split('.')[1]
  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
  const jsonPayload = decodeURIComponent(
    window
      .atob(base64)
      .split('')
      .map(function (c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
      })
      .join('')
  )

  return JSON.parse(jsonPayload)
}

function handleCredentialResponse (response) {
  const data = parseJwt(response.credential)
  if (data.name) {
    // const user = new User()
    login('googlev2', response.credential).then((e) => {
      user.save(data.name, true, response.credential, 'google', e.data.user.im)
      AztecaLogout()
      handleRedirection(e.data.user.im)
    })
  } else {
    console.log('error')
  }
}
window.handleCredentialResponse = handleCredentialResponse

function signOut () {
  // const user = new User()
  // const homePage = window.location.origin
  if (window.gapi?.auth2?.getAuthInstance()) {
    const auth2 = window.gapi.auth2.getAuthInstance()
    auth2.signOut().then(function () {
      user.remove()
      AztecaLogin()
      handleRedirection(false, true)
      // window.location.href = homePage
    })
  } else {
    user.remove()
    AztecaLogin()
    handleRedirection(false, true)
    // window.location.href = homePage
  }
}
function changeGoogleText () {
  const buttoncontainer = document.querySelector('.abcRioButtonContents')
  if (buttoncontainer) {
    buttoncontainer.style.cssText =
      buttoncontainer.style.cssText + ';font-size: 16px;margin-right:37px'
    const buttonLabels = buttoncontainer.getElementsByTagName('span')
    buttonLabels[0].innerHTML = 'Continuar con Google'
    buttonLabels[1].innerHTML = 'Logueado con Google'
  }
}

/* Facebook */
function FacebookScript () {
  const fbDiv = document.createElement('div')
  fbDiv.id = 'fb-root'
  const addScript = () => {
    const { config } = responseData
    const body = document.body
    const facebookScript = document.createElement('script')
    facebookScript.async = true
    facebookScript.defer = true
    facebookScript.crossOrigin = 'anonymous'
    facebookScript.src = `https://connect.facebook.net/es_ES/sdk.js#xfbml=1&version=v13.0&appId=${config.facebook_client_app_id}&autoLogAppEvents=1`
    facebookScript.nonce = 'qrVQajmn'
    body.insertBefore(facebookScript, body.firstChild)
    body.insertBefore(fbDiv, body.firstChild)
  }
  addScript()
}
/* facebook methods */

window.fbAsyncInit = function () {
  const { config } = responseData
  window.FB.init({
    appId: config?.facebook_client_app_id,
    autoLogAppEvents: true,
    xfbml: true,
    version: 'v13.0'
  })
}
function fbLogin () {
  window.FB.login(
    function (response) {
      // handle the response
      if (response?.status === 'connected') {
        const { authResponse } = response
        window.FB.api('/me', { fields: 'name, email' }, function (response) {
          login('facebook', authResponse.accessToken, response).then((e) => {
            // const user = new User()
            user.save(
              response.name ?? '',
              true,
              authResponse.accessToken,
              'facebook',
              e.data.user.im
            )
            AztecaLogout()
            handleRedirection(e.data.user.im)
          })
        })
      }
    },
    { scope: 'email', return_scopes: true }
  )
}
window.fbLogin = fbLogin

const removeAll = () => {
  // const homePage = window.location.origin
  // const user = new User()
  user.remove()
  AztecaLogin()
  // window.location.href = homePage
  handleRedirection(false, true)
}
function fbLogout () {
  window.FB.getLoginStatus(function (response) {
    if (response.status === 'connected') {
      window.FB.logout(function () {
        removeAll()
      })
    } else removeAll()
  })
}
/* services */
async function login (provider, token, data = {}) {
  // const deviceInfo = new Device()
  const { url, channelid, im } = responseData // eslint-disable-line
  const isFB = !!(provider && provider !== 'googlev2')
  const body = {
    provider: {
      type: provider,
      token
    },
    data_user: {
      fullname: isFB ? data.name : null,
      email: isFB ? data.email : null,
      phone_number: null,
      im: im ?? null
    },
    data_device: {
      channelId: channelid,
      device: deviceInfo.getDeviceType(),
      deviceType: deviceInfo.getDeviceType(),
      deviceId: null,
      deviceIdType: null,
      deviceModel: deviceInfo.getOS(),
      operative_system: deviceInfo.getOS(),
      adid: null,
      idfa: null
    },
    origin_url: null
  }
  const response = await POST('/login', body)
  return response
}

async function anonimousLogin () {
  // const deviceInfo = new Device()
  const { url, channelid } = responseData
  const body = {
    data_device: {
      channelId: channelid,
      device: deviceInfo.getDeviceType(),
      deviceType: deviceInfo.getDeviceType(),
      deviceId: '',
      deviceIdType: '',
      deviceModel: deviceInfo.getOS(),
      operative_system: deviceInfo.getOS(),
      adid: null,
      idfa: null
    },
    origin_url: url
  }
  const response = await POST('/login/anonymous', body)
  return response
}

function CustomCSS () {
  const css = responseData.customCSS 
  const style = document.createElement('style')
  style.id = 'loginAzteca_customCSS'
  style.innerHTML = css
  document.head.appendChild(style)
}

function CustomJS () {
  const js = responseData.customJS
  const script = document.createElement('script')
  script.id = 'loginAzteca_customJS'
  script.innerHTML = js
  script.async = 'async'
  document.body.appendChild(script)
}

/*Render Pixel*/
const providerDomain = 'www.tvazteca.com'
function renderPixel () {
  /*
  let charList = 'abcdefghijklmnopqrstuvwxyz0123456789'
  let randStr = '?'
  for (let i = 0; i < 6; i++) {
    randStr += charList.charAt(Math.floor(Math.random() * charList.length))
  }
  let uncachedUrl = 'https://' + providerDomain + '/adp.html' + randStr
  */
  let pixelUrl = 'https://' + providerDomain + '/adp.html'

  const iframe = document.createElement('iframe')
  iframe.id = 'Azteca-DataPixel'
  iframe.src = pixelUrl // uncachedUrl
  iframe.style.cssText = 'position:absolute;width:1px;height:1px;opacity:0;z-index:-1;bottom:0;right:0;pointer-events:none'

  if (document.readyState !== 'loading') {
    pixelListener(providerDomain)
    document.body.appendChild(iframe)
  } else {
    document.addEventListener('DOMContentLoaded', function () {
      pixelListener(providerDomain)
      document.body.appendChild(iframe)
    })
  }
}

function pixelListener (domain) {
  // const user = new User()
  window.addEventListener('message', (event) => {
    if (event.origin !== 'https://' + domain) {
      return
    }
    if (typeof event.data === 'string') {
      var base64regex = /^([0-9a-zA-Z+/]{4})*(([0-9a-zA-Z+/]{2}==)|([0-9a-zA-Z+/]{3}=))?$/
      if (base64regex.test(event.data)) {
        const decoded = window.atob(event.data)
        try {
          const dataParsed = JSON.parse(decoded)
          if (dataParsed.id === 'fingerprint') {
            let localIM = user.getUserIm() // eslint-disable-line
            let localStatus = 'anonymous'

            if (!user.isAnonymousPresent()) { // eslint-disable-line
              let localData = user.get() // eslint-disable-line
              localStatus = localData?.isLoged || undefined
            }

            if (dataParsed.method === 'handshake') {
              const message = JSON.stringify({
                method: 'handshake',
                id: 'fingerprint',
                im: localIM,
                status: localStatus
              })
              const encoded = window.btoa(message)
              event.source.postMessage(encoded, 'https://' + domain)
            } else if (dataParsed.method === 'globalIm') {
              if (dataParsed.im !== localIM) {
                let data = {}
                data.im = dataParsed.im
                data.token = dataParsed.token
                user.saveAnnonimous(data) // eslint-disable-line
              }
            }
          }
        } catch (error) {
          console.warn('Error recibiendo Data Pixel:', error)
        }
      }
    }
  })
}
renderPixel ()
