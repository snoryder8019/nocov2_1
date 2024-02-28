//collapseController.js
const ctrl_gallery = document.getElementById('gallery_control');
const div_gallery=document.getElementById('gallery');
const ctrl_introContent = document.getElementById('introContent_control');
const div_introContent=document.getElementById('introContent');
const ctrl_introContentLive = document.getElementById('introContentLive_control');
const div_introContentLive=document.getElementById('introContentLive');

const buttonCtlGroups = [
    { button: ctrl_gallery, div: div_gallery },
    { button: ctrl_introContent, div: div_introContent },
    { button: ctrl_introContentLive, div: div_introContentLive },
   
   

  
  ];
  function autoClose(){
    for(let i =0;i<buttonCtlGroups.length;i++){
      buttonCtlGroups[i].div.style.display="none"
    }
  }
  
  const buttonControl= ()=> {
    console.log('buttonControl() ran');
    for (let i = 0; i < buttonCtlGroups.length; i++) {
      const btn = buttonCtlGroups[i].button;
      const div = buttonCtlGroups[i].div;
      console.log(div)
      console.log(btn)
      btn.addEventListener('click', function () {
        if (div.style.display === "block") {
          div.style.display = 'none';
        } else {
          for(let i =0;i<buttonCtlGroups.length;i++){
            buttonCtlGroups[i].div.style.display='none'
          }
                  div.style.display = 'block';
        }
      });
    }
  }
  document.addEventListener('onload', buttonControl())
  //buttonControl();
  