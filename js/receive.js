window.addEventListener('load', () => {
  const token = sessionStorage.getItem('access_token')
  const listEmail = document.getElementById('list-email')
  const getMailList = (token) => {
    return new Promise((res, rej) => {

      var xhr = new XMLHttpRequest();
      xhr.open('GET', 'https://www.googleapis.com/gmail/v1/users/me/messages?labelIds=INBOX', false);
      xhr.setRequestHeader('Authorization', 'Bearer ' + token);

      xhr.onload = function () {
        if (xhr.status === 200) {
          var response = JSON.parse(xhr.responseText);
          res(response)
        } else {
          rej(xhr.status)
        }
      };

      xhr.onerror = function () {
        rej(xhr.status)
      };

      xhr.send();

    })
  }
  const getMail = (token, id) => {
    return new Promise((res, rej) => {

      var xhr = new XMLHttpRequest();
      xhr.open('GET', `https://www.googleapis.com/gmail/v1/users/me/messages/${id}`);
      xhr.setRequestHeader('Authorization', 'Bearer ' + token);
      xhr.onreadystatechange = function () {
        if (xhr.readyState === XMLHttpRequest.DONE) {
          if (xhr.status === 200) {
            var email = JSON.parse(xhr.responseText);
            res(email)
          } else {
            rej(xhr.status)
          }
        }
      }



      xhr.onerror = function () {
        rej(xhr.status)
      };

      xhr.send();

    })
  }

  getMailList(token).then(res => {
    console.log(res);
    if (res.resultSizeEstimate === 0) {
      document.getElementById('list-email').innerHTML = '<li class="list-group-item  list-group-item-action p-3 row d-flex flex-row" role="button">Không có mail...</li>'
      return
    }
    res.messages.forEach(mail => {
      getMail(token, mail.id).then(mail => {
        console.log(mail);
        let sender
        let subject
        let snipet = mail.snippet
        mail.payload.headers.forEach(obj => {
          if (obj.name === 'From' || obj.name === 'from') {
            sender = obj.value
          }
          if (obj.name === 'Subject' || obj.name === 'subject') {
            subject = obj.value
          }
        })
        const mailCard = document.createElement('li')
        mailCard.setAttribute('class', 'list-group-item  list-group-item-action p-3 row d-flex flex-row')
        mailCard.setAttribute('role', 'button')
        mailCard.innerHTML = `<div class="col-3 text-truncate">${sender}</div>
                                      <div class="col-9 text-truncate"><strong>${subject}</strong> ${snipet}</div>`
        listEmail.appendChild(mailCard)
        mailCard.addEventListener('click', () => {
          location.replace(`view_mail.html?id=${mail.id}`)
        })
      }).catch(err => {
        console.log(err);
      })
    });
  }).catch(err => {
    document.getElementById('list-email').innerHTML = '<li class="list-group-item  list-group-item-action p-3 row d-flex flex-row" role="button">Có lỗi xảy ra...</li>'
    if (err === 401) {
      alert('Phiên làm việc đã hết hạn\nVui lòng đăng nhập lại.')
      sessionStorage.removeItem('access_token');
      location.replace('login.html')
    }
  })
})
