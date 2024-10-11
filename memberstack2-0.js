const memberstack = window.$memberstackDom
memberstack.getCurrentMember().then(({ data: member }) => {
  if (member) {
  // do logged in logic here
    // access email using: member.auth.email
    // access id using: member.id
    // access custom fields using: member.customFields["your_field_name"]
    
    console.log(member);
  } else {
    // do logged out logic here
  }
})


const token = localStorage.getItem('_ms-mid');
console.log(token);




async function GETairtable(){
      var baseId = "appxPi2CoLTlsa3qL";
      var tableId = "tbloP9XOP0eWMT9XH";
      var itemId = "recuSA6q79aU3ndO3";
      
        let token = localStorage.getItem('_ms-mid');
        let response = await fetch(`https://expoapi-zeta.vercel.app/api/row?baseId=${baseId}&tableId=${tableId}&rowId=${itemId}&token=${token}`);
        let data = await response.json();
        conslole.log(data); 
}


document.getElementById('login').onclick = function() {
GETairtable()
}
