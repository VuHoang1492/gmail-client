window.addEventListener('load', () => {
  const queryString = window.location.search;

  const urlParams = new URLSearchParams(queryString);
  const id = urlParams.get('id')
  const token = sessionStorage.getItem('access_token')

  const view = document.getElementById('view-email')
  console.log(view);

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
  getMail(token, id).then(mail => {
    let subject
    let sender
    let receiver
    console.log(mail);
    mail.payload.headers.forEach(obj => {
      if (obj.name === 'To' || obj.name === 'to') {
        receiver = obj.value
      }
      if (obj.name === 'From' || obj.name === 'from') {
        sender = obj.value
      }
      if (obj.name === 'Subject' || obj.name === 'subject') {
        subject = obj.value
      }
    })
    const data = mail.payload.body.data;
    const parts = mail.payload.parts;
    console.log(data, parts);

    let decodedData = ''
    if (data !== undefined) {
      decodedData = atob(data.replace(/-/g, '+').replace(/_/g, '/'));
      decodedData = decodeURIComponent(escape(decodedData));
      decodedData = decodedData.replace(/\n/g, "<br>");
    }
    else {
      parts.forEach(part => {
        if (part.mimeType === 'text/plain' || part.mimeType === 'text/html') {
          let string = atob(part.body.data.replace(/-/g, '+').replace(/_/g, '/'));
          string = decodeURIComponent(escape(string));
          string = string.replace(/\n/g, "<br>");
          decodedData += string
        } else if (part.mimeType === 'multipart/alternative') {
          part.parts.forEach(mpart => {
            if (mpart.mimeType === 'text/plain' || mpart.mimeType === 'text/html') {
              let string = atob(mpart.body.data.replace(/-/g, '+').replace(/_/g, '/'));
              string = decodeURIComponent(escape(string));
              string = string.replace(/\n/g, "<br>");
              decodedData += string
            } else {
              decodedData += '<br>This is not a text or html. You can see this file in https://gmail.com<br>'
            }
          })
        }
        else {
          decodedData += '<br>This is not a text or html. You can see this file in https://gmail.com<br><br>'
        }
      })

    }

    console.log(decodedData);
    view.innerHTML = `<div class="row m-1"><h2>${subject}</h2></div>
                            <div class="row m-3">
                                <div class="col-6">From: ${sender}</div>
                                <div class="col-6">To: ${receiver}</div>
                            </div>
                            <div class="m-5">
                                ${decodedData}
                        </div>`
  }).catch(err => {
    console.log(err);
    if (err === 401) {
      alert('Phiên làm việc đã hết hạn\nVui lòng đăng nhập lại.')
      sessionStorage.removeItem('access_token');
      location.replace('login.html')
    }
  })
})