

const socket = io();

//Elements
const $messageForm = document.getElementById('message-form')
const $messageFormInput = document.querySelector('input');
const $messageFormButton = document.querySelector('button');
const $sendLocationButton = document.getElementById('send-location');
const $messages =document.getElementById('messages');

//Templates
const messageTemplate = document.getElementById('message-template').innerHTML;
const locationTemplate = document.getElementById('location-template').innerHTML;
const sidebarTemplate = document.getElementById('sidebar-template').innerHTML;

//Options
const {username,room} = Qs.parse(location.search,{ignoreQueryPrefix:true})

//scroll
const autoscroll = () => {
  //New message element
  const $newMessage = $messages.lastElementChild;
  console.log($newMessage)
  //Hight of the last message
  const newMessageStyles = getComputedStyle($newMessage);
  const newMessageMargin = parseInt(newMessageStyles.marginBottom);
  const newMessageHeignt = $newMessage.offsetHeight + newMessageMargin;
  //visible height
  const visibleHeight = $messages.offsetHeight;
  //height of messages container
  const containerHeight = $messages.scrollHeight;
  //How far have I scrolled?
  const scrollOffset = $messages.scrollTop + visibleHeight

  if(containerHeight - newMessageHeignt <= scrollOffset){
    $messages.scrollTop = $messages.scrollHeight;
  }
}

//receive message and print!
socket.on('message',(message) => {
  console.log(message);
  const html = Mustache.render(messageTemplate,{
    username:message.username,
    message:message.text,
    createdAt:moment(message.createdAt).format('h:mm a')
  });
  $messages.insertAdjacentHTML('beforeend',html);
  autoscroll();
})

//recive locationURL  locationMessage Event
socket.on('locationMessage',(message) => {
  
  console.log(message);
  const html =Mustache.render(locationTemplate,{
    username:message.username,
    locationURL:message.locationURL,
    createdAt:moment(message.createdAt).format('h:mm a')
  });
  $messages.insertAdjacentHTML('beforeend',html);
  autoscroll();
});

//all users display
socket.on('roomData',({room,users}) => {
  const html = Mustache.render(sidebarTemplate,{
    room,
    users
  });
  document.getElementById('sidebar').innerHTML = html;
  
})

//message submit Event
$messageForm.addEventListener('submit',(e) => {
  e.preventDefault();

  $messageFormButton.setAttribute('disabled','disabled');


  const message = e.target.elements.message.value;

  socket.emit('sendMessage',message,(error)=> {
    $messageFormButton.removeAttribute('disabled')
    $messageFormInput.value = '';
    $messageFormInput.focus();
 
    if(error){
      return console.log(error)
    }
    console.log('Message delivered!')
  })
})

// Location botton cllik Event
$sendLocationButton.addEventListener('click',() => {
 
  if(!navigator.geolocation){
    return alert('Geolocation is not supported by your browser')
  }

  $sendLocationButton.setAttribute('disabled','desabled');

  navigator.geolocation.getCurrentPosition((position) => {

    const  {latitude,longitude} = position.coords
    socket.emit('sendLocation',{latitude,longitude},() => {
      $sendLocationButton.removeAttribute('disabled');
      console.log('Location shared!')
    });
  })
})

socket.emit('join',{username,room},(error) => {
  if(error){
    alert(error)
    location.href = '/'
  }
})


