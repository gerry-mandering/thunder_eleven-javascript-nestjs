let counter = 2; // Counter to keep track of input IDs

function addNewMember() {
  const container = document.getElementById('inputMember');
  const input = document.createElement('input');
  input.className = 'input-member';
  input.type = 'text';
  input.name = 'member' + counter;
  input.id = 'member' + counter;
  input.placeholder = '팀 멤버를 입력하시오';
  input.required = true;
  container.appendChild(input);
  counter++;
}

function getTeamMembers() {
  const inputs = document.getElementsByClassName('input-member');
  let teamMembers = '';
  for (let i = 0; i < inputs.length; i++) {
    teamMembers += inputs[i].value;
    if (i !== inputs.length - 1) teamMembers += '/';
  }
  return teamMembers;
}

const form = document.querySelector('form');
const teamId = form.getElementsByClassName('teamId')[0];

form.addEventListener('submit', function (event) {
  event.preventDefault();
  const formData = new FormData(form);
  const teamMembers = getTeamMembers();
  formData.set('teamMemberString', teamMembers);

  const urlSearchParams = new URLSearchParams();
  for (const pair of formData) {
    urlSearchParams.append(pair[0], pair[1]);
  }

  fetch(`/team/${teamId.value}/edit?_method=PATCH`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: urlSearchParams.toString(),
  })
    .then((response) => {
      if (response.redirected) {
        window.location.href = response.url;
      }
    })
    .catch((error) => {
      console.error('Error:', error);
    });
});
