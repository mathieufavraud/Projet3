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
    let email = document.getElementById('email').value.trim();
    let pwd = document.getElementById('pwd').value.trim();
    
    if(email=='')
    {
        alert("Mail non valide");
    }
    else if (pwd=='')
    {
        alert("Mot de passe non valide")
    }
    else 
    {
        let login = await CheckLogin(email, pwd);

        if(login.userId==1)
        {
            alert("Bienvenue Sophie !"); // peut être supprimé
            window.sessionStorage.setItem("token", `${login.token}`); // test avec sessionstorage
            window.location.href='index.html';
        }
        else
        {
            alert("Email ou mot de passe invalide");
        }
    }
}

document.getElementById('connect').addEventListener("click", (event) => {
    event.preventDefault();
    event.stopPropagation();
    CheckInputs();
}) // Gestion de l'évènement click sur le bouton de connection
