//collapseController.js
const ctrl_registry = document.getElementById('registry_control');
const ctrl_xClose = document.getElementById('xClose');
const div_registry=document.getElementById('registry');

const buttonCtlGroups = [
  
    { button: ctrl_registry, div: div_registry },
    { button: ctrl_xClose, div: div_registry },
   

  
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
  