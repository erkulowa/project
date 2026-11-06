// NO INVITATION: START FROM THE INVITATION PAGE

if (!localStorage.getItem('playerNumber')) {
    window.location.replace('invitation.html');
}
