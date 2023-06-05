document.addEventListener('DOMContentLoaded', function () {
  const headCountInput = document.getElementById('headCountPerTeam');
  const memberCheckboxes = document.querySelectorAll(
    'input[name^="switch-awayTeamParticipatingMember"]',
  );
  const errorMessage = document.createElement('p');
  errorMessage.textContent =
    '선택된 멤버의 수와 경기 참여 인원이 일치하지 않습니다!';
  errorMessage.style.color = 'red';
  errorMessage.style.marginTop = '10px';
  errorMessage.style.display = 'none';

  document.getElementById('inputMember').appendChild(errorMessage);

  function validateHeadCount() {
    const selectedMembers = Array.from(memberCheckboxes).filter(
      (checkbox) => checkbox.checked,
    );
    const headCount = Number(headCountInput.value);

    if (selectedMembers.length !== headCount) {
      errorMessage.style.display = 'block';
    } else {
      errorMessage.style.display = 'none';
    }
  }

  function getTeamMembers() {
    const memberCheckboxes = document.querySelectorAll(
      'input[name^="switch-awayTeamParticipatingMember"]:checked',
    );
    let teamMembers = Array.from(memberCheckboxes)
      .map((checkbox) => checkbox.previousElementSibling.textContent)
      .join('/');
    return teamMembers;
  }

  function handleFormSubmit(event) {
    event.preventDefault();

    const selectedMembers = Array.from(memberCheckboxes).filter(
      (checkbox) => checkbox.checked,
    );
    const headCount = Number(headCountInput.value);

    if (selectedMembers.length !== headCount) {
      errorMessage.style.display = 'block';
    } else {
      const formData = new FormData(form);
      const teamMembers = getTeamMembers();
      formData.set('awayTeamParticipatingMemberString', teamMembers);

      const urlSearchParams = new URLSearchParams();
      for (const pair of formData) {
        urlSearchParams.append(pair[0], pair[1]);
      }

      const matchId = document.getElementById('matchId').value;

      fetch(`/match/${matchId}/participant`, {
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
    }
  }

  headCountInput.addEventListener('input', validateHeadCount);
  memberCheckboxes.forEach((checkbox) =>
    checkbox.addEventListener('change', validateHeadCount),
  );

  const form = document.querySelector('form');
  form.addEventListener('submit', handleFormSubmit);
});
