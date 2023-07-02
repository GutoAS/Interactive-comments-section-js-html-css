import { dataDB } from "./data.js";
import { v4 as uuidv4 } from "https://jspm.dev/uuid";

document.addEventListener("click", function (e) {
  if (e.target.dataset.sendMobileBtn || e.target.dataset.sendDesktopBtn) {
    handleCurrentUserSendBtn();
  }
  if (e.target.dataset.plusBtn) {
    incrementCommentScore(e.target.dataset.plusBtn);
  }
  if (e.target.dataset.plusBtnReply) {
    incrementReplyScore(e.target.dataset.plusBtnReply);
  }
  if (e.target.dataset.minusBtnReply) {
    decrementReplyScore(e.target.dataset.minusBtnReply);
  }
  if (e.target.dataset.minusBtn) {
    decrementCommentScore(e.target.dataset.minusBtn);
  }
  if (e.target.id === "replyButton" || e.target.id === "replyButtonMobile") {
    handleReplyButtonClick();
  }
});

function handleCurrentUserSendBtn() {
  const currentUserComment = document.getElementById("currentUserComment");
  if (currentUserComment.value) {
    dataDB.comments.push({
      id: uuidv4(),
      content: currentUserComment.value,
      createdAt: "Today",
      score: 0,
      user: {
        ...dataDB.currentUser,
      },
      replies: [],
    });
    render();
    console.log(getCurrentUserComment());
  }

  currentUserComment.value = "";
}

function incrementCommentScore(id) {
  const comment = dataDB.comments.find((comment) => comment.id == id);
  comment.score++;
  render();
}

function incrementReplyScore(id) {
  dataDB.comments.forEach((comment) => {
    comment.replies.forEach((reply) => {
      if (reply.id == id) {
        reply.score++;
        render();
      }
    });
  });
}

function decrementReplyScore(id) {
  dataDB.comments.forEach((comment) => {
    comment.replies.forEach((reply) => {
      if (reply.id == id && reply.score > 0) {
        reply.score--;
        render();
      }
    });
  });
}

function decrementCommentScore(id) {
  const comment = dataDB.comments.find((comment) => comment.id == id);
  if (comment.score > 0) {
    comment.score--;
  }
  render();
}

function handleReplyButtonClick() {
  const replies = document.getElementsByClassName("replies");
  for (let i = 0; i < replies.length; i++) {
    replies[i].classList.toggle("display-none");
  }
}

function getComments() {
  let comments = "";
  dataDB.comments.forEach((comment) => {
    if (comment.user.username != "juliusomo") {
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
          <span id="replyButtonMobile">Reply</span>
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
          <button  class="bold-primary-text button-primary">
            <i class="fa-solid fa-reply icon-size"></i>
            <span id="replyButton">Reply</span>
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
    }
  });

  return comments;
}

function getReplies(id) {
  let replyHtml = "";
  const comment = dataDB.comments.find((comment) => comment.id == id);

  if (comment.replies.length > 0) {
    comment.replies.forEach((reply) => {
      replyHtml += `
<div class="replies" >
    <div class="vertical-stroke"></div>
    <div class="tweet-replies">
      <div class="user-tweet-reply" id="userTweet">
        <div class="tweet-interaction-mobile">
          <div class="increment-button">
            <i class="fa-solid fa-plus" data-plus-btn-reply="${reply.id}"></i>
            <p class="bold-primary-text">${reply.score}</p>
            <i class="fa-solid fa-minus icon-size" data-minus-btn-reply="${reply.id}"></i>
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
  document.getElementById("commentsContainerEl").innerHTML =
    getComments() + getCurrentUserComment();
}

function getCurrentUserComment() {
  let comments = "";
  dataDB.comments.forEach((comment) => {
    if (comment.user.username === "juliusomo") {
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
        <button class="bold-primary-text button-tertiary">
        <i class="fa-solid fa-trash-can icon-size"></i>
        <span>Delete</span>
        </button>
        <button class="bold-primary-text button-primary">
          <i class="fa-sharp fa-solid fa-pen icon-size"></i>
          <span>Edit</span>
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
        <div class="current-user-badge">
        <p>you</p>
        </div>
        <p class="username">${comment.user.username}</p>
        <p class="tweet-time">${comment.createdAt}</p>
        <div class="fill-button">
          <button class="bold-primary-text button-tertiary">
          <i class="fa-solid fa-trash-can icon-size"></i>
          <span>Delete</span>
          </button>
          <button class="bold-primary-text button-primary">
            <i class="fa-sharp fa-solid fa-pen icon-size"></i>
            <span>Edit</span>
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
    }
  });

  return comments;
}

render();
