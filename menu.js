let botaoMenu = document.getElementById('botao-abrir')
let menu = document.getElementById('menu-mobile')
let overlay = document.getElementById('overlay-menu')

botaoMenu.addEventListener('click', ()=>{
    menu.classList.add('menu-abrir')
})


menu.addEventListener('click', ()=>{
    menu.classList.remove('menu-abrir')
})

overlay.addEventListener('click', ()=>{
    menu.classList.remove('menu-abrir')
})
