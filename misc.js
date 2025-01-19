const mw = document.getElementById('loadingModal')

function mws(show = 1) {
    if (show == 1) {
        mw.style.display = 'flex'
    } else {
        mw.style.display = 'none'
    }
}