const videoField = document.getElementById('video-field');
const serverHeader = document.getElementById('server-header');
const chatField = document.getElementById('chat-field');
const memberList = document.getElementById('member-list');
const containerFluid = document.getElementById('container-fluid');
const mediaInterface = document.getElementById('media-interface');

let videoDisplay = false;

function videoChat() {
    if (videoDisplay == false) {
        videoDisplay = true;
    } else {
        videoDisplay = false;
    }
}

let selectedElement = null;
function toggleClickedState(element) {
    if (selectedElement && selectedElement !== element) {
        selectedElement.classList.remove('clicked');
    }
    element.classList.add('clicked');
    selectedElement = element;
}
let selectedChannel = null;
function toggleChannelState(element) {
    if (selectedChannel && selectedChannel !== element) {
        selectedChannel.classList.remove('clicked');
    }

    element.classList.add('clicked');
    selectedChannel = element;
}

function modalToggle(element) {
    if(!(nowChannelId == -1 && element == "membersListModal")){
        const elem = document.getElementById(element);
        elem.classList.toggle('open');
    
        const bg = document.getElementById('popupBgCover');
        bg.classList.toggle('open');
    }

}



//チャットに人が入ってきたときのレイアウトを変える関数
window.addEventListener('load', () => {
    var parentDiv = document.getElementById('video-play-field');

    var mutationCallback = function (mutationsList, observer) {
        for (var mutation of mutationsList) {
            if (mutation.type === 'childList') {
                const videoElement = document.querySelectorAll('video');
                if (videoElement.length >= 3) {
                    for (let elem of videoElement) {
                        elem.classList.add('over');
                    }
                } else {
                    for (let elem of videoElement) {
                        elem.classList.remove('over');
                    }
                }
            }
        }
    };

    var observer = new MutationObserver(mutationCallback);

    var config = { childList: true, subtree: true };

    observer.observe(parentDiv, config);
})

window.addEventListener('load', () => {
    var draggableDiv = document.getElementById('draggableDiv');
    var offsetX, offsetY, isDragging = false;

    draggableDiv.style.top = 660 + 'px';
    draggableDiv.style.left = (window.outerWidth - 144) / 2 + 'px';

    // タッチダウンイベント
    draggableDiv.addEventListener('touchstart', function (e) {
        isDragging = true;
        var touch = e.touches[0];
        offsetX = touch.clientX - draggableDiv.getBoundingClientRect().left;
        offsetY = touch.clientY - draggableDiv.getBoundingClientRect().top;
        draggableDiv.style.cursor = 'grabbing';
    });

    // タッチムーブイベント
    document.addEventListener('touchmove', function (e) {
        if (!isDragging) return;

        var touch = e.touches[0];
        var x = touch.clientX - offsetX;
        var y = touch.clientY - offsetY;

        draggableDiv.style.left =`${x}px`;
        draggableDiv.style.top = `calc(${y}px - 48px)`;
    });

    // タッチアップイベント
    document.addEventListener('touchend', function () {
        isDragging = false;
        draggableDiv.style.cursor = 'grab';
    });
})

let openPage = false;
function togglePageAndJoin(element) {
    const elem = document.getElementById(element);

    if (openPage) {
        openPage = false;
        elem.classList.remove('openPage');
        joinRoom(oldRoomId);
    } else {
        openPage = true;
        elem.classList.add('openPage');
    }
    
}

function togglePage(elementId) {
    const elem = document.getElementById(elementId);
    elem.classList.toggle('openPage');

}

function closePage(element) {
    openPage = false;
    const elem = document.getElementById(element);
    elem.classList.remove('openPage');

    const bg = document.getElementById('popupBgCover');
    bg.classList.remove('open');
}

function toggleChatField() {
    document.querySelector(".chatField").classList.toggle("active");
}


//form関係
window.addEventListener('load', () => {
    const form = document.getElementById('createChannelForm');

    form.addEventListener('submit', (event) => {
        event.stopPropagation();
        event.preventDefault();

        const formData = new FormData(form);
        const options = {
            method: 'POST',
            body: formData,
        }

        const url = form.getAttribute('action');
        fetch(url, options)
        .then(response => {
            if (response.ok) {
                joinRoom(nowRoomId);
                form.reset();
                modalToggle('createChannelModal')
            } else {
                throw new Error('ネットワークエラー');
            }
        });
    })
    
    const textarea = document.getElementById('message-input');
    const chatScroll = document.getElementById('message-container');
    const sendButton = document.getElementById('send-button');
    const messageFormWrapper = document.querySelector('.message-form-wrapper');
    textarea.addEventListener('keyup', (event) => {
        
        let line = textarea.value.split('\n').length;

        if(line > 2) {
           messageFormWrapper.style.height = `${(line * 24) + 48}px`;
           let height = chatScroll.style.height;
           chatScroll.style.height = `${(line * 24) + 48 - height}px`;
        } 
    });

    textarea.addEventListener('blur', (event) => {
        let line = textarea.value.split('\n').length;
        messageFormWrapper.style.height = `${(line * 24) + 48}px`;
        let height = chatScroll.style.height;
        chatScroll.style.height = `${(line * 24) + 48 - height}px`;
    });

    sendButton.addEventListener('click', (event) => {
        messageFormWrapper.style.height = `75px`;
        chatScroll.scrollTop = chatScroll.scrollHeight;
    

    });
    

})



window.globalFunction = {};
window.globalFunction.toggleClickedState = toggleClickedState;
window.globalFunction.toggleChannelState = toggleChannelState;
window.globalFunction.videoChat = videoChat;

