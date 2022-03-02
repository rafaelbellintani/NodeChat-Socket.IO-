const socket = io()

const $formMessage = document.querySelector('form')
const $inputMessage = document.querySelector('input')
const $messageformButton = document.querySelector('#send')
const $messageLocationButton = document.querySelector('#send-location')
const $messages = document.querySelector('#messages')

//Templates
const $messageTemplate = document.querySelector('#message-template').innerHTML
const $locationTemplate = document.querySelector('#location-template').innerHTML
const $sidebarTemplate = document.querySelector('#sidebar-template').innerHTML

const autoscroll = () => {
    // New message element
    const $newMessage = $messages.lastElementChild

    // Height of the new message
    const newMessageStyles = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin
    

    // Visible height
    const visibleHeight = $messages.offsetHeight

    // Height of messages container
    const containerHeight = $messages.scrollHeight

    // How far have i scrolled?
    const scrollOffset = $messages.scrollTop + visibleHeight

    if (containerHeight - newMessageHeight <= scrollOffset) {
        $messages.scrollTop = $messages.scrollHeight
    }
}

socket.on('message', (message) => {
    const html = Mustache.render($messageTemplate, {
        username: message.username,
        message: message.text,
        createdAt: moment(message.createdAt).format('kk:mm:ss')
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoscroll()
})

socket.on('locationMessage', (location) => {
    console.log(location)
    const html = Mustache.render($locationTemplate, {
        username: location.username,
        url: location.link,
        createdAt: moment(location.createdAt).format('kk:mm:ss')
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoscroll()
})

socket.on('roomData', ({ room, users}) => {
    const html = Mustache.render($sidebarTemplate, {
        room,
        users
    })
    document.querySelector('#sidebar').innerHTML = html
})

$formMessage.addEventListener('submit', (e)=>{
    e.preventDefault()
    $messageformButton.setAttribute('disabled', 'disabled')

    socket.emit('newMessage', $inputMessage.value, (error) => {
      $messageformButton.removeAttribute('disabled')
      $inputMessage.value = ''
      $inputMessage.focus()

      if (error) {
          return console.log(error)
      }

      console.log('The message was delivered!')
     })
    
})

$messageLocationButton.addEventListener('click', ()=>{
    if(!navigator.geolocation){
        return alert('Geolocation is not supported by your browser!')
    }

    $messageLocationButton.setAttribute('disabled','disabled')

    navigator.geolocation.getCurrentPosition((position)=>{
        const latitude = position.coords.latitude
        const longitude = position.coords.longitude

        const coordinates = {
            latitude,
            longitude
        }
        
        socket.emit('sendLocation', coordinates, (message) => {
            $messageLocationButton.removeAttribute('disabled')
            console.log(message)
        })
    })
})

