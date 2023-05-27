const url = await GetUrl(); //Récupération url serveur

async function CheckLogin(email, pwd) // Vérification login
{
    let UserLogin = `{"email": "${email}","password": "${pwd}"}`;
    let response = await fetch(`${url}users/login`, {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json;charset=utf-8'
      },
    body: UserLogin
    });
    let login = await response.json();

    return (login);
}

async function CheckInputs() // Vérification valeur saisies
{
    const email = document.getElementById('email').value.trim();
    const pwd = document.getElementById('pwd').value.trim();
    

    if(email !== "" && pwd !== "")
    {
        let login = await CheckLogin(email, pwd);

        if(login.userId==1)
        {
            window.sessionStorage.setItem("token", `${login.token}`); 
            window.location.href='index.html';
        }
        else
        {
            alert("Erreur dans l’identifiant ou le mot de passe");
        }
    }
}

document.getElementById('connect').addEventListener("click", (event) => {
    event.preventDefault();
    event.stopPropagation();
    CheckInputs();
}) 
