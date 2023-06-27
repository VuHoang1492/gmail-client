
window.addEventListener('load', () => {
  const token = sessionStorage.getItem('access_token')






  const sendEmailWithFile = async (email, subject, file, mes) => {
    console.log(email, subject, file, mes);


    // Function để đọc file và chuyển đổi thành base64
    const readFileAsBase64 = (file) => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (event) => {
          const base64 = event.target.result.split(',')[1];
          resolve(base64);
        };
        reader.onerror = (event) => {
          reject(event.target.error);
        };
        reader.readAsDataURL(file);
      });
    };



    // Tạo nội dung email
    const emailData = {
      to: email,
      subject: subject,
      message: mes
    };

    // Định dạng nội dung email thành RFC 822


    const emailContent =
      'Content-Type: multipart/mixed; boundary=foo_bar_baz\n' +
      'MIME-Version: 1.0\n' +
      `To: ${emailData.to}\n` +
      'from: me\n' +
      `subject: =?utf-8?B?${btoa(unescape(encodeURIComponent(emailData.subject)))}?=\n\n` +
      '--foo_bar_baz\n' +
      'Content-Type: text/html; charset="UTF-8"\n' +
      'MIME-Version: 1.0\n\n' +
      `${emailData.message}\n\n` +
      '--foo_bar_baz\n' +
      `Content-Type: ${file.type}\n` +
      'MIME-Version: 1.0\n' +
      'Content-Transfer-Encoding: base64\n' +
      `Content-Disposition: attachment; filename=${file.name}\n\n` +
      `${await readFileAsBase64(file)}\n\n` +
      '--foo_bar_baz--'


    // Gửi HTTP POST request tới Gmail API

    return new Promise((res, rej) => {
      const xhr = new XMLHttpRequest();
      xhr.open('POST', 'https://gmail.googleapis.com/upload/gmail/v1/users/me/messages/send');
      xhr.setRequestHeader('Authorization', 'Bearer ' + token);
      xhr.setRequestHeader('Content-Type', 'message/rfc822');
      //   xhr.setRequestHeader('Data-Type', 'json');

      xhr.onreadystatechange = function () {
        if (xhr.readyState === XMLHttpRequest.DONE) {
          if (xhr.status === 200) {
            res(xhr.responseText)
          } else {
            rej(xhr.status)
          }
        }
      };
      xhr.send(emailContent);
    })

  }



  const sendEmailnoFile = (email, subject, mes) => {
    return new Promise((res, rej) => {
      const emailData = {
        from: 'me',
        to: email,
        subject: `=?utf-8?B?${btoa(unescape(encodeURIComponent(subject)))}?=`,
        message: mes
      };


      const createEmailContent = (emailData) => {
        const email = `From: ${emailData.from}\r\n` +
          `To: ${emailData.to}\r\n` +
          `Subject: ${emailData.subject}\r\n` +
          '\r\n' +
          emailData.message;
        const encodedEmail = btoa(unescape(encodeURIComponent(email)))
        const reallyEncodedMessage = encodedEmail.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
        const emailContent = {
          raw: reallyEncodedMessage
        };
        return JSON.stringify(emailContent);
      }
      const xhr = new XMLHttpRequest();
      xhr.open('POST', 'https://www.googleapis.com/gmail/v1/users/me/messages/send');
      xhr.setRequestHeader('Authorization', 'Bearer ' + token);
      xhr.setRequestHeader('Content-Type', 'application/json');
      xhr.onreadystatechange = function () {
        if (xhr.readyState === XMLHttpRequest.DONE) {
          if (xhr.status === 200) {
            res(xhr.responseText)
          } else {
            rej(xhr.status)
          }
        }
      };
      const emailContent = createEmailContent(emailData);
      console.log(emailContent);
      xhr.send(emailContent);
    })
  }




  const onSubmit = () => {
    const email = document.getElementById('email').value
    const subject = document.getElementById('subject').value
    const mes = document.getElementById('messages').value
    const files = document.getElementById('file-list').files

    if (email === '') {
      alert("Vui lòng nhập địa chỉ người nhận!!")
      return
    }
    if (subject === '') {
      alert("Thiếu tiêu đề!!")
      return
    }
    if (mes === '') {
      alert("Thư trống!!")
      return
    }
    if (files.length === 0) {
      const conf = confirm(`Xác nhận gửi mail cho ${email}.`)
      if (!conf) return
      sendEmailnoFile(email, subject, mes)
        .then(res => {
          console.log(res)
          alert("Gửi mail thành công!!!\nF5 hoặc kiểm tra thư spam")
          location.replace('send.html')
        })
        .catch(err => {
          if (err === 401) {
            alert('Phiên làm việc đã hết hạn\nVui lòng đăng nhập lại.')
            sessionStorage.removeItem('access_token');
            location.replace('login.html')
          }
          alert("Có lỗi xảy ra!!\nVui lòng thử lại.")
        })
    } else {
      const conf = confirm(`Xác nhận gửi mail cho ${email}.`)
      if (!conf) return
      const file = files[0]
      sendEmailWithFile(email, subject, file, mes)
        .then(res => {
          console.log(res)
          alert("Gửi mail thành công!!!\nF5 hoặc kiểm tra thư spam")
          location.replace('send.html')
        })
        .catch(err => {
          console.log(err);
          if (err === 0) {
            alert("Gửi mail thành công!!!\nF5 hoặc kiểm tra thư spam")
            location.replace('send.html')
          }
          else if (err === 401) {
            alert('Phiên làm việc đã hết hạn\nVui lòng đăng nhập lại.')
            sessionStorage.removeItem('access_token');
            location.replace('login.html')
          }
          else alert("Có lỗi xảy ra!!\nVui lòng thử lại.")
        })
    }
  }

  document.getElementById('submit-form').addEventListener('click', () => {
    onSubmit()
  })


})




