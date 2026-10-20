// MODAL

const modal = document.querySelector('.modal');
const modalOpenBtn = document.querySelector('#btn-get')
const modalCloseBtn = document.querySelector('.modal_close')

const openModal = () => {
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
}

const closeModal = () => {
    modal.style.display = 'none';
    document.body.style.overflow = '';
}

modalOpenBtn.onclick = () => openModal();
modalCloseBtn.onclick = () => closeModal();

modal.onclick = (event) => {
    if (event.target.classList.contains('modal')) {
        closeModal();
    }
};

// removeEventListener()
// addEventListener('scroll')

setTimeout(() => {
    openModal();
}, 10000);

const handleScroll = () => {
    if (window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 5) {
        openModal();

        window.removeEventListener('scroll', handleScroll);
    }
};

window.addEventListener('scroll', handleScroll);


