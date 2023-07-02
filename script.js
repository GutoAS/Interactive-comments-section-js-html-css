import { dataDB } from "./data.js";

const commentsContainerEl = document.getElementById("commentsContainerEl");

document.addEventListener("click", function (e) {
  if (e.target.dataset.sendMobileBtn || e.target.dataset.sendDesktopBtn) {
    handleCurrentUserSendBtn();
  }
  if (e.target.dataset.plusBtn) {
    incrementScore(e.target.dataset.plusBtn);
  }
  if (e.target.dataset.minusBtn) {
    decrementScore(e.target.dataset.minusBtn);
  }
});

function handleCurrentUserSendBtn() {
  const currentUserComment = document.getElementById("currentUserComment");
  if (currentUserComment.value) {
    console.log(currentUserComment.value);
  }
  currentUserComment.value = "";
}
function incrementScore(id) {
  const comment = dataDB.comments.find((comment) => comment.id == id);
  comment.score++;
  render();
}

function decrementScore(id) {
  const comment = dataDB.comments.find((comment) => comment.id == id);
  if (comment.score > 0) {
    comment.score--;
  }
  render();
}

function getComments() {
  let comments = "";
  dataDB.comments.forEach((comment) => {
    comments += `
    <div class="user-tweet" id="userTweet">
    <div class="tweet-interaction-mobile">
      <div class="increment-button">
        <i class="fa-solid fa-plus" data-plus-btn="${comment.id}"></i>
        <p class="bold-primary-text">${comment.score}</p>
        <i class="fa-solid fa-minus icon-size" data-minus-btn ="${
          comment.id
        }"></i>
      </div>
      <div class="fill-button-mobile">
        <button class="bold-primary-text button-primary">
          <i class="fa-solid fa-reply icon-size"></i>
          <span>Reply</span>
        </button>
      </div>
    </div>
    <div class="user-comment">
      <div class="username-bar">
        <img
          src="${comment.user.image.png}"
          alt="user profile image"
          class="avatar"
        />
        <p class="username">${comment.user.username}</p>
        <p class="tweet-time">${comment.createdAt}</p>
        <div class="fill-button">
          <button class="bold-primary-text button-primary">
            <i class="fa-solid fa-reply icon-size"></i>
            <span>Reply</span>
          </button>
        </div>
      </div>
      <p class="user-text-comment">
       ${comment.content}
      </p>
    </div>
  </div>
  ${getReplies(comment.id)}
    `;
  });

  return comments;
}

function getReplies(id) {
  let replyHtml = "";
  const comment = dataDB.comments.find((comment) => comment.id == id);

  if (comment.replies.length > 0) {
    comment.replies.forEach((reply) => {
      replyHtml += `
<div class="replies">
    <div class="vertical-stroke"></div>
    <div class="tweet-replies">
      <div class="user-tweet-reply" id="userTweet">
        <div class="tweet-interaction-mobile">
          <div class="increment-button">
            <i class="fa-solid fa-plus"></i>
            <p class="bold-primary-text">12</p>
            <i class="fa-solid fa-minus icon-size"></i>
          </div>
          <div class="fill-button-mobile">
            <button class="bold-primary-text button-primary">
              <i class="fa-solid fa-reply icon-size"></i>
              <span>Reply</span>
            </button>
          </div>
        </div>
        <div class="user-comment">
          <div class="username-bar">
            <img
              src="${reply.user.image.png}"
              alt="user profile image"
              class="avatar"
            />
            <p class="username">${reply.user.username}</p>
            <p class="tweet-time">${reply.createdAt}</p>
            <div class="fill-button">
              <button class="bold-primary-text button-primary">
                <i class="fa-solid fa-reply icon-size"></i>
                <span>Reply</span>
              </button>
            </div>
          </div>
          <p class="user-text-comment">
            ${reply.content}
          </p>
        </div>
      </div>
    </div>
</div> 
      `;
    });
  }
  return replyHtml;
}

function render() {
  commentsContainerEl.innerHTML = getComments();
}

render();
