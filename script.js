// import { dataDB } from "./data.js";
import { v4 as uuidv4 } from "https://jspm.dev/uuid";
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import {
  getFirestore,
  collection,
  getDocs,
  updateDoc,
  doc,
  arrayUnion,
  arrayRemove,
  onSnapshot,
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyBCJajmgghMgIl8KQUJtDD4SZkPqMY2IDE",
  authDomain: "interactive-comments-sec-edba5.firebaseapp.com",
  projectId: "interactive-comments-sec-edba5",
  storageBucket: "interactive-comments-sec-edba5.appspot.com",
  messagingSenderId: "553758730490",
  appId: "1:553758730490:web:bce9b546d6d1b793354143",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const colRef = collection(db, "userData");
const userDataRef = doc(db, "userData", "Hk4VJnAuyt2wDk3DEdhY");
const currentUserData = await getDocs(colRef);

let currentUser = {};
currentUserData.forEach((users) => {
  currentUser = { ...users.data().currentUser };
});

onSnapshot(colRef, (querySnapshot) => {
  querySnapshot.forEach((doc) => {
    render(doc.data());
  });
});

//! this const store id when delete button is clicked
const commentId = {};

document.addEventListener("click", function (e) {
  const deletePrompt = document.getElementById("deletePrompt");

  if (e.target.dataset.sendMobileBtn || e.target.dataset.sendDesktopBtn) {
    handleSendCommentBtn();
  }
  if (e.target.dataset.sendReplyBtn) {
    handleSendReplyButtonClick(e.target.dataset.sendReplyBtn);
  }
  if (e.target.dataset.plusBtn) {
    incrementScore(e.target.dataset.plusBtn);
  }
  if (e.target.dataset.minusBtn) {
    decrementScore(e.target.dataset.minusBtn);
  }
  if (e.target.id === "replyButton" || e.target.id === "replyButtonMobile") {
    handleReplyButtonClick();
  }

  if (e.target.dataset.deleteCommentBtn) {
    deletePrompt.style.display = "block";
    commentId.id = e.target.dataset.deleteCommentBtn;
  }
  if (e.target.dataset.deleteReplyBtn) {
    deletePrompt.style.display = "block";
    commentId.id = e.target.dataset.deleteReplyBtn;
  }

  if (e.target.id === "cancelBtn") {
    deletePrompt.style.display = "none";
  }
  if (e.target.id === "deleteBtn") {
    handleDeleteComment(commentId.id);
    deletePrompt.style.display = "none";
  }

  if (e.target.dataset.updateCommentBtn) {
    handleUpdateComment(e.target.dataset.updateCommentBtn);
  }
  if (e.target.dataset.editCommentBtn) {
    handleEditBtnClick(e.target.dataset.editCommentBtn);
  }
});

async function handleSendCommentBtn() {
  const currentUserComment = document.getElementById("currentUserComment");
  if (currentUserComment.value) {
    const pushCommentDB = {
      id: uuidv4(),
      content: currentUserComment.value,
      createdAt: new Date().valueOf(),
      score: 0,
      user: {
        ...currentUser,
      },
      replies: [],
    };
    await updateDoc(userDataRef, {
      comments: arrayUnion(pushCommentDB),
    });
    // render();
  }
  currentUserComment.value = "";
}

function handleSendReplyButtonClick(id) {
  const textareaReply = document.getElementById("textareaReply" + id);
  let isReplied = false;
  if (textareaReply.value) {
    const pushReplyDB = {
      id: uuidv4(),
      content: textareaReply.value,
      createdAt: new Date().valueOf(),
      score: 0,
      user: {
        ...currentUser,
      },
      replies: [],
    };
    onSnapshot(colRef, (querySnapshot) => {
      querySnapshot.forEach((doc) => {
        const commentsData = doc.data().comments;
        const exactComment = commentsData.find((comment) => comment.id == id);
        const index = commentsData.indexOf(exactComment);
        const objToUpdate = commentsData[index];
        if (!isReplied) {
          objToUpdate.replies.push(pushReplyDB);
          isReplied = true;
        }
        commentsData[index] = objToUpdate;

        updateDoc(userDataRef, {
          comments: commentsData,
        });
      });
    });
  }
  textareaReply.value = "";
  // render();
}

function incrementScore(id) {
  let isScore = false;
  let score = "";

  onSnapshot(colRef, (querySnapshot) => {
    querySnapshot.forEach((doc) => {
      const commentsData = doc.data().comments;
      const exactComment = commentsData.find((comment) => comment.id == id);

      if (exactComment) {
        const index = commentsData.indexOf(exactComment);
        const objToUpdate = commentsData[index];
        score = objToUpdate.score;
        if (!isScore) {
          score++;
          isScore = true;
        }
        objToUpdate.score = score;
        commentsData[index] = objToUpdate;
      }

      commentsData.forEach((comment) => {
        comment.replies.forEach((reply) => {
          if (reply.id == id) {
            const index = comment.replies.indexOf(reply);
            const objToUpdate = comment.replies[index];
            score = objToUpdate.score;
            if (!isScore) {
              score++;
              isScore = true;
            }
            objToUpdate.score = score;
            comment.replies[index] = objToUpdate;
          }
        });
      });

      updateDoc(userDataRef, {
        comments: commentsData,
      });
      render(doc.data());
    });
  });
}

function decrementScore(id) {
  let isScore = false;
  let isZero = false;
  let score = "";

  onSnapshot(colRef, (querySnapshot) => {
    querySnapshot.forEach((doc) => {
      const commentsData = doc.data().comments;
      const exactComment = commentsData.find((comment) => comment.id == id);

      if (exactComment) {
        const index = commentsData.indexOf(exactComment);
        const objToUpdate = commentsData[index];
        score = objToUpdate.score;
        if (score == 0) {
          isZero = true;
        }
        if (!isScore && !isZero) {
          score--;
          isScore = true;
        }
        objToUpdate.score = score;
        commentsData[index] = objToUpdate;
      }

      commentsData.forEach((comment) => {
        comment.replies.forEach((reply) => {
          if (reply.id == id) {
            const index = comment.replies.indexOf(reply);
            const objToUpdate = comment.replies[index];
            score = objToUpdate.score;
            if (score == 0) {
              isZero = true;
            }
            if (!isScore && !isZero) {
              score--;
              isScore = true;
            }
            objToUpdate.score = score;
            comment.replies[index] = objToUpdate;
          }
        });
      });

      updateDoc(userDataRef, {
        comments: commentsData,
      });
      render(doc.data());
    });
  });
}

function handleReplyButtonClick() {
  const replies = document.getElementsByClassName("currentUserSendReply");
  for (let i = 0; i < replies.length; i++) {
    replies[i].classList.toggle("display-flex");
  }
}

function handleDeleteComment(id) {
  onSnapshot(colRef, (querySnapshot) => {
    querySnapshot.forEach((doc) => {
      const commentsData = doc.data().comments;
      const exactComment = commentsData.find((comment) => comment.id == id);
      if (exactComment) {
        updateDoc(userDataRef, {
          comments: arrayRemove(exactComment),
        });
      }

      commentsData.forEach((comment) => {
        comment.replies.forEach((reply) => {
          if (reply.id == id) {
            const index = comment.replies.indexOf(reply);
            comment.replies.splice(index, 1);
          }
        });
      });

      updateDoc(userDataRef, {
        comments: commentsData,
      });
      render(doc.data());
    });
  });
}

function handleUpdateComment(id) {
  const tweetContent = document.getElementById("tweetContent" + id);

  onSnapshot(colRef, (querySnapshot) => {
    querySnapshot.forEach((doc) => {
      const commentsData = doc.data().comments;
      const exactComment = commentsData.find((comment) => comment.id == id);

      if (exactComment) {
        const index = commentsData.indexOf(exactComment);
        const objToUpdate = commentsData[index];
        objToUpdate.content = tweetContent.innerText;
        commentsData[index] = objToUpdate;
      }

      commentsData.forEach((comment) => {
        comment.replies.forEach((reply) => {
          if (reply.id == id) {
            reply.content = tweetContent.innerText;
          }
        });
      });

      updateDoc(userDataRef, {
        comments: commentsData,
      });

      render(doc.data());
    });
  });
}

function handleEditBtnClick(id) {
  const tweetContent = document.getElementById("tweetContent" + id);
  const fillEditBtn = document.getElementById("fillEditBtn" + id);
  const EditMobileBtn = document.getElementById("EditMobileBtn" + id);
  tweetContent.contentEditable = true;
  fillEditBtn.classList.toggle("display-update-btn-flex");
  EditMobileBtn.classList.toggle("display-update-btn-flex");
}

function getComments(dataDB) {
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
        <p class="tweet-time">${getTimeElapsed(comment.createdAt)}</p>
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
  ${getReplies(comment.id, dataDB) + getReplyAnswer(comment.id)}
    `;
    } else if (comment.user.username === "juliusomo") {
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
        <span data-delete-comment-btn="${comment.id}">Delete</span>
        </button>
        <button class="bold-primary-text button-primary">
          <i class="fa-sharp fa-solid fa-pen icon-size"></i>
          <span data-edit-comment-btn="${comment.id}">Edit</span>
        </button>
        <button
        data-update-comment-btn="${comment.id}"
        class="button-common display-update-btn-none" id="EditMobileBtn${
          comment.id
        }">
        Update
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
        <p class="tweet-time">${getTimeElapsed(comment.createdAt)}</p>
        <div class="fill-button">
          <button class="bold-primary-text button-tertiary">
          <i class="fa-solid fa-trash-can icon-size"></i>
          <span data-delete-comment-btn="${comment.id}">Delete</span>
          </button>
          <button class="bold-primary-text button-primary">
            <i class="fa-sharp fa-solid fa-pen icon-size"></i>
            <span data-edit-comment-btn="${comment.id}">Edit</span>
          </button>
        </div>
      </div>
      <p class="user-text-comment editable-paragraph editable-paragraph-comment" id="tweetContent${
        comment.id
      }">
       ${comment.content}
      </p>
      <div class="fill-button display-update-btn-none" id="fillEditBtn${
        comment.id
      }">
              <button
                data-update-comment-btn="${comment.id}"
                class="button-common common-button-display"
              >
                Update
              </button>
        </div>
    </div>
  </div>
  ${getReplies(comment.id, dataDB)}
    `;
    }
  });
  return comments;
}

function getReplies(id, dataDB) {
  let replyHtml = "";
  const comment = dataDB.comments.find((comment) => comment.id == id);

  if (comment.replies.length > 0) {
    comment.replies.forEach((reply) => {
      if (reply.user.username != "juliusomo") {
        replyHtml += `
    <div class="replies">
        <div class="vertical-stroke"></div>
        <div class="tweet-replies">
          <div class="user-tweet-reply" id="userTweet">
            <div class="tweet-interaction-mobile">
              <div class="increment-button">
                <i class="fa-solid fa-plus" data-plus-btn="${reply.id}"></i>
                <p class="bold-primary-text">${reply.score}</p>
                <i class="fa-solid fa-minus icon-size" data-minus-btn="${
                  reply.id
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
                  src="${reply.user.image.png}"
                  alt="user profile image"
                  class="avatar"
                />
                <p class="username">${reply.user.username}</p>
                <p class="tweet-time">${getTimeElapsed(reply.createdAt)}</p>
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
      } else if (reply.user.username === "juliusomo") {
        replyHtml += `
        <div class="replies">
            <div class="vertical-stroke"></div>
            <div class="tweet-replies">
              <div class="user-tweet-reply" id="userTweet">
                <div class="tweet-interaction-mobile">
                  <div class="increment-button">
                    <i class="fa-solid fa-plus" data-plus-btn="${reply.id}"></i>
                    <p class="bold-primary-text">${reply.score}</p>
                    <i class="fa-solid fa-minus icon-size" data-minus-btn="${
                      reply.id
                    }"></i>
                  </div>
                  <div class="fill-button-mobile">
                    <button class="bold-primary-text button-tertiary">
                    <i class="fa-solid fa-trash-can icon-size"></i>
                    <span data-delete-reply-btn="${reply.id}">Delete</span>
                    </button>
                    <button class="bold-primary-text button-primary">
                      <i class="fa-sharp fa-solid fa-pen icon-size"></i>
                      <span data-edit-comment-btn="${reply.id}">Edit</span>
                    </button>
                    <button
                      data-update-comment-btn="${reply.id}"
                      class="button-common display-update-btn-none" id="EditMobileBtn${
                        reply.id
                      }">
                      Update
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
                    <div class="current-user-badge">
                      <p>you</p>
                    </div>
                    <p class="username">${reply.user.username}</p>
                    <p class="tweet-time">${getTimeElapsed(reply.createdAt)}</p>
                    <div class="fill-button">
                      <button class="bold-primary-text button-tertiary">
                      <i class="fa-solid fa-trash-can icon-size"></i>
                      <span data-delete-reply-btn="${reply.id}">Delete</span>
                      </button>
                      <button class="bold-primary-text button-primary">
                        <i class="fa-sharp fa-solid fa-pen icon-size"></i>
                        <span data-edit-comment-btn="${reply.id}">Edit</span>
                      </button>
                    </div>
                  </div>
                  <p class="user-text-comment editable-paragraph editable-paragraph-reply" id="tweetContent${
                    reply.id
                  }">
                    ${reply.content}
                  </p>
                  <div class="fill-button display-update-btn-none" id="fillEditBtn${
                    reply.id
                  }">
                          <button
                            data-update-comment-btn="${reply.id}"
                            class="button-common common-button-display"
                          >
                            Update
                          </button>
                    </div>
                </div>
              </div>
            </div>
        </div> 
          `;
      }
    });
  }

  return replyHtml;
}

function getReplyAnswer(id) {
  let replyAnswer = `
  <div class="replies currentUserSendReply">
    <div class="vertical-stroke"></div>
    <div class="tweet-replies">
      <div class="current-user-comment">
        <div class="current-user-interaction">
          <img
            src="images/avatars/image-juliusomo.png"
            alt="current user profile picture"
            class="avatar"
          />
          <div class="fill-button-mobile">
            <button
              class="button-common"
              data-send-reply-btn="${id}"
            >
              Reply
            </button>
          </div>
        </div>
        <textarea name="" placeholder="Add a comment..." id="textareaReply${id}"></textarea>
        <button
          data-send-reply-btn="${id}"
          class="button-common common-button-display"
        >
          Reply
        </button>
        </div>
    </div>  
  </div> 
 
  `;
  return replyAnswer;
}

function sortData(dataDB) {
  dataDB.comments.sort((a, b) => {
    return b.score - a.score;
  });
  dataDB.comments.forEach((comment) => {
    comment.replies.sort((a, b) => {
      return a.createdAt - b.createdAt;
    });
  });
}

function getTimeElapsed(date) {
  const now = new Date().valueOf();
  const timeElapsed = now - date;

  const second = Math.floor(timeElapsed / 1000);
  const minute = Math.floor(timeElapsed / (1000 * 60));
  const hour = Math.floor(timeElapsed / (1000 * 60 * 60));
  const day = Math.floor(timeElapsed / (1000 * 60 * 60 * 24));
  const week = Math.floor(timeElapsed / (1000 * 60 * 60 * 24 * 7));
  const month = Math.floor(timeElapsed / (1000 * 60 * 60 * 24 * 30));

  if (second < 60) {
    if (second <= 1) return second + " second ago";
    return second + " seconds ago";
  }
  if (minute < 60) {
    if (minute <= 1) return minute + "minute ago";
    return minute + " minutes ago";
  }
  if (hour < 24) {
    if (hour <= 1) return hour + " hour ago";
    return hour + " hours ago";
  }
  if (day < 7) {
    if (day <= 1) return day + " day ago";
    return day + " days ago";
  }
  if (week < 4) {
    if (week <= 1) return week + " week ago";
    return week + " weeks ago ";
  }
  if (month <= 1) return month + " month ago";

  return month + "months ago";
}

function render(data) {
  sortData(data);
  document.getElementById("commentsContainerEl").innerHTML = getComments(data);
}

// render();
// !testing
const colRefTest = collection(db, "test");
const frankDocRef = doc(db, "test", "frank");
// await setDoc(frankDocRef, {
//   name: "Frank",
//   favorites: { food: "Pizza", color: "Blue", subject: "recess", score: 7 },
//   age: 12,
// });

// await updateDoc(frankDocRef, {
//   age: 13,
//   "favorites.color": ["Red", "Green", "Blue"],
// });

// onSnapshot(colRefTest, (querySnapshot) => {
//   querySnapshot.forEach((doc) => {
//     const dataDoc = doc.data().favorites.find((comment) => comment.id == 1);
//     console.log(dataDoc);

//     updateDoc(frankDocRef, {
//       favorites: arrayRemove(dataDoc),
//     });

//     let score = dataDoc.score;
//     score++;

//     dataDoc.score = score;

//     updateDoc(frankDocRef, { favorites: arrayUnion(dataDoc) });

//   });
// });

// function incrementTest() {
//   let isScore = false;
//   let score = "";
//   onSnapshot(colRefTest, (querySnapshot) => {
//     querySnapshot.forEach((doc) => {
//       let favoritesData = doc.data().favorites;
//       let exactFavoriteObj = favoritesData.find((fav) => fav.id == 9);
//       const index = favoritesData.indexOf(exactFavoriteObj);
//       const objToUpdate = favoritesData[index];
//       score = objToUpdate.score;
//       if (!isScore) {
//         score++;
//         isScore = true;
//       }
//       objToUpdate.score = score;
//       favoritesData[index] = objToUpdate;
//       // console.log(index);
//       // console.log(objToUpdate);
//       // console.log(exactFavoriteObj);
//       // console.log(favoritesData);
//       updateDoc(frankDocRef, {
//         favorites: favoritesData,
//       });
//     });
//   });
// }

// incrementTest();
