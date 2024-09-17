let botaoMenu = document.getElementById('botao-abrir')
let menu = document.getElementById('menu-mobile')
let overlay1 = document.getElementById('overlay-menu1')

botaoMenu.addEventListener('click', ()=>{
    menu.classList.add('menu-abrir')
})


menu.addEventListener('click', ()=>{
    menu.classList.remove('menu-abrir')
})

overlay1.addEventListener('click', ()=>{
    menu.classList.remove('menu-abrir')
})

document.getElementById('recarregar-iframe').addEventListener('click', function() {
    let iframe = document.getElementById('meu-iframe');
    iframe.contentWindow.location.reload();
});
