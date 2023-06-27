const onloadScript = () => {
    const queryString = window.location.search;

    const urlParams = new URLSearchParams(queryString);
    const code = urlParams.get('code')

    let reqString = `https://www.googleapis.com/oauth2/v4/token?grant_type=authorization_code&code=${code}&client_id=746999150717-biq54dtk6o9mqejpmd9pr4i799t489it.apps.googleusercontent.com&client_secret=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&redirect_uri=http://localhost/20204750/VerifyAccount.html`;
    fecthToken(reqString)



}

const fecthToken = (req) => {
    const xhttp = new XMLHttpRequest();
    xhttp.onload = function () {
        let obj = JSON.parse(this.responseText)
        sessionStorage.setItem('access_token', obj.access_token);
        console.log(obj);
    }
    xhttp.open("POST", req, false);
    xhttp.send()
    window.location.replace('receive.html')


}


